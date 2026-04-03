import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createAdminCategory, updateAdminCategory } from '../../services/adminService';
import { toast } from 'react-hot-toast';

const CategoryModal = ({ isOpen, onClose, category = null, allCategories = [] }) => {
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState({
        name: '',
        parent_id: '',
        is_active: true,
        image: null,
        description: ''
    });
    const [preview, setPreview] = useState(null);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            setErrors({});
            if (category) {
                setFormData({
                    name: category.name || '',
                    parent_id: category.parent_id || '',
                    is_active: !!category.is_active,
                    image: null,
                    description: category.description || ''
                });
                setPreview(category.image_url);
            } else {
                setFormData({
                    name: '',
                    parent_id: '',
                    is_active: true,
                    image: null,
                    description: ''
                });
                setPreview(null);
            }
        } else {
            document.body.style.overflow = 'unset';
        }
        
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [category, isOpen]);

    const mutation = useMutation({
        mutationFn: (data) => {
            if (category) {
                return updateAdminCategory({ id: category.id, formData: data });
            }
            return createAdminCategory(data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminCategories'] });
            toast.success(category ? 'Category updated successfully.' : 'Category added successfully.');
            onClose();
        },
        onError: (err) => {
            if (err.response?.status === 422) {
                setErrors(err.response.data.errors);
                toast.error('Validation failed. Please check the fields.');
            } else {
                toast.error(err.response?.data?.message || 'A system error occurred.');
            }
        }
    });

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        setErrors({});

        const data = new FormData();
        data.append('name', formData.name);
        data.append('parent_id', formData.parent_id || '');
        data.append('is_active', formData.is_active ? '1' : '0');
        data.append('description', formData.description || '');

        if (formData.image instanceof File) {
            data.append('image', formData.image);
        }

        if (category) {
            data.append('_method', 'PUT');
        }

        mutation.mutate(data);
    };

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-on-surface/20 backdrop-blur-sm animate-in fade-in duration-300 font-manrope">
            {/* Modal Card */}
            <div className="bg-surface-container-lowest w-full max-w-lg rounded-xl shadow-2xl overflow-hidden border border-outline-variant/20 animate-in zoom-in-95 duration-300 max-h-screen flex flex-col">
                <div className="px-8 pt-8 pb-6 border-b border-surface-container-low shrink-0 relative">
                    <button onClick={onClose} className="absolute top-8 right-8 text-on-surface-variant hover:text-on-surface transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                    <h3 className="text-2xl font-extrabold text-on-surface tracking-tight">
                        {category ? 'Edit Category' : 'Add Category'}
                    </h3>
                    <p className="text-on-surface-variant text-sm mt-1">
                        {category ? 'Update the details for this structural collection.' : 'Create a new organizational bucket for your atelier pieces.'}
                    </p>
                </div>

                <form id="category-modal-form" onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto no-scrollbar">
                    {/* Name Field */}
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-secondary mb-2">Category Name</label>
                        <input 
                            className={`w-full bg-surface-container-low border-none rounded-lg px-4 py-3 text-on-surface placeholder:text-on-surface-variant/40 outline-none focus:ring-2 focus:ring-secondary/20 transition-all ${errors.name ? 'ring-2 ring-error/50' : ''}`} 
                            placeholder="e.g. Linen Collection" 
                            type="text"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                        {errors.name && <p className="text-error text-xs font-bold mt-1.5 flex items-center gap-1"><span className="material-symbols-outlined text-sm">error</span> {errors.name[0]}</p>}
                    </div>

                    {/* Image Upload */}
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-secondary mb-2">Cover Image</label>
                        <div className={`group relative h-40 w-full bg-surface-container-low rounded-xl border-2 border-dashed flex flex-col items-center justify-center hover:bg-surface-container-high transition-colors cursor-pointer overflow-hidden ${errors.image ? 'border-error/50 bg-error-container/5' : 'border-outline-variant/30'}`}>
                            {preview ? (
                                <img src={preview} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Preview" />
                            ) : (
                                <div className="flex flex-col items-center text-on-surface-variant group-hover:text-on-surface transition-colors">
                                    <span className="material-symbols-outlined text-4xl mb-2">image</span>
                                    <p className="text-sm font-medium">Click to upload image</p>
                                    <p className="text-xs opacity-60">PNG, JPG up to 5MB</p>
                                </div>
                            )}
                            <input 
                                className="absolute inset-0 opacity-0 cursor-pointer" 
                                type="file" 
                                accept="image/*"
                                onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (file) {
                                        setFormData({ ...formData, image: file });
                                        setPreview(URL.createObjectURL(file));
                                    }
                                }}
                            />
                            {preview && (
                                <div className="absolute inset-0 bg-on-surface/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm pointer-events-none">
                                    <span className="text-on-primary text-[10px] font-bold uppercase tracking-widest">Update Imagery</span>
                                </div>
                            )}
                        </div>
                        {errors.image && <p className="text-error text-xs font-bold mt-1.5 flex items-center gap-1"><span className="material-symbols-outlined text-sm">error</span> {errors.image[0]}</p>}
                    </div>

                    {/* Parent & Status Row */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-secondary mb-2">Parent Name</label>
                            <div className="relative">
                                <select 
                                    className={`w-full bg-surface-container-low border-none rounded-lg px-4 py-3 text-on-surface appearance-none outline-none focus:ring-2 focus:ring-secondary/20 transition-all pr-10 ${errors.parent_id ? 'ring-2 ring-error/50' : ''}`}
                                    value={formData.parent_id || ''}
                                    onChange={e => setFormData({ ...formData, parent_id: e.target.value })}
                                >
                                    <option value="">None (Top Level)</option>
                                    {allCategories
                                        .filter(c => c.id !== category?.id && !c.parent_id)
                                        .map(c => <option key={c.id} value={c.id}>{c.name}</option>)
                                    }
                                </select>
                                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">expand_more</span>
                            </div>
                            {errors.parent_id && <p className="text-error text-xs font-bold mt-1.5 flex items-center gap-1"><span className="material-symbols-outlined text-sm">error</span> {errors.parent_id[0]}</p>}
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-secondary mb-4">Store Visibility</label>
                            <div className="flex items-center">
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        className="sr-only peer"
                                        checked={formData.is_active}
                                        onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                                    />
                                    <div className="w-11 h-6 bg-surface-container-high peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
                                    <span className="ml-3 text-sm font-medium text-on-surface">Active</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-secondary mb-2">Description</label>
                        <textarea 
                            className={`w-full bg-surface-container-low border-none rounded-lg px-4 py-3 text-on-surface placeholder:text-on-surface-variant/40 outline-none focus:ring-2 focus:ring-secondary/20 transition-all resize-none ${errors.description ? 'ring-2 ring-error/50' : ''}`} 
                            placeholder="Describe the aesthetic or purpose of this category..." 
                            rows="3"
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                        ></textarea>
                        {errors.description && <p className="text-error text-xs font-bold mt-1.5 flex items-center gap-1"><span className="material-symbols-outlined text-sm">error</span> {errors.description[0]}</p>}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-x-4 pt-4 shrink-0">
                        <button 
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2.5 rounded-full text-sm font-bold text-on-surface-variant border border-outline-variant/30 hover:bg-surface-container-low transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit"
                            disabled={mutation.isPending}
                            className="px-8 py-2.5 rounded-full text-sm font-bold text-on-primary bg-primary hover:opacity-90 transition-all active:scale-95 shadow-md shadow-primary/10 disabled:opacity-50 flex items-center gap-2"
                        >
                            {mutation.isPending ? (
                                <span className="material-symbols-outlined animate-spin text-sm" style={{ animationDirection: 'reverse' }}>progress_activity</span>
                            ) : null}
                            {category ? 'Update Category' : 'Add Category'}
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
};

export default CategoryModal;
