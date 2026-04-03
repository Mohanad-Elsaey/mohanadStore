import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, ChevronDown, Grid, List as ListIcon, X, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { getProducts } from '../services/productService';
import { getCategories } from '../services/categoryService';
import ProductCard from '../components/ui/ProductCard';
import Button from '../components/ui/Button';

const ShopPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    
    // Filters State
    const category = searchParams.get('category') || '';
    const sort = searchParams.get('sort') || 'newest';
    const minPrice = searchParams.get('min_price') || '';
    const maxPrice = searchParams.get('max_price') || '';
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');

    const { data, isLoading } = useQuery({
        queryKey: ['products', category, sort, minPrice, maxPrice, search, page],
        queryFn: () => getProducts({
            category_slug: category,
            sort_by: sort,
            min_price: minPrice,
            max_price: maxPrice,
            search: search,
            page: page
        }),
    });

    const { data: categories } = useQuery({
        queryKey: ['categories'],
        queryFn: getCategories,
    });

    const updateFilter = (key, value) => {
        const newParams = new URLSearchParams(searchParams);
        if (value) newParams.set(key, value);
        else newParams.delete(key);
        
        // Reset to page 1 when filter changes
        if (key !== 'page') newParams.delete('page');
        
        setSearchParams(newParams);
    };

    const clearFilters = () => {
        setSearchParams(new URLSearchParams());
    };

    return (
        <div className="bg-white pt-32 pb-24">
            <div className="max-w-7xl mx-auto px-6">
                
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-8">
                    <div className="space-y-4">
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Inventory</span>
                        <div className="flex items-baseline gap-4">
                            <h1 className="text-6xl font-black text-slate-900 tracking-tighter">ALL PRODUCTS</h1>
                            <span className="text-sm font-bold text-slate-300">({data?.meta?.total || 0} pieces)</span>
                        </div>
                    </div>
                    
                    {/* Sort & View Toggle */}
                    <div className="flex items-center gap-6">
                        <div className="relative group">
                            <select 
                                className="appearance-none bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 pr-12 text-sm font-bold text-slate-900 focus:outline-none focus:border-slate-900 transition-all cursor-pointer"
                                value={sort}
                                onChange={(e) => updateFilter('sort', e.target.value)}
                            >
                                <option value="newest">Sort by Newer</option>
                                <option value="price_asc">Price: Low to High</option>
                                <option value="price_desc">Price: High to Low</option>
                                <option value="rating">Best Rating</option>
                            </select>
                            <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-slate-400" />
                        </div>
                        <button 
                            className="lg:hidden p-4 bg-slate-900 text-white rounded-2xl shadow-xl active:scale-95 transition-transform"
                            onClick={() => setShowMobileFilters(true)}
                        >
                            <SlidersHorizontal className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 items-start">
                    
                    {/* Sidebar Filters (Desktop) */}
                    <aside className="hidden lg:block space-y-12 sticky top-32">
                        
                        {/* Categories */}
                        <div className="space-y-6">
                            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Categories</h4>
                            <div className="flex flex-col gap-3">
                                <button 
                                    onClick={() => updateFilter('category', '')}
                                    className={`text-left font-bold transition-all ${!category ? 'text-slate-900 text-lg translate-x-2' : 'text-slate-400 text-sm hover:text-slate-600'}`}
                                >
                                    All Products
                                </button>
                                {categories?.map((cat) => (
                                    <button 
                                        key={cat.id}
                                        onClick={() => updateFilter('category', cat.slug)}
                                        className={`text-left font-bold transition-all ${category === cat.slug ? 'text-slate-900 text-lg translate-x-2' : 'text-slate-400 text-sm hover:text-slate-600'}`}
                                    >
                                        {cat.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Search Removed */}

                        {/* Price Range */}
                        <div className="space-y-6">
                            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Price Range</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <input 
                                    type="number" 
                                    placeholder="Min"
                                    className="w-full bg-slate-50 border-2 border-slate-100 px-4 py-3 rounded-xl text-xs font-bold focus:border-slate-900 outline-none transition-all"
                                    value={minPrice}
                                    onChange={(e) => updateFilter('min_price', e.target.value)}
                                />
                                <input 
                                    type="number" 
                                    placeholder="Max"
                                    className="w-full bg-slate-50 border-2 border-slate-100 px-4 py-3 rounded-xl text-xs font-bold focus:border-slate-900 outline-none transition-all"
                                    value={maxPrice}
                                    onChange={(e) => updateFilter('max_price', e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Reset */}
                        <button 
                            className="w-full py-4 border-2 border-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:border-slate-900 hover:text-slate-900 transition-all"
                            onClick={clearFilters}
                        >
                            Reset All
                        </button>
                    </aside>

                    {/* Main Grid */}
                    <div className="lg:col-span-3">
                        {isLoading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                                {[...Array(6)].map((_, i) => <div key={i} className="aspect-[4/5] bg-slate-50 rounded-[2rem] animate-pulse" />)}
                            </div>
                        ) : (() => {
                            const products = data?.data || (Array.isArray(data) ? data : []);
                            
                            return (
                                <div className="space-y-20">
                                    {products.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                                            {products.map((product) => (
                                                <ProductCard key={product.id} product={product} />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="py-40 text-center space-y-6">
                                            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8">
                                                <Search className="w-10 h-10 text-slate-200" />
                                            </div>
                                            <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">NO RESULTS FOUND</h3>
                                            <p className="text-slate-400 font-bold max-w-xs mx-auto">Try adjusting your filters or search keywords to find what you're looking for.</p>
                                            <Button onClick={clearFilters} variant="secondary">Clear all filters</Button>
                                        </div>
                                    )}

                                    {/* Pagination Controls */}
                                    {data?.meta && data.meta.last_page > 1 && (
                                        <div className="flex flex-col items-center gap-8 pt-12 border-t border-slate-50">
                                            <div className="flex items-center gap-4">
                                                <button 
                                                    disabled={page === 1}
                                                    onClick={() => updateFilter('page', page - 1)}
                                                    className="w-12 h-12 bg-slate-50 border-2 border-slate-100 rounded-2xl flex items-center justify-center text-slate-600 hover:border-slate-900 hover:text-slate-900 transition-all disabled:opacity-30 disabled:pointer-events-none"
                                                >
                                                    <ChevronLeft className="w-5 h-5" />
                                                </button>

                                                <div className="flex items-center gap-2">
                                                    {[...Array(data.meta.last_page)].map((_, i) => {
                                                        const p = i + 1;
                                                        // Show limited page numbers if too many
                                                        if (p === 1 || p === data.meta.last_page || (p >= page - 1 && p <= page + 1)) {
                                                            return (
                                                                <button 
                                                                    key={p}
                                                                    onClick={() => updateFilter('page', p)}
                                                                    className={`w-12 h-12 rounded-2xl text-xs font-black transition-all ${page === p ? 'bg-slate-900 text-white shadow-xl scale-110' : 'bg-white border-2 border-slate-100 text-slate-400 hover:border-slate-900 hover:text-slate-900'}`}
                                                                >
                                                                    {p}
                                                                </button>
                                                            );
                                                        }
                                                        if (p === page - 2 || p === page + 2) return <span key={p} className="px-2 text-slate-300">...</span>;
                                                        return null;
                                                    })}
                                                </div>

                                                <button 
                                                    disabled={page === data.meta.last_page}
                                                    onClick={() => updateFilter('page', page + 1)}
                                                    className="w-12 h-12 bg-slate-50 border-2 border-slate-100 rounded-2xl flex items-center justify-center text-slate-600 hover:border-slate-900 hover:text-slate-900 transition-all disabled:opacity-30 disabled:pointer-events-none"
                                                >
                                                    <ChevronRight className="w-5 h-5" />
                                                </button>
                                            </div>
                                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300 italic">
                                                Page {page} of {data.meta.last_page}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            );
                        })()}
                    </div>
                </div>
            </div>

            {/* Mobile Filters Overlay */}
            {showMobileFilters && (
                <div className="fixed inset-0 z-[100] bg-white p-8 overflow-y-auto">
                    <div className="flex items-center justify-between mb-12">
                        <h3 className="text-3xl font-black tracking-tight text-slate-900">FILTER BY</h3>
                        <button onClick={() => setShowMobileFilters(false)} className="p-4 bg-slate-50 rounded-2xl">
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                    
                    <div className="space-y-16">
                        {/* Replicate Sidebar contents for mobile here */}
                        <div className="space-y-8">
                            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Collections</h4>
                            <div className="grid grid-cols-2 gap-4">
                                {categories?.map(cat => (
                                    <button 
                                        key={cat.id} 
                                        onClick={() => { updateFilter('category', cat.slug); setShowMobileFilters(false); }}
                                        className={`p-6 rounded-3xl font-bold text-sm transition-all ${category === cat.slug ? 'bg-slate-900 text-white shadow-xl' : 'bg-slate-50 text-slate-500'}`}
                                    >
                                        {cat.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                        {/* Add more for mobile as needed */}
                        <Button 
                            className="w-full py-8 text-xl rounded-[2.5rem]"
                            onClick={() => setShowMobileFilters(false)}
                        >
                            Apply Filters
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ShopPage;
