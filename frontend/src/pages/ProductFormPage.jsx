import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    Save, 
    X, 
    Upload, 
    Trash2, 
    Plus, 
    Minus, 
    Star, 
    Layout, 
    Type, 
    Tag, 
    DollarSign, 
    Database, 
    Image as ImageIcon,
    ChevronLeft
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getAdminCategories } from '../services/adminService';
import { getProductBySlug } from '../services/productService';
import axiosInstance from '../services/axiosInstance';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const ProductFormPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const isEdit = !!id;

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        sale_price: '',
        stock: '',
        category_id: '',
        is_active: true,
        is_featured: false,
    });

    const [variants, setVariants] = useState([]);
    const [images, setImages] = useState([]);
    const [previewImages, setPreviewImages] = useState([]);

    // Fetch Initial Data
    const { data: categories } = useQuery({
        queryKey: ['adminCategories'],
        queryFn: getAdminCategories,
    });

    const { data: productResp } = useQuery({
        queryKey: ['adminProduct', id],
        queryFn: () => axiosInstance.get(`/admin/products/${id}`).then(res => res.data),
        enabled: isEdit,
    });

    useEffect(() => {
        if (productResp?.data) {
            const p = productResp.data;
            setFormData({
                name: p.name,
                description: p.description || '',
                price: p.price,
                sale_price: p.sale_price || '',
                stock: p.stock,
                category_id: p.category_id,
                is_active: p.is_active,
                is_featured: p.is_featured,
            });
            setVariants(p.variants || []);
        }
    }, [productResp]);

    const addVariant = () => setVariants([...variants, { size: '', color: '', stock: 0 }]);
    const removeVariant = (index) => setVariants(variants.filter((_, i) => i !== index));
    const updateVariant = (index, field, value) => {
        const newVariants = [...variants];
        newVariants[index][field] = value;
        setVariants(newVariants);
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        setImages([...images, ...files]);
        
        const previews = files.map(file => URL.createObjectURL(file));
        setPreviewImages([...previewImages, ...previews]);
    };

    const saveMutation = useMutation({
        mutationFn: async (data) => {
            const form = new FormData();
            Object.keys(formData).forEach(key => {
                if (key !== 'category_id') form.append(key, formData[key]);
            });
            if (formData.category_id) {
                form.append('category_ids[]', formData.category_id);
            }
            form.append('variants', JSON.stringify(variants));
            images.forEach((img, i) => form.append(`images[${i}]`, img));

            if (isEdit) {
                // Laravel hack for PUT with files
                form.append('_method', 'PUT');
                return axiosInstance.post(`/admin/products/${id}`, form);
            }
            return axiosInstance.post('/admin/products', form);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['adminProducts']);
            toast.success(isEdit ? 'Unit parameters updated.' : 'New unit deployed.');
            navigate('/admin/products');
        },
        onError: (err) => {
            const errors = err.response?.data?.errors;
            if (errors) Object.values(errors).forEach(e => toast.error(e[0]));
            else toast.error('Deployment failure.');
        }
    });

    return (
        <div className="space-y-16">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
               <div className="space-y-4">
                  <div className="flex items-center gap-4 text-slate-400">
                      <button onClick={() => navigate(-1)} className="p-3 bg-white rounded-xl shadow-sm hover:bg-slate-900 hover:text-white transition-all"><ChevronLeft className="w-4 h-4" /></button>
                      <span className="text-[10px] font-black uppercase tracking-[0.5em]">Inventory Config</span>
                  </div>
                  <h1 className="text-6xl font-black text-slate-900 tracking-tighter uppercase italic leading-[0.8]">
                      {isEdit ? 'RECONFIGURE UNIT' : 'NEW DEPLOYMENT'}
                  </h1>
               </div>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(); }} className="grid grid-cols-1 lg:grid-cols-3 gap-16 items-start">
                
                {/* --- MAIN DATA --- */}
                <div className="lg:col-span-2 space-y-12">
                    
                    {/* Identification */}
                    <div className="bg-white rounded-[3.5rem] p-12 shadow-sm border border-slate-100 space-y-10 group">
                        <div className="flex items-center gap-4 border-b border-slate-50 pb-8">
                           <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white">
                              <Type className="w-6 h-6" />
                           </div>
                           <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic">IDENTIFICATION</h3>
                        </div>

                        <div className="space-y-8">
                            <Input label="Unit Designation" placeholder="Ex: Stealth Compression Hood" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-6 italic">Functional Description</label>
                                <textarea 
                                    placeholder="Technical specifications and material details..."
                                    className="w-full bg-slate-50 border-none px-8 py-6 rounded-[2.5rem] text-slate-800 placeholder:text-slate-300 focus:outline-none focus:bg-white focus:ring-4 focus:ring-slate-900/5 transition-all text-sm font-bold min-h-[200px]"
                                    value={formData.description}
                                    onChange={e => setFormData({...formData, description: e.target.value})}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Commercial Parameters */}
                    <div className="bg-white rounded-[3.5rem] p-12 shadow-sm border border-slate-100 space-y-10">
                        <div className="flex items-center gap-4 border-b border-slate-50 pb-8">
                           <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white">
                              <DollarSign className="w-6 h-6" />
                           </div>
                           <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic">EXCHANGE PARAMS</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <Input label="Standard Value" type="number" placeholder="0.00" required value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
                            <Input label="Incentive Price" type="number" placeholder="Optional" value={formData.sale_price} onChange={e => setFormData({...formData, sale_price: e.target.value})} />
                            <Input label="Initial Inventory" type="number" placeholder="Qty" required value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} />
                        </div>
                    </div>

                    {/* Variants Matrix */}
                    <div className="bg-white rounded-[3.5rem] p-12 shadow-sm border border-slate-100 space-y-10 relative overflow-hidden">
                        <div className="flex items-center justify-between border-b border-slate-50 pb-8">
                           <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white">
                                 <Layout className="w-6 h-6" />
                              </div>
                              <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic">CONFIG MATRIX</h3>
                           </div>
                           <button type="button" onClick={addVariant} className="flex items-center gap-2 px-6 py-3 bg-slate-50 hover:bg-slate-900 hover:text-white rounded-2xl transition-all text-[10px] font-black uppercase tracking-widest text-slate-500 italic">
                               <Plus className="w-4 h-4" /> Add Protocol
                           </button>
                        </div>

                        <div className="space-y-6">
                            {variants.map((v, i) => (
                                <div key={i} className="grid grid-cols-1 md:grid-cols-4 gap-6 p-6 bg-slate-50 rounded-3xl items-end relative group/v">
                                    <Input label="Size" placeholder="XL, 42, OS" value={v.size} onChange={e => updateVariant(i, 'size', e.target.value)} />
                                    <Input label="Tone" placeholder="Black, Matte" value={v.color} onChange={e => updateVariant(i, 'color', e.target.value)} />
                                    <Input label="Unit Count" type="number" value={v.stock} onChange={e => updateVariant(i, 'stock', e.target.value)} />
                                    <button 
                                        type="button" 
                                        onClick={() => removeVariant(i)}
                                        className="h-[68px] bg-red-50 text-red-500 rounded-[1.5rem] flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-sm group/btn"
                                    >
                                        <Trash2 className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                                    </button>
                                </div>
                            ))}
                            {variants.length === 0 && <p className="text-center py-10 text-slate-300 font-bold italic uppercase text-xs tracking-[0.2em]">No custom configurations defined.</p>}
                        </div>
                    </div>
                </div>

                {/* --- SIDE COMMANDS --- */}
                <div className="space-y-12 lg:sticky lg:top-32">
                    
                    {/* Status & Categorization */}
                    <div className="bg-slate-950 rounded-[3.5rem] p-12 text-white shadow-3xl space-y-12">
                        <div className="space-y-8">
                            <div className="space-y-4">
                               <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 block italic">Sector Assignment</label>
                               <select 
                                   className="w-full bg-slate-900 border-none px-8 py-5 rounded-2xl text-sm font-black uppercase tracking-widest text-white appearance-none focus:ring-4 focus:ring-amber-400/20 outline-none cursor-pointer"
                                   value={formData.category_id}
                                   onChange={e => setFormData({...formData, category_id: e.target.value})}
                               >
                                   <option value="">Select Sector...</option>
                                   {categories?.data?.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                               </select>
                            </div>

                            <div className="space-y-6 pt-8 border-t border-white/5">
                                <label className="flex items-center justify-between cursor-pointer group">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-white transition-colors">Visible in Dimension</span>
                                    <input type="checkbox" checked={formData.is_active} onChange={e => setFormData({...formData, is_active: e.target.checked})} className="hidden" />
                                    <div className={`w-14 h-8 rounded-full p-1 transition-all ${formData.is_active ? 'bg-emerald-500' : 'bg-slate-800'}`}>
                                        <div className={`w-6 h-6 bg-white rounded-full transition-all transform ${formData.is_active ? 'translate-x-6 shadow-xl' : 'translate-x-0'}`} />
                                    </div>
                                </label>
                                <label className="flex items-center justify-between cursor-pointer group">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-white transition-colors text-amber-500 italic">Priority Showcase</span>
                                    <input type="checkbox" checked={formData.is_featured} onChange={e => setFormData({...formData, is_featured: e.target.checked})} className="hidden" />
                                    <div className={`w-14 h-8 rounded-full p-1 transition-all ${formData.is_featured ? 'bg-amber-400' : 'bg-slate-800'}`}>
                                        <div className={`w-6 h-6 bg-white rounded-full transition-all transform ${formData.is_featured ? 'translate-x-6 shadow-xl' : 'translate-x-0'}`} />
                                    </div>
                                </label>
                            </div>
                        </div>

                        <Button 
                            type="submit"
                            loading={saveMutation.isLoading}
                            className={`w-full py-10 rounded-[3rem] text-xl font-black uppercase italic shadow-2xl transition-all ${isEdit ? 'bg-white text-slate-950 hover:bg-slate-200' : 'bg-amber-400 text-slate-950 hover:bg-amber-300'}`}
                        >
                           {isEdit ? 'UPDATE UNIT' : 'DEPLOY NOW'} <Save className="ml-3 w-6 h-6" />
                        </Button>
                    </div>

                    {/* Image Relay */}
                    <div className="bg-white rounded-[3.5rem] p-10 border border-slate-100 shadow-sm space-y-10 group">
                        <div className="flex items-center justify-between">
                           <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">VISUAL RELAY</h4>
                           <ImageIcon className="w-5 h-5 text-slate-200" />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            {previewImages.map((src, i) => (
                                <div key={i} className="aspect-[4/5] bg-slate-50 rounded-3xl overflow-hidden relative shadow-sm hover:scale-105 transition-transform group/img">
                                    <img src={src} className="w-full h-full object-cover grayscale opacity-80 group-hover/img:grayscale-0 group-hover/img:opacity-100 transition-all" />
                                    <button 
                                        type="button"
                                        onClick={() => { setPreviewImages(previewImages.filter((_, idx)=>idx!==i)); setImages(images.filter((_, idx)=>idx!==i)); }}
                                        className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-md rounded-xl text-red-500 shadow-sm opacity-0 group-hover/img:opacity-100 transition-all"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                            <label className="aspect-[4/5] bg-slate-50 border-4 border-dashed border-slate-100 rounded-3xl flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-slate-100 hover:border-slate-900 transition-all group/up shadow-inner">
                                <Upload className="w-8 h-8 text-slate-200 group-hover/up:text-slate-900 transition-colors animate-pulse" />
                                <span className="text-[10px] font-black uppercase text-slate-300 group-hover/up:text-slate-900 tracking-widest text-center px-4">Upload Media</span>
                                <input type="file" multiple onChange={handleImageChange} className="hidden" />
                            </label>
                        </div>
                    </div>

                </div>

            </form>
        </div>
    );
};

export default ProductFormPage;
