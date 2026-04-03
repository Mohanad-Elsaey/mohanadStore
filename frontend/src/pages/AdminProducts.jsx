import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { getAdminProducts, getAdminStats, getAdminCategories, deleteAdminProduct } from '../services/adminService';
import ProductModal from '../components/admin/ProductModal';

const AdminProducts = () => {
    const queryClient = useQueryClient();
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [categoryId, setCategoryId] = useState('All Categories');
    const [status, setStatus] = useState('All Status');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [deleteId, setDeleteId] = useState(null);

    const { data: productsResp, isLoading: isProductsLoading, isError } = useQuery({
        queryKey: ['adminProducts', page, search, categoryId, status, minPrice, maxPrice],
        queryFn: () => getAdminProducts({
            page,
            search,
            category_id: categoryId,
            is_active: status,
            min_price: minPrice,
            max_price: maxPrice
        }),
    });

    const { data: statsResp } = useQuery({
        queryKey: ['adminStats'],
        queryFn: getAdminStats,
    });

    const { data: categoriesResp } = useQuery({
        queryKey: ['adminCategories'],
        queryFn: getAdminCategories,
    });

    const categories = categoriesResp?.data || [];
    const products = productsResp?.data || [];
    const meta = productsResp?.meta || { last_page: 1, current_page: 1 };
    const summary = statsResp?.data?.summary || {};

    const deleteMutation = useMutation({
        mutationFn: deleteAdminProduct,
        onSuccess: () => {
             queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
             queryClient.invalidateQueries({ queryKey: ['adminStats'] });
             toast.success('Product deleted successfully.');
             setDeleteId(null);
        },
        onError: (err) => {
             toast.error(err.response?.data?.message || 'Failed to delete product.');
             setDeleteId(null);
        }
    });

    const handleEdit = (product) => {
        setSelectedProduct(product);
        setIsModalOpen(true);
    };

    const handleAdd = () => {
        setSelectedProduct(null);
        setIsModalOpen(true);
    };

    const resetFilters = () => {
        setSearch('');
        setCategoryId('All Categories');
        setStatus('All Status');
        setMinPrice('');
        setMaxPrice('');
        setPage(1);
    };

    if (isProductsLoading) return (
        <div className="flex flex-col items-center justify-center py-40 space-y-6 font-manrope">
            <span className="material-symbols-outlined animate-spin text-4xl text-primary" style={{ animationDirection: 'reverse' }}>progress_activity</span>
            <p className="font-bold text-on-surface-variant text-sm uppercase tracking-widest">Loading products</p>
        </div>
    );

    if (isError) return (
        <div className="text-center py-40 bg-surface-container-lowest rounded-3xl border border-outline-variant/10 shadow-sm mx-10 mt-10 font-manrope">
            <span className="material-symbols-outlined text-6xl text-error mb-6">warning</span>
            <h3 className="text-2xl font-bold text-on-surface">Inventory Sync Error</h3>
            <p className="text-on-surface-variant mt-3 text-sm">We couldn't fetch the product list. Please try again.</p>
            <button onClick={() => window.location.reload()} className="mt-8 px-10 py-4 bg-primary text-on-primary font-bold text-xs rounded-full shadow-lg transition-transform hover:-translate-y-1">Retry</button>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto space-y-12 font-manrope animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-on-surface">Products</h2>
                    <p className="text-on-surface-variant mt-2">Manage your atelier's digital catalog and inventory levels.</p>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <button className="flex items-center justify-center gap-2 px-6 py-3 border border-outline-variant/30 text-on-surface font-semibold rounded-full hover:bg-surface-container-low transition-all">
                        <span className="material-symbols-outlined text-sm" data-icon="ios_share">ios_share</span>
                        Export
                    </button>
                    <button 
                        onClick={handleAdd}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-3 bg-primary text-on-primary font-semibold rounded-full hover:shadow-lg transition-all active:opacity-80 disabled:opacity-50"
                    >
                        <span className="material-symbols-outlined" data-icon="add">add</span>
                        Add Product
                    </button>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 bg-surface-container-lowest rounded-2xl border border-outline-variant/10 transition-all hover:-translate-y-1 hover:shadow-sm">
                    <p className="text-sm font-bold uppercase tracking-widest text-on-surface-variant">Total Products</p>
                    <div className="flex items-center justify-between mt-2">
                        <span className="text-3xl font-extrabold">{summary?.total_products || products.length}</span>
                        <div className="p-2 bg-primary-container/30 rounded-full">
                            <span className="material-symbols-outlined text-primary" data-icon="inventory">inventory</span>
                        </div>
                    </div>
                </div>
                <div className="p-6 bg-surface-container-lowest rounded-2xl border border-outline-variant/10 transition-all hover:-translate-y-1 hover:shadow-sm">
                    <p className="text-sm font-bold uppercase tracking-widest text-on-surface-variant">Inventory Value</p>
                    <div className="flex items-center justify-between mt-2">
                        <span className="text-3xl font-extrabold text-emerald-600">${Number(summary?.inventory_value || 0).toLocaleString()}</span>
                        <div className="p-2 bg-emerald-50 rounded-full">
                            <span className="material-symbols-outlined text-emerald-600" data-icon="payments">payments</span>
                        </div>
                    </div>
                </div>
                <div className={`p-6 bg-surface-container-lowest rounded-2xl border border-outline-variant/10 transition-all hover:-translate-y-1 hover:shadow-sm ${summary?.stock_alerts_count > 0 ? 'bg-error-container/5 border-error/20' : ''}`}>
                    <p className="text-sm font-bold uppercase tracking-widest text-on-surface-variant">Stock Alerts</p>
                    <div className="flex items-center justify-between mt-2">
                        <span className={`text-3xl font-extrabold ${summary?.stock_alerts_count > 0 ? 'text-secondary' : 'text-on-surface'}`}>{summary?.stock_alerts_count || 0}</span>
                        <div className="p-2 bg-secondary-container/30 rounded-full">
                            <span className="material-symbols-outlined text-secondary" data-icon="warning">warning</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter & Table Canvas */}
            <div className="bg-surface-container-lowest rounded-2xl overflow-hidden border border-outline-variant/10 shadow-[0_2px_10px_rgba(45,52,53,0.02)]">
                {/* Filters */}
                <div className="p-6 border-b border-surface-container-low flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="flex flex-wrap gap-3 items-center w-full md:w-auto flex-1">
                        <div className="relative max-w-xs w-full lg:w-72">
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50 text-sm">search</span>
                            <input 
                                className="w-full bg-surface-container-low border-none rounded-full py-2.5 pl-10 pr-5 text-sm font-manrope focus:ring-1 focus:ring-primary/20 transition-all text-on-surface placeholder-on-surface-variant/50" 
                                placeholder="Search products..." 
                                type="text"
                                value={search}
                                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                            />
                        </div>
                        <select 
                            className="bg-surface-container-low border-none rounded-full py-2.5 px-5 text-sm font-manrope pr-10 focus:ring-1 focus:ring-primary/20 text-on-surface cursor-pointer"
                            value={categoryId}
                            onChange={(e) => { setCategoryId(e.target.value); setPage(1); }}
                        >
                            <option value="All Categories">All Categories</option>
                            {categories?.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                        <select 
                            className="bg-surface-container-low border-none rounded-full py-2.5 px-5 text-sm font-manrope pr-10 focus:ring-1 focus:ring-primary/20 text-on-surface cursor-pointer"
                            value={status}
                            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
                        >
                            <option value="All Status">All Status</option>
                            <option value="Published">Online</option>
                            <option value="Draft">Draft</option>
                            <option value="Out of Stock">Out of Stock</option>
                        </select>
                    </div>
                    <button 
                        onClick={resetFilters}
                        className="flex items-center gap-2 text-sm font-bold text-on-surface-variant hover:text-on-surface transition-colors whitespace-nowrap"
                    >
                        <span className="material-symbols-outlined text-lg" data-icon="refresh">refresh</span>
                        Reset Filters
                    </button>
                </div>

                {/* Products Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-surface-container-low/30 text-[11px] font-bold uppercase tracking-wider text-on-surface-variant border-b border-surface-container-low">
                                <th className="px-6 py-4 w-10 text-center">Id</th>
                                <th className="px-6 py-4">Product</th>
                                <th className="px-6 py-4">Category</th>
                                <th className="px-6 py-4">SKU</th>
                                <th className="px-6 py-4 text-right">Price</th>
                                <th className="px-6 py-4 text-center">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-surface-container-low">
                            {products.length > 0 ? products.map((product) => {
                                const stockNum = Number(product.stock);
                                let statusUi = null;
                                if (!product.is_active) {
                                    statusUi = (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-surface-variant text-on-surface-variant">
                                            <span className="h-1.5 w-1.5 rounded-full bg-on-surface-variant"></span>
                                            Draft
                                        </span>
                                    );
                                } else if (stockNum <= 0) {
                                    statusUi = (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-error-container/20 text-error border border-error/10">
                                            <span className="h-1.5 w-1.5 rounded-full bg-error"></span>
                                            Out of Stock
                                        </span>
                                    );
                                } else if (stockNum <= 5) {
                                    statusUi = (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-secondary-container text-on-secondary-container border border-secondary/10">
                                            <span className="h-1.5 w-1.5 rounded-full bg-secondary"></span>
                                            Low Stock
                                        </span>
                                    );
                                } else {
                                    statusUi = (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary-container text-on-primary-container border border-primary/10">
                                            <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
                                            In Stock
                                        </span>
                                    );
                                }

                                return (
                                    <tr key={product.id} className="hover:bg-surface-container-lowest transition-colors group cursor-pointer" onClick={() => handleEdit(product)}>
                                        <td className="px-6 py-4 text-center text-xs font-bold text-on-surface-variant/50">
                                            {String(product.id).padStart(3, '0')}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <img 
                                                    className="h-12 w-10 object-cover rounded-lg shadow-sm bg-surface-container-low group-hover:scale-110 transition-transform duration-500" 
                                                    src={product.image_url || 'https://via.placeholder.com/40x48'} 
                                                    alt={product.name} 
                                                    onError={(e) => { e.target.src = 'https://via.placeholder.com/40x48?text=N/A' }}
                                                />
                                                <div>
                                                    <p className="font-bold text-sm text-on-surface group-hover:text-primary transition-colors line-clamp-1">{product.name}</p>
                                                    <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mt-0.5">{product.is_featured ? 'Featured Piece' : 'Standard Item'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-xs font-bold text-on-surface-variant">{product.category?.name || 'Uncategorized'}</td>
                                        <td className="px-6 py-4 text-xs font-mono text-on-surface-variant tracking-wider">{product.sku || 'N/A'}</td>
                                        <td className="px-6 py-4 text-sm font-bold text-on-surface text-right">${parseFloat(product.price).toFixed(2)}</td>
                                        <td className="px-6 py-4 text-center">
                                            {statusUi}
                                        </td>
                                        <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                                            {deleteId === product.id ? (
                                                <div className="flex items-center justify-end gap-2 animate-fade-in">
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(product.id); }}
                                                        className="bg-error text-on-error px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest hover:bg-error-dim transition-colors"
                                                    >
                                                        Confirm
                                                    </button>
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); setDeleteId(null); }}
                                                        className="text-on-surface-variant hover:text-on-surface px-2 py-1.5 text-[9px] font-bold uppercase tracking-widest"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); handleEdit(product); }}
                                                        className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-surface-container-low rounded-lg transition-all"
                                                        title="Edit Product"
                                                    >
                                                        <span className="material-symbols-outlined text-[20px]" data-icon="edit">edit</span>
                                                    </button>
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); setDeleteId(product.id); }}
                                                        className="p-1.5 text-on-surface-variant hover:text-error hover:bg-error-container/20 rounded-lg transition-all"
                                                        title="Delete Product"
                                                    >
                                                        <span className="material-symbols-outlined text-[20px]" data-icon="delete">delete</span>
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                );
                            }) : (
                                <tr>
                                    <td colSpan="7" className="py-20 text-center">
                                        <span className="material-symbols-outlined text-4xl text-on-surface-variant/30 mb-4" data-icon="inventory_2">inventory_2</span>
                                        <p className="text-lg font-bold text-on-surface-variant mb-1">No products found</p>
                                        <p className="text-xs text-on-surface-variant/70 mb-4">Try adjusting your search criteria or add a new product.</p>
                                        <button onClick={resetFilters} className="text-xs font-bold text-primary hover:underline underline-offset-4">Clear Filters</button>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {meta?.last_page > 1 && (
                    <div className="p-6 bg-surface-container-low/10 border-t border-surface-container-low flex flex-col md:flex-row items-center justify-between gap-4">
                        <p className="text-xs text-on-surface-variant font-medium">
                            Showing <span className="font-bold text-on-surface">{meta?.from || 0}-{meta?.to || 0}</span> of <span className="font-bold text-on-surface">{meta?.total || 0}</span> products
                        </p>
                        <div className="flex gap-2">
                            <button 
                                disabled={page === 1}
                                onClick={() => setPage(page - 1)}
                                className="px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-full border border-outline-variant/30 hover:bg-surface-container-low transition-all disabled:opacity-30 disabled:hover:bg-transparent"
                            >
                                Previous
                            </button>
                            <div className="hidden sm:flex items-center px-2 gap-2">
                                {[...Array(meta?.last_page || 0)].map((_, i) => {
                                    const p = i + 1;
                                    // simple windowing for pagination
                                    if (p === 1 || p === meta.last_page || (p >= page - 1 && p <= page + 1)) {
                                        return (
                                            <button 
                                                key={p}
                                                onClick={() => setPage(p)}
                                                className={`h-8 w-8 flex items-center justify-center rounded-full text-xs font-bold transition-colors ${page === p ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:bg-surface-container-low'}`}
                                            >
                                                {p}
                                            </button>
                                        );
                                    }
                                    if (p === page - 2 || p === page + 2) {
                                        return <span key={p} className="text-xs text-on-surface-variant">...</span>;
                                    }
                                    return null;
                                })}
                            </div>
                            <button 
                                disabled={page >= meta?.last_page}
                                onClick={() => setPage(page + 1)}
                                className="px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-full border border-outline-variant/30 hover:bg-surface-container-low transition-all disabled:opacity-30 disabled:hover:bg-transparent"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <ProductModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                product={selectedProduct}
                categories={categories}
            />
        </div>
    );
};

export default AdminProducts;
