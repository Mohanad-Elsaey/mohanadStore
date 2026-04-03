import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { getAdminCategories, deleteAdminCategory } from '../services/adminService';
import CategoryModal from '../components/admin/CategoryModal';

const AdminCategories = () => {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [deleteId, setDeleteId] = useState(null);
    const [search, setSearch] = useState('');

    const { data: categoriesResp, isLoading, isError } = useQuery({
        queryKey: ['adminCategories'],
        queryFn: getAdminCategories,
    });

    const allCategories = categoriesResp?.data || [];
    
    // Derived Metrics
    const metrics = useMemo(() => {
        const total = allCategories.length;
        const active = allCategories.filter(c => c.is_active).length;
        const hidden = total - active;
        return { total, active, hidden };
    }, [allCategories]);

    // Group children under parents for better visibility and apply search filter
    const displayCategories = useMemo(() => {
        const categories = [];
        const parentCategories = allCategories
            .filter(cat => !cat.parent_id)
            .sort((a, b) => b.id - a.id);

        parentCategories.forEach(parent => {
            categories.push(parent);
            const children = allCategories
                .filter(child => child.parent_id === parent.id)
                .sort((a, b) => b.id - a.id);
            categories.push(...children);
        });

        if (!search) return categories;
        
        return categories.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || Boolean(c.slug && c.slug.toLowerCase().includes(search.toLowerCase())));
    }, [allCategories, search]);

    const handleEdit = (cat) => {
        setSelectedCategory(cat);
        setIsModalOpen(true);
    };

    const handleAdd = () => {
        setSelectedCategory(null);
        setIsModalOpen(true);
    };

    const deleteMutation = useMutation({
        mutationFn: deleteAdminCategory,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminCategories'] });
            toast.success('Category removed successfully.');
            setDeleteId(null);
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || 'Delete operation failed.');
            setDeleteId(null);
        }
    });

    const confirmDelete = (id) => {
        setDeleteId(id);
    };

    if (isLoading) return (
        <div className="flex flex-col items-center justify-center py-40 space-y-6 font-manrope">
            <span className="material-symbols-outlined animate-spin text-4xl text-primary" style={{ animationDirection: 'reverse' }}>progress_activity</span>
            <p className="font-bold text-on-surface-variant text-sm uppercase tracking-widest">Loading Categories</p>
        </div>
    );

    if (isError) return (
        <div className="flex flex-col items-center justify-center py-40 space-y-4 font-manrope text-center">
            <span className="material-symbols-outlined text-6xl text-error mb-2">cloud_off</span>
            <h3 className="text-2xl font-extrabold text-on-surface tracking-tight">Connection Failure</h3>
            <p className="text-on-surface-variant max-w-sm">Unable to retrieve category grid data. Please check your network and try again.</p>
        </div>
    );

    return (
        <div className="font-manrope animate-in fade-in duration-700 pb-20">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <div>
                    <h2 className="text-5xl font-extrabold text-on-surface tracking-tighter leading-none mb-2">Category Management</h2>
                    <p className="text-on-surface-variant font-body text-lg max-w-xl">Organize and manage your product collections with editorial precision.</p>
                </div>
                <button 
                    onClick={handleAdd}
                    className="bg-primary text-on-primary font-manrope font-bold py-4 px-8 rounded-full flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all duration-300 shadow-lg shadow-primary/10 shrink-0"
                >
                    <span className="material-symbols-outlined" data-icon="add">add</span>
                    <span>Add Category</span>
                </button>
            </div>

            {/* Metric Cards (Bento Style) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div className="bg-surface-container-lowest p-8 rounded-xl border border-outline-variant/10 flex flex-col gap-4 shadow-sm group hover:shadow-md hover:border-outline-variant/20 transition-all duration-300">
                    <div className="flex items-center justify-between">
                        <span className="text-xs uppercase tracking-widest text-secondary font-bold">Total Categories</span>
                        <div className="w-10 h-10 rounded-full bg-secondary-container/50 text-secondary flex items-center justify-center overflow-hidden">
                            <span className="material-symbols-outlined">list_alt</span>
                        </div>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-extrabold tracking-tighter">{metrics.total}</span>
                    </div>
                </div>
                
                <div className="bg-surface-container-lowest p-8 rounded-xl border border-outline-variant/10 flex flex-col gap-4 shadow-sm group hover:shadow-md hover:border-outline-variant/20 transition-all duration-300">
                    <div className="flex items-center justify-between">
                        <span className="text-xs uppercase tracking-widest text-secondary font-bold">Active Collections</span>
                        <div className="w-10 h-10 rounded-full bg-primary-container/30 text-primary flex items-center justify-center overflow-hidden">
                            <span className="material-symbols-outlined">visibility</span>
                        </div>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-extrabold tracking-tighter">{metrics.active}</span>
                        <span className="text-sm text-on-surface-variant">Live in store</span>
                    </div>
                </div>
                
                <div className="bg-surface-container-lowest p-8 rounded-xl border border-outline-variant/10 flex flex-col gap-4 shadow-sm group hover:shadow-md hover:border-outline-variant/20 transition-all duration-300">
                    <div className="flex items-center justify-between">
                        <span className="text-xs uppercase tracking-widest text-secondary font-bold">Hidden Categories</span>
                        <div className="w-10 h-10 rounded-full bg-error-container/10 text-error flex items-center justify-center overflow-hidden">
                            <span className="material-symbols-outlined">visibility_off</span>
                        </div>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-extrabold tracking-tighter">{metrics.hidden}</span>
                        <span className="text-sm text-on-surface-variant font-medium">Draft/Archived</span>
                    </div>
                </div>
            </div>

            {/* Table Controls */}
            <div className="bg-surface-container-lowest rounded-t-xl overflow-hidden border border-outline-variant/10 border-b-0 px-8 py-5 flex items-center justify-between">
                <div className="relative w-full max-w-sm">
                    <span className="material-symbols-outlined absolute left-0 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
                    <input 
                        className="w-full bg-transparent border-none pl-8 pr-4 py-2 text-sm focus:ring-0 outline-none text-on-surface placeholder:text-on-surface-variant/50 font-medium font-manrope" 
                        placeholder="Search collections..." 
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Table Section */}
            <div className="bg-surface-container-lowest rounded-b-xl shadow-sm overflow-hidden border border-outline-variant/10">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="bg-surface-container-low/30">
                                <th className="px-8 py-5 text-[10px] uppercase tracking-widest font-bold text-on-surface-variant border-none w-24">Thumbnail</th>
                                <th className="px-8 py-5 text-[10px] uppercase tracking-widest font-bold text-on-surface-variant border-none">Category Name</th>
                                <th className="px-8 py-5 text-[10px] uppercase tracking-widest font-bold text-on-surface-variant border-none">Product Count</th>
                                <th className="px-8 py-5 text-[10px] uppercase tracking-widest font-bold text-on-surface-variant border-none">Status</th>
                                <th className="px-8 py-5 text-[10px] uppercase tracking-widest font-bold text-on-surface-variant border-none">Tier Info</th>
                                <th className="px-8 py-5 text-[10px] uppercase tracking-widest font-bold text-on-surface-variant border-none text-right w-40">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant/5">
                            {displayCategories.length > 0 ? displayCategories.map((cat) => (
                                <tr key={cat.id} className={`hover:bg-surface-container-low/30 transition-colors duration-300 group ${cat.parent_id ? 'bg-surface-container-low/10' : ''} ${!cat.is_active ? 'opacity-70' : ''}`}>
                                    <td className="px-8 py-5">
                                        <div className={`w-14 h-14 rounded-lg overflow-hidden bg-surface-container-low border border-outline-variant/10 ${!cat.is_active ? 'grayscale' : ''} ${cat.parent_id ? 'ml-6 w-10 h-10' : ''}`}>
                                            <img 
                                                src={cat.image_url} 
                                                alt={cat.name} 
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 bg-surface-container-low" 
                                                onError={(e) => e.target.src = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" fill="%23f2f4f4"><rect width="400" height="400"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" font-family="sans-serif" font-size="20" fill="%23adb3b4">NO IMAGE</text></svg>')}`} 
                                            />
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex flex-col">
                                            <span className={`font-bold text-on-surface ${cat.parent_id ? 'text-sm' : 'text-base'}`}>{cat.name}</span>
                                            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mt-0.5 opacity-60">ID: {cat.id}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className="text-on-surface-variant font-bold text-sm bg-surface-container-low/50 px-3 py-1 rounded-lg">{cat.products_count || 0} Products</span>
                                    </td>
                                    <td className="px-8 py-5">
                                        {cat.is_active ? (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-700">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Active
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-surface-container-high text-on-surface-variant">
                                                <span className="w-1.5 h-1.5 rounded-full bg-on-surface-variant"></span> Inactive
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className="text-xs font-bold text-on-surface-variant">
                                            {cat.parent_id ? 'Subcategory' : 'Primary Collection'}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        {deleteId === cat.id ? (
                                            <div className="flex items-center justify-end gap-2 animate-in fade-in slide-in-from-right-2 duration-300">
                                                <button 
                                                    onClick={() => setDeleteId(null)}
                                                    className="w-8 h-8 rounded-lg border border-outline-variant/30 flex items-center justify-center text-on-surface-variant hover:bg-surface-container-low transition-colors"
                                                    title="Cancel"
                                                >
                                                    <span className="material-symbols-outlined text-sm">close</span>
                                                </button>
                                                <button 
                                                    onClick={() => deleteMutation.mutate(cat.id)}
                                                    className="w-8 h-8 rounded-lg bg-error text-on-error flex items-center justify-center hover:opacity-90 active:scale-95 transition-all shadow-sm"
                                                    title="Confirm Delete"
                                                >
                                                    <span className="material-symbols-outlined text-sm">check</span>
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button 
                                                    onClick={() => handleEdit(cat)}
                                                    className="p-2 hover:bg-surface-container-high rounded-lg transition-colors text-on-surface-variant hover:text-primary"
                                                    title="Edit Category"
                                                >
                                                    <span className="material-symbols-outlined text-xl">edit</span>
                                                </button>
                                                <button 
                                                    onClick={() => confirmDelete(cat.id)}
                                                    className="p-2 hover:bg-error-container/20 rounded-lg transition-colors text-on-surface-variant hover:text-error"
                                                    title="Delete Category"
                                                >
                                                    <span className="material-symbols-outlined text-xl">delete</span>
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="6" className="py-24 text-center">
                                        <div className="flex flex-col items-center gap-4 text-on-surface-variant/50">
                                            <span className="material-symbols-outlined text-6xl">category</span>
                                            <h3 className="text-xl font-bold text-on-surface mb-1">No Categories Found</h3>
                                            <p className="text-sm max-w-sm mx-auto">Categories help organize products. Click "Add Category" to create one.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Contextual Help / Info Section */}
            <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-12 border-t border-outline-variant/10 pt-16">
                <div>
                    <h3 className="text-xl font-bold mb-4">Editorial Collections</h3>
                    <p className="text-on-surface-variant leading-relaxed text-sm">
                        Categories at Mohanad are more than just filters; they are curated narratives. We recommend grouping items by seasonal palette or architectural silhouettes rather than purely by garment type.
                    </p>
                </div>
                <div>
                    <h3 className="text-xl font-bold mb-4">Management Tips</h3>
                    <ul className="space-y-3">
                        <li className="flex items-start gap-3 text-on-surface-variant text-sm">
                            <span className="material-symbols-outlined text-primary text-xl">auto_awesome</span>
                            <span>High-resolution thumbnails (1:1 ratio) significantly improve shop browsing experience.</span>
                        </li>
                        <li className="flex items-start gap-3 text-on-surface-variant text-sm">
                            <span className="material-symbols-outlined text-primary text-xl">history</span>
                            <span>Inactive categories will not appear on the storefront but will remain accessible in the inventory.</span>
                        </li>
                    </ul>
                </div>
            </div>

            <CategoryModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                category={selectedCategory}
                allCategories={allCategories}
            />
        </div>
    );
};

export default AdminCategories;
