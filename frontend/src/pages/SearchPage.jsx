import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams, Link } from 'react-router-dom';
import { 
    Search, 
    Filter, 
    ArrowRight, 
    LayoutGrid, 
    List, 
    SlidersHorizontal,
    X,
    Rocket
} from 'lucide-react';
import { getProducts } from '../services/productService';
import ProductCard from '../components/ui/ProductCard';
import Button from '../components/ui/Button';

const SearchPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const query = searchParams.get('q') || '';
    const [searchQuery, setSearchQuery] = useState(query);

    const { data: productsResp, isLoading } = useQuery({
        queryKey: ['searchProducts', query],
        queryFn: () => getProducts({ search: query }),
        enabled: query.length > 0
    });

    const products = productsResp?.data || [];

    const handleSearch = (e) => {
        e.preventDefault();
        setSearchParams({ q: searchQuery });
    };

    return (
        <div className="min-h-screen bg-white">
            
            {/* Search Header */}
            <div className="pt-40 pb-20 bg-slate-50 border-b border-slate-100 px-6">
                <div className="max-w-[1000px] mx-auto space-y-12 text-center">
                    <div className="space-y-4">
                        <span className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400">Dimension Scan</span>
                        <h1 className="text-6xl font-black text-slate-900 tracking-tighter uppercase italic leading-[0.8]">
                           {query ? `Results for "${query}"` : 'EXPLORE THE VOID'}
                        </h1>
                    </div>

                    <form onSubmit={handleSearch} className="relative group max-w-2xl mx-auto">
                        <input 
                            type="text" 
                            className="w-full bg-white border-4 border-slate-100 px-12 py-8 rounded-[3rem] text-xl font-black placeholder:text-slate-200 focus:outline-none focus:border-slate-900 focus:ring-20 focus:ring-slate-900/5 transition-all shadow-xl"
                            placeholder="Scan for units, categories, protocols..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 p-5 bg-slate-900 text-white rounded-[2rem] hover:scale-110 active:scale-95 transition-all shadow-2xl">
                            <Search className="w-6 h-6" />
                        </button>
                    </form>

                    {query && (
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                           System detected <span className="text-slate-900">{products.length} units</span> matching your frequency
                        </p>
                    )}
                </div>
            </div>

            {/* Results Grid */}
            <div className="max-w-[1400px] mx-auto py-24 px-6">
                {isLoading ? (
                    <div className="text-center py-40">
                         <div className="w-24 h-24 border-8 border-slate-100 border-t-slate-900 rounded-full animate-spin mx-auto mb-10" />
                         <p className="font-black text-slate-300 uppercase italic tracking-widest">Decoding Stream...</p>
                    </div>
                ) : products.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-16">
                        {products.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                ) : query && (
                    <div className="text-center py-40 space-y-12">
                       <div className="inline-flex items-center justify-center w-32 h-32 bg-slate-50 rounded-[3rem] text-slate-200 animate-pulse">
                          <X className="w-16 h-16" />
                       </div>
                       <div className="space-y-4">
                          <h2 className="text-4xl font-black tracking-tighter uppercase italic">NO SIGNAL DETECTED</h2>
                          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest max-w-md mx-auto leading-relaxed">The requested frequency returns no valid units. Adjust your transmission and try again.</p>
                       </div>
                       <div className="flex justify-center gap-6">
                           <Button onClick={() => setSearchQuery('')} variant="secondary" className="px-10 py-6 rounded-[2rem] border-2 border-slate-100 font-black uppercase italic text-xs">Clear Filter</Button>
                           <Link to="/shop">
                               <Button className="bg-slate-900 text-white px-10 py-6 rounded-[2rem] font-black uppercase italic text-xs">Return to Base</Button>
                           </Link>
                       </div>
                    </div>
                )}

                {!query && !isLoading && (
                    <div className="text-center py-40 space-y-16">
                        <div className="space-y-6">
                            <h3 className="text-2xl font-black uppercase italic tracking-tighter text-slate-400">RECOGNIZED FREQUENCIES</h3>
                            <div className="flex flex-wrap justify-center gap-4">
                               {['Performance', 'Aesthetics', 'Outerwear', 'Core', 'Vortex', 'Pulse'].map(tag => (
                                   <button 
                                      key={tag} 
                                      onClick={() => { setSearchQuery(tag); setSearchParams({ q: tag }); }}
                                      className="px-8 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black uppercase tracking-widest text-[10px] text-slate-500 hover:bg-slate-900 hover:text-white transition-all shadow-sm"
                                   >
                                      {tag}
                                   </button>
                               ))}
                            </div>
                        </div>

                        <div className="bg-slate-950 rounded-[4rem] p-20 text-white relative overflow-hidden group">
                           <div className="relative z-10 space-y-8">
                               <Rocket className="w-16 h-16 text-amber-400 fill-current mb-4 group-hover:translate-x-4 transition-transform duration-1000" />
                               <h2 className="text-5xl font-black tracking-tighter uppercase italic leading-[0.9]">ACCELERATED SEARCH</h2>
                               <p className="text-slate-400 text-sm font-bold uppercase tracking-widest leading-relaxed max-w-lg">Our neural scan protocol indexes entire dimensions within milliseconds. Find exactly what you need for your mission.</p>
                           </div>
                           <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-white/5 to-transparent flex items-center justify-center p-12">
                               <div className="grid grid-cols-2 gap-4 w-full">
                                  {[1,2,3,4].map(i => <div key={i} className="aspect-square bg-white/5 rounded-3xl border border-white/10" />)}
                               </div>
                           </div>
                        </div>
                    </div>
                )}
            </div>

        </div>
    );
};

export default SearchPage;
