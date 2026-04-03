import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getCategories } from '../services/categoryService';
import { ChevronRight, LayoutGrid, ShoppingBag, ArrowRight } from 'lucide-react';

const CategoriesPage = () => {
    const { data: categories, isLoading } = useQuery({
        queryKey: ['categories'],
        queryFn: getCategories,
    });

    if (isLoading) {
        return (
            <div className="pt-40 pb-40 text-center">
                <div className="inline-block w-12 h-12 border-4 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-8 font-black text-slate-400 uppercase tracking-widest text-[10px]">Loading Collections... جاري التحميل</p>
            </div>
        );
    }

    return (
        <div className="bg-white min-h-screen">
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap');`}</style>
            
            {/* ── Header Area ────────────────────────── */}
            <header className="pt-32 pb-20 border-b border-slate-100">
                <div className="max-w-7xl mx-auto px-6 lg:px-12">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                        <div>
                            <div className="flex items-baseline gap-3">
                                <h1 className="text-6xl md:text-8xl font-black text-slate-950 tracking-tighter uppercase italic leading-none">
                                    Categories
                                </h1>
                                <span className="text-3xl font-bold text-slate-300" style={{ fontFamily: "'Cairo', sans-serif" }}>
                                    · التصنيفات
                                </span>
                            </div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-6 italic">
                                Explore our curated collections · استكشف مجموعاتنا المختارة
                            </p>
                        </div>
                        <div className="flex items-center gap-4 bg-slate-50 px-6 py-4 rounded-2xl border border-slate-100 italic">
                            <LayoutGrid className="w-5 h-5 text-slate-900" />
                            <span className="text-sm font-black text-slate-900">{categories?.length || 0} Collections</span>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 lg:px-12 py-20">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {categories?.map((category) => (
                        <Link 
                            key={category.id} 
                            to={`/category/${category.slug}`}
                            className="group relative bg-slate-50 rounded-[2.5rem] p-10 h-[400px] flex flex-col justify-between overflow-hidden border border-slate-100 hover:border-slate-900 transition-all duration-500 hover:-translate-y-2 shadow-sm hover:shadow-2xl shadow-slate-900/5"
                        >
                            {/* Decorative logic or background */}
                            <div className="absolute top-0 right-0 p-12 opacity-5 scale-150 rotate-12 group-hover:scale-110 transition-transform duration-700">
                                <ShoppingBag className="w-48 h-48 text-slate-900" />
                            </div>

                            <div className="relative z-10">
                                <div className="flex justify-between items-start">
                                    <div className="w-16 h-1 bg-slate-900 rounded-full group-hover:w-24 transition-all duration-500" />
                                    <ArrowRight className="w-6 h-6 text-slate-300 group-hover:text-slate-900 transition-colors" />
                                </div>
                                <div className="mt-8 space-y-2">
                                    <h3 className="text-4xl font-black text-slate-950 uppercase italic tracking-tighter leading-tight">
                                        {category.name}
                                    </h3>
                                    <p className="text-slate-400 font-bold text-sm" style={{ fontFamily: "'Cairo', sans-serif" }}>
                                        {category.name_ar || 'تصنيف متميز'}
                                    </p>
                                </div>
                            </div>

                            <div className="relative z-10 flex items-end justify-between">
                                <div className="space-y-4">
                                    <p className="text-slate-500 text-xs font-medium max-w-[200px] leading-relaxed line-clamp-2">
                                        {category.description || `Browse our exclusive collection of ${category.name} and related accessories.`}
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <span className="bg-white px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest text-slate-900 shadow-sm border border-slate-100 italic">
                                            {category.products_count || 0} Items
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </main>
        </div>
    );
};

export default CategoriesPage;
