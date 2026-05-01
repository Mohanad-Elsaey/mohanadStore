import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { createAdminProduct, updateAdminProduct, deleteProductImage } from '../../services/adminService';

const ProductModal = ({ isOpen, onClose, product, categories }) => {
    const queryClient = useQueryClient();
    const fileInputRef = useRef(null);
    
    const [formData, setFormData] = useState({
        name: '',
        category_ids: [],
        price: '',
        sku: '',
        stock: '',
        description: '',
        is_active: 1,
        is_featured: 0,
        images: [],
        variants: []
    });

    const [previews, setPreviews] = useState([]);
    const [existingImages, setExistingImages] = useState([]);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            setErrors({});
            if (product) {
                setFormData({
                    name: product.name || '',
                    category_ids: product.categories?.map(c => c.id) || (product.category_id ? [product.category_id] : []),
                    price: product.price || '',
                    sku: product.sku || '',
                    stock: product.stock || '',
                    description: product.description || '',
                    is_active: product.is_active ? 1 : 0,
                    is_featured: product.is_featured ? 1 : 0,
                    images: [],
                    variants: product.variants?.map(v => ({
                        type: v.type,
                        value: v.value,
                        price_override: v.price_override || '',
                        stock: v.stock || 0
                    })) || []
                });
                const existing = product.images?.map(img => ({ id: img.id, image_path: img.image_path })) || [];
                setExistingImages(existing);
                setPreviews(existing.map(img => img.image_path));
            } else {
                setFormData({
                    name: '',
                    category_ids: [],
                    price: '',
                    sku: '',
                    stock: '',
                    description: '',
                    is_active: 1,
                    is_featured: 0,
                    images: [],
                    variants: []
                });
                setPreviews([]);
                setExistingImages([]);
            }
        } else {
            document.body.style.overflow = 'unset';
        }
        
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [product, isOpen]);

    const mutation = useMutation({
        mutationFn: (data) => {
            if (product) {
                return updateAdminProduct({ id: product.id, formData: data });
            }
            return createAdminProduct(data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
            queryClient.invalidateQueries({ queryKey: ['adminStats'] });
            toast.success(product ? 'Product parameters updated successfully.' : 'New product deployed to catalog.');
            onClose();
        },
        onError: (err) => {
            if (err.response?.status === 422) {
                const backendErrors = err.response.data.errors || {};
                setErrors(backendErrors);
                toast.error('Validation failed. Please review the inputs.');
            } else {
                toast.error(err.response?.data?.message || 'A system malfunction occurred.');
            }
        }
    });

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (checked ? 1 : 0) : value
        }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            setFormData(prev => ({ ...prev, images: [...prev.images, ...files] }));
            
            files.forEach(file => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setPreviews(prev => [...prev, reader.result]);
                };
                reader.readAsDataURL(file);
            });
            if (errors.images) setErrors(prev => ({ ...prev, images: null }));
        }
    };

    const removeImage = async (index) => {
        const existingCount = existingImages.length;
        
        if (index < existingCount) {
            // This is an existing image from the server — call the API to delete it
            const imageToDelete = existingImages[index];
            try {
                await deleteProductImage({ productId: product.id, imageId: imageToDelete.id });
                setExistingImages(prev => prev.filter((_, i) => i !== index));
                setPreviews(prev => prev.filter((_, i) => i !== index));
                toast.success('Image deleted successfully.');
            } catch (err) {
                toast.error('Failed to delete image from server.');
                console.error('Delete image error:', err);
            }
        } else {
            // This is a newly-added image (not yet saved) — just remove from local state
            const newImageIndex = index - existingCount;
            setFormData(prev => ({
                ...prev,
                images: prev.images.filter((_, i) => i !== newImageIndex)
            }));
            setPreviews(prev => prev.filter((_, i) => i !== index));
        }
    };

    const addVariant = () => {
        setFormData(prev => ({
            ...prev,
            variants: [...prev.variants, { type: 'size', value: '', price_override: '', stock: 0 }]
        }));
    };

    const removeVariant = (index) => {
        setFormData(prev => ({
            ...prev,
            variants: prev.variants.filter((_, i) => i !== index)
        }));
    };

    const handleVariantChange = (index, field, value) => {
        const updatedVariants = [...formData.variants];
        updatedVariants[index][field] = value;
        setFormData(prev => ({ ...prev, variants: updatedVariants }));
    };

    const toggleCategory = (catId) => {
        setFormData(prev => ({
            ...prev,
            category_ids: prev.category_ids.includes(catId) 
                ? prev.category_ids.filter(id => id !== catId)
                : [...prev.category_ids, catId]
        }));
        if (errors.category_ids) {
            setErrors(prev => ({ ...prev, category_ids: null }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        const data = new FormData();
        Object.keys(formData).forEach(key => {
            if (key === 'images') {
                formData.images.forEach(file => {
                    data.append('images[]', file);
                });
            } else if (key === 'variants') {
                formData.variants.forEach((variant, index) => {
                    data.append(`variants[${index}][type]`, variant.type);
                    data.append(`variants[${index}][value]`, variant.value);
                    if (variant.price_override) {
                        data.append(`variants[${index}][price_override]`, variant.price_override);
                    }
                    data.append(`variants[${index}][stock]`, variant.stock);
                });
            } else if (key === 'category_ids') {
                formData.category_ids.forEach(id => {
                    data.append('category_ids[]', id);
                });
            } else {
                data.append(key, formData[key]);
            }
        });

        if (product) {
            data.append('_method', 'PUT');
        }

        mutation.mutate(data);
    };

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-on-surface/20 backdrop-blur-sm animate-in fade-in duration-300 font-manrope">
            {/* Modal Box */}
            <div className="bg-surface-container-lowest w-full max-w-5xl rounded-xl shadow-2xl overflow-hidden border border-outline-variant/20 animate-in zoom-in-95 duration-300 max-h-screen flex flex-col">
                {/* Header */}
                <div className="px-8 pt-8 pb-6 border-b border-surface-container-low shrink-0 relative flex justify-between items-center bg-surface-container-lowest">
                    <div>
                        <h3 className="text-2xl font-extrabold text-on-surface tracking-tight">
                            {product ? 'Edit Product Configuration' : 'Deploy New Product'}
                        </h3>
                        <p className="text-on-surface-variant text-sm mt-1">
                            {product ? `Updating parameters for SKU: ${formData.sku || 'N/A'}` : 'Establish inventory parameters and design visual relays.'}
                        </p>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container-low text-on-surface-variant hover:text-on-surface transition-colors"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <form id="product-modal-form" onSubmit={handleSubmit} className="overflow-y-auto p-8 space-y-10 no-scrollbar relative flex-1">
                    
                    {/* Error Display */}
                    {Object.values(errors).some(v => v) && (
                        <div className="p-5 bg-error-container/20 border border-error/30 rounded-xl flex items-start gap-3">
                            <span className="material-symbols-outlined text-error mt-0.5">error</span>
                            <div>
                                <h4 className="text-sm font-bold text-error uppercase tracking-widest leading-none mb-2">Protocol Validation Failure</h4>
                                <ul className="list-disc list-inside space-y-1">
                                    {Object.entries(errors).filter(([, msgs]) => msgs).map(([field, msgs]) => (
                                        <li key={field} className="text-xs text-error/80 font-medium font-mono">
                                            <span className="font-bold underline uppercase">{field.replace('_', ' ')}</span>: {msgs[0]}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                        {/* Media Studio */}
                        <div className="lg:col-span-4 space-y-8">
                            <div className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/10">
                                <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-secondary mb-4">
                                    <span className="material-symbols-outlined text-[18px]">photo_library</span>
                                    Visual Media
                                </label>
                                
                                <div className="grid grid-cols-2 gap-3 mb-4">
                                    {previews.map((src, idx) => (
                                        <div key={idx} className="relative aspect-[4/5] rounded-xl overflow-hidden group border border-outline-variant/20 shadow-sm">
                                            <img src={src} alt="Preview" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                            <button 
                                                type="button"
                                                onClick={() => removeImage(idx)}
                                                className="absolute top-2 right-2 bg-on-surface/50 backdrop-blur-md text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-error"
                                            >
                                                <span className="material-symbols-outlined text-[14px]">close</span>
                                            </button>
                                        </div>
                                    ))}
                                    <div 
                                        onClick={() => fileInputRef.current?.click()}
                                        className="aspect-[4/5] rounded-xl border-2 border-dashed border-outline-variant/30 bg-surface-container-highest hover:bg-surface-variant hover:border-outline-variant/60 flex flex-col items-center justify-center cursor-pointer transition-all"
                                    >
                                        <span className="material-symbols-outlined text-3xl text-on-surface-variant mb-2">add_photo_alternate</span>
                                        <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Connect Media</span>
                                    </div>
                                </div>

                                <input 
                                    type="file" 
                                    ref={fileInputRef}
                                    onChange={handleImageChange}
                                    className="hidden" 
                                    accept="image/*"
                                    multiple
                                />
                                {errors.images && <p className="mt-2 text-[10px] font-bold text-error uppercase flex items-center gap-1"><span className="material-symbols-outlined text-sm">error</span> {errors.images[0]}</p>}
                            </div>

                            {/* Switches */}
                            <div className="space-y-4">
                                <div className="p-5 bg-surface-container-lowest rounded-2xl border border-outline-variant/20 flex items-center justify-between shadow-sm">
                                    <div>
                                        <span className="block text-sm font-bold text-on-surface mb-0.5">Online Status</span>
                                        <span className="block text-xs text-on-surface-variant">{formData.is_active ? 'Visible in storefront' : 'Hidden from catalog'}</span>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            name="is_active"
                                            className="sr-only peer"
                                            checked={formData.is_active === 1}
                                            onChange={handleInputChange}
                                        />
                                        <div className="w-11 h-6 bg-surface-container-high peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
                                    </label>
                                </div>

                                <div className="p-5 bg-secondary-container/30 rounded-2xl border border-secondary-container flex items-center justify-between shadow-sm">
                                    <div className="flex items-center gap-4">
                                        <span className={`material-symbols-outlined ${formData.is_featured ? 'text-secondary fill-secondary' : 'text-secondary/40'}`}>star</span>
                                        <div>
                                            <span className="block text-sm font-bold text-on-secondary-container mb-0.5">Featured Item</span>
                                            <span className="block text-xs text-on-secondary-container/70">Pin to main carousel</span>
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            name="is_featured"
                                            className="sr-only peer"
                                            checked={formData.is_featured === 1}
                                            onChange={handleInputChange}
                                        />
                                        <div className="w-11 h-6 bg-surface-container-high peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Data Matrix */}
                        <div className="lg:col-span-8 space-y-8">
                            
                            {/* Product Nomenclature */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-secondary mb-2">Unit Designation</label>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">style</span>
                                    <input 
                                        type="text" 
                                        name="name"
                                        placeholder="E.g. Linen Overcoat"
                                        className={`w-full bg-surface-container-low border-none rounded-xl py-3.5 pl-12 pr-4 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-secondary/20 transition-all outline-none text-on-surface placeholder:text-on-surface-variant/50 ${errors.name ? 'ring-2 ring-error/50' : ''}`}
                                        value={formData.name}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                {errors.name && <p className="text-error text-[10px] font-bold mt-1.5 flex items-center gap-1"><span className="material-symbols-outlined text-sm">error</span> {errors.name[0]}</p>}
                            </div>

                            {/* Classification Engine */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-secondary mb-3 mt-8 border-t border-surface-container-low pt-8">Network Taxonomy</label>
                                <div className="flex flex-wrap gap-2">
                                    {categories?.map(cat => (
                                        <button
                                            key={cat.id}
                                            type="button"
                                            onClick={() => toggleCategory(cat.id)}
                                            className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all border ${
                                                formData.category_ids.includes(cat.id)
                                                    ? 'bg-secondary text-on-secondary border-secondary shadow-md scale-105'
                                                    : 'bg-surface-container-low text-on-surface border-transparent hover:border-outline-variant/30'
                                            }`}
                                        >
                                            {cat.name}
                                        </button>
                                    ))}
                                </div>
                                {errors.category_ids && <p className="text-error text-[10px] font-bold mt-3 flex items-center gap-1"><span className="material-symbols-outlined text-sm">error</span> {errors.category_ids[0]}</p>}
                            </div>

                            {/* Exchange Params */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-surface-container-low">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-secondary mb-2">Base Valuation</label>
                                    <div className="relative">
                                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">payments</span>
                                        <input 
                                            type="number" 
                                            name="price"
                                            placeholder="0.00"
                                            className={`w-full bg-surface-container-low border-none rounded-xl py-3.5 pl-12 pr-4 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-secondary/20 transition-all outline-none text-on-surface placeholder:text-on-surface-variant/50 ${errors.price ? 'ring-2 ring-error/50' : ''}`}
                                            value={formData.price}
                                            onChange={handleInputChange}
                                            step="0.01"
                                        />
                                    </div>
                                    {errors.price && <p className="text-error text-[10px] font-bold mt-1.5 flex items-center gap-1"><span className="material-symbols-outlined text-sm">error</span> {errors.price[0]}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-secondary mb-2">Unit SKU</label>
                                    <div className="relative">
                                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">qr_code_2</span>
                                        <input 
                                            type="text" 
                                            name="sku"
                                            placeholder="E.g. AL-9002"
                                            className={`w-full bg-surface-container-low border-none rounded-xl py-3.5 pl-12 pr-4 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-secondary/20 transition-all outline-none text-on-surface font-mono placeholder:text-on-surface-variant/50 ${errors.sku ? 'ring-2 ring-error/50' : ''}`}
                                            value={formData.sku}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    {errors.sku && <p className="text-error text-[10px] font-bold mt-1.5 flex items-center gap-1"><span className="material-symbols-outlined text-sm">error</span> {errors.sku[0]}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-secondary mb-2">Master Inventory</label>
                                    <div className="relative">
                                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">inventory_2</span>
                                        <input 
                                            type="number" 
                                            name="stock"
                                            placeholder="Total Qty"
                                            className={`w-full bg-surface-container-low border-none rounded-xl py-3.5 pl-12 pr-4 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-secondary/20 transition-all outline-none text-on-surface placeholder:text-on-surface-variant/50 ${errors.stock ? 'ring-2 ring-error/50' : ''}`}
                                            value={formData.stock}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    {errors.stock && <p className="text-error text-[10px] font-bold mt-1.5 flex items-center gap-1"><span className="material-symbols-outlined text-sm">error</span> {errors.stock[0]}</p>}
                                </div>
                            </div>

                            {/* Config Matrix (Variants) */}
                            <div className="pt-8 border-t border-surface-container-low space-y-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-widest text-secondary">Configuration Matrix</label>
                                        <p className="text-[10px] font-medium text-on-surface-variant mt-1">Establish alternative metrics like Color or Dimension.</p>
                                    </div>
                                    <button 
                                        type="button" 
                                        onClick={addVariant}
                                        className="flex items-center gap-2 bg-primary text-on-primary px-4 py-2 rounded-full hover:bg-primary-dim transition-colors text-xs font-bold shadow-sm"
                                    >
                                        <span className="material-symbols-outlined text-[16px]">add</span>
                                        Add Protocol
                                    </button>
                                </div>

                                <div className="grid gap-4">
                                    {formData.variants.map((variant, idx) => {
                                        const sizeOptions = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45'];
                                        const colorOptions = [
                                            { name: 'Black', hex: '#1a1a1a' },
                                            { name: 'White', hex: '#f5f5f5' },
                                            { name: 'Red', hex: '#e53935' },
                                            { name: 'Blue', hex: '#1e88e5' },
                                            { name: 'Navy', hex: '#1a237e' },
                                            { name: 'Green', hex: '#43a047' },
                                            { name: 'Yellow', hex: '#fdd835' },
                                            { name: 'Pink', hex: '#e91e63' },
                                            { name: 'Purple', hex: '#8e24aa' },
                                            { name: 'Orange', hex: '#fb8c00' },
                                            { name: 'Brown', hex: '#6d4c41' },
                                            { name: 'Gray', hex: '#9e9e9e' },
                                            { name: 'Beige', hex: '#d4c5a9' },
                                            { name: 'Olive', hex: '#827717' },
                                            { name: 'Burgundy', hex: '#880e4f' },
                                        ];
                                        const materialOptions = ['Cotton', 'Linen', 'Silk', 'Polyester', 'Wool', 'Denim', 'Leather', 'Satin', 'Chiffon', 'Velvet', 'Cashmere', 'Nylon'];

                                        return (
                                        <div key={idx} className="p-5 bg-surface-container-highest rounded-2xl border border-outline-variant/10 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] space-y-4">
                                            {/* Top row: Type selector + Price + Stock + Delete */}
                                            <div className="flex items-center gap-3 flex-wrap">
                                                <div className="bg-surface-container-low flex items-center px-1 rounded-lg">
                                                    <select 
                                                        value={variant.type} 
                                                        onChange={(e) => { handleVariantChange(idx, 'type', e.target.value); handleVariantChange(idx, 'value', ''); }}
                                                        className="bg-transparent border-none py-2 px-3 text-xs font-bold text-on-surface outline-none cursor-pointer pr-6 hover:text-primary transition-colors focus:ring-0"
                                                    >
                                                        <option value="size">Size</option>
                                                        <option value="color">Color</option>
                                                        <option value="material">Material</option>
                                                    </select>
                                                </div>

                                                <div className="relative flex-1 min-w-[120px]">
                                                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50 text-[14px]">price_change</span>
                                                    <input 
                                                        type="number" 
                                                        value={variant.price_override} 
                                                        onChange={(e) => handleVariantChange(idx, 'price_override', e.target.value)}
                                                        placeholder="Price Override"
                                                        className="w-full bg-surface-container-low border-none rounded-lg py-2.5 pl-8 pr-4 text-xs font-bold text-on-surface outline-none placeholder:text-on-surface-variant/40 focus:ring-2 focus:ring-primary/20"
                                                    />
                                                </div>

                                                <div className="relative flex-1 min-w-[120px]">
                                                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50 text-[14px]">inventory</span>
                                                    <input 
                                                        type="number" 
                                                        value={variant.stock} 
                                                        onChange={(e) => handleVariantChange(idx, 'stock', e.target.value)}
                                                        placeholder="Stock"
                                                        className="w-full bg-surface-container-low border-none rounded-lg py-2.5 pl-8 pr-4 text-xs font-bold text-on-surface outline-none placeholder:text-on-surface-variant/40 focus:ring-2 focus:ring-primary/20"
                                                    />
                                                </div>

                                                <button 
                                                    type="button" 
                                                    onClick={() => removeVariant(idx)}
                                                    className="w-8 h-8 flex items-center justify-center bg-error-container/50 text-error hover:bg-error hover:text-on-error rounded-lg transition-all shrink-0"
                                                >
                                                    <span className="material-symbols-outlined text-[18px]">delete</span>
                                                </button>
                                            </div>

                                            {/* Value picker based on type */}
                                            <div>
                                                <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2.5">
                                                    {variant.type === 'size' ? 'Select Size' : variant.type === 'color' ? 'Select Color' : 'Select Material'}
                                                </p>

                                                {variant.type === 'size' && (
                                                    <div className="flex flex-wrap gap-2">
                                                        {sizeOptions.map(size => (
                                                            <button
                                                                key={size}
                                                                type="button"
                                                                onClick={() => handleVariantChange(idx, 'value', size)}
                                                                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                                                                    variant.value === size
                                                                        ? 'bg-secondary text-on-secondary border-secondary shadow-md scale-105'
                                                                        : 'bg-surface-container-low text-on-surface-variant border-transparent hover:border-outline-variant/30 hover:bg-surface-container-highest'
                                                                }`}
                                                            >
                                                                {size}
                                                            </button>
                                                        ))}
                                                        <input 
                                                            type="text" 
                                                            value={sizeOptions.includes(variant.value) ? '' : variant.value}
                                                            onChange={(e) => handleVariantChange(idx, 'value', e.target.value)}
                                                            placeholder="Custom..."
                                                            className="w-24 bg-surface-container-low border border-dashed border-outline-variant/30 rounded-lg py-1.5 px-3 text-xs font-bold text-on-surface outline-none placeholder:text-on-surface-variant/40 focus:ring-2 focus:ring-primary/20 focus:border-transparent"
                                                        />
                                                    </div>
                                                )}

                                                {variant.type === 'color' && (
                                                    <div className="flex flex-wrap gap-2.5">
                                                        {colorOptions.map(color => (
                                                            <button
                                                                key={color.name}
                                                                type="button"
                                                                onClick={() => handleVariantChange(idx, 'value', color.name)}
                                                                title={color.name}
                                                                className={`group relative w-9 h-9 rounded-full transition-all ${
                                                                    variant.value === color.name
                                                                        ? 'ring-2 ring-secondary ring-offset-2 scale-110 shadow-lg'
                                                                        : 'hover:scale-110 hover:shadow-md'
                                                                }`}
                                                                style={{ backgroundColor: color.hex }}
                                                            >
                                                                {variant.value === color.name && (
                                                                    <span className="material-symbols-outlined absolute inset-0 flex items-center justify-center text-[16px] font-bold" style={{ color: ['White', 'Yellow', 'Beige'].includes(color.name) ? '#333' : '#fff' }}>check</span>
                                                                )}
                                                                <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] font-bold text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">{color.name}</span>
                                                            </button>
                                                        ))}
                                                        <input 
                                                            type="text" 
                                                            value={colorOptions.some(c => c.name === variant.value) ? '' : variant.value}
                                                            onChange={(e) => handleVariantChange(idx, 'value', e.target.value)}
                                                            placeholder="Custom color..."
                                                            className="w-28 bg-surface-container-low border border-dashed border-outline-variant/30 rounded-full py-1.5 px-3 text-xs font-bold text-on-surface outline-none placeholder:text-on-surface-variant/40 focus:ring-2 focus:ring-primary/20 focus:border-transparent self-center"
                                                        />
                                                    </div>
                                                )}

                                                {variant.type === 'material' && (
                                                    <div className="flex flex-wrap gap-2">
                                                        {materialOptions.map(mat => (
                                                            <button
                                                                key={mat}
                                                                type="button"
                                                                onClick={() => handleVariantChange(idx, 'value', mat)}
                                                                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                                                                    variant.value === mat
                                                                        ? 'bg-secondary text-on-secondary border-secondary shadow-md scale-105'
                                                                        : 'bg-surface-container-low text-on-surface-variant border-transparent hover:border-outline-variant/30 hover:bg-surface-container-highest'
                                                                }`}
                                                            >
                                                                {mat}
                                                            </button>
                                                        ))}
                                                        <input 
                                                            type="text" 
                                                            value={materialOptions.includes(variant.value) ? '' : variant.value}
                                                            onChange={(e) => handleVariantChange(idx, 'value', e.target.value)}
                                                            placeholder="Custom..."
                                                            className="w-24 bg-surface-container-low border border-dashed border-outline-variant/30 rounded-lg py-1.5 px-3 text-xs font-bold text-on-surface outline-none placeholder:text-on-surface-variant/40 focus:ring-2 focus:ring-primary/20 focus:border-transparent"
                                                        />
                                                    </div>
                                                )}

                                                {/* Show selected value badge */}
                                                {variant.value && (
                                                    <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-primary-container/30 rounded-full">
                                                        <span className="material-symbols-outlined text-[14px] text-primary">check_circle</span>
                                                        <span className="text-[11px] font-bold text-on-primary-container">
                                                            Selected: <span className="text-primary">{variant.value}</span>
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        );
                                    })}
                                    {formData.variants.length === 0 && (
                                        <div className="py-10 border-2 border-dashed border-outline-variant/20 rounded-2xl flex flex-col items-center justify-center text-center bg-surface-container-lowest">
                                            <span className="material-symbols-outlined text-4xl text-outline-variant/40 mb-3">account_tree</span>
                                            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">No configurations active</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Description Log */}
                            <div className="pt-8 border-t border-surface-container-low">
                                <label className="block text-xs font-bold uppercase tracking-widest text-secondary mb-2">Technical Description</label>
                                <textarea 
                                    name="description"
                                    rows="4" 
                                    placeholder="Elaborate on the aesthetic parameters, materials, and genesis of this piece..."
                                    className={`w-full bg-surface-container-low border-none rounded-2xl py-4 px-5 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-secondary/20 transition-all outline-none resize-none text-on-surface placeholder:text-on-surface-variant/50 ${errors.description ? 'ring-2 ring-error/50' : ''}`}
                                    value={formData.description}
                                    onChange={handleInputChange}
                                />
                                {errors.description && <p className="text-error text-[10px] font-bold mt-1.5 flex items-center gap-1"><span className="material-symbols-outlined text-sm">error</span> {errors.description[0]}</p>}
                            </div>
                        </div>
                    </div>
                </form>

                {/* Footer Canvas */}
                <div className="p-6 border-t border-surface-container-low flex items-center justify-end gap-x-4 shrink-0 bg-surface-container-lowest">
                    <button 
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-full text-sm font-bold text-on-surface-variant border border-outline-variant/30 hover:bg-surface-container-low transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        form="product-modal-form"
                        type="submit"
                        disabled={mutation.isPending}
                        className="px-8 py-2.5 rounded-full text-sm font-bold text-on-primary bg-primary hover:bg-primary-dim transition-all active:scale-95 shadow-md shadow-primary/10 disabled:opacity-50 flex items-center gap-2"
                    >
                        {mutation.isPending ? (
                            <span className="material-symbols-outlined animate-spin text-sm" style={{ animationDirection: 'reverse' }}>progress_activity</span>
                        ) : null}
                        {product ? 'Synchronize Updates' : 'Save Product'}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default ProductModal;
