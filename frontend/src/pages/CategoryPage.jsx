import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getCategoryBySlug } from '../services/categoryService';
import { addToCart } from '../services/cartService';
import { toggleWishlist } from '../services/wishlistService';
import useAuthStore from '../store/authStore';

const CategoryProductCard = ({ product, index }) => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const token = useAuthStore(state => state.token);

    const wishlistMutation = useMutation({
        mutationFn: (id) => toggleWishlist(id),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['category'] });
            toast.success(data.message || 'Wishlist updated');
        },
        onError: () => toast.error('Failed to update wishlist')
    });

    const cartMutation = useMutation({
        mutationFn: (data) => addToCart(data),
        onSuccess: () => {
            queryClient.invalidateQueries(['cart']);
            toast.success('Added to cart');
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Failed to add to cart')
    });

    const handleQuickAdd = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!token) {
            toast.error('Please login to use cart');
            navigate('/login');
            return;
        }
        cartMutation.mutate({
            product_id: product.id,
            quantity: 1,
            variant_id: product.variants?.[0]?.id || null
        });
    };

    const handleToggleWishlist = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!token) {
            toast.error('Please login first');
            navigate('/login');
            return;
        }
        wishlistMutation.mutate(product.id);
    };

    return (
        <div className={`group relative flex flex-col cursor-pointer ${index % 2 !== 0 ? 'lg:mt-12' : ''}`}>
            <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-surface-container-low mb-6">
                <Link to={`/products/${product.slug}`}>
                    <img 
                        src={product.image_url || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800'} 
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" 
                    />
                </Link>
                <div className="absolute inset-0 bg-on-background/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                <div className="absolute bottom-4 right-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-400">
                    <button 
                        onClick={handleQuickAdd}
                        disabled={cartMutation.isPending}
                        className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-primary hover:text-on-primary transition-colors disabled:opacity-50"
                    >
                        {cartMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin text-primary" /> : <span className="material-symbols-outlined text-base">add</span>}
                    </button>
                </div>
                <button 
                    onClick={handleToggleWishlist}
                    disabled={wishlistMutation.isPending}
                    className={`absolute top-4 right-4 transition-colors disabled:opacity-50 ${product.is_wishlisted ? 'text-error' : 'text-on-surface-variant hover:text-primary'}`}
                >
                    <span className="material-symbols-outlined text-base" style={product.is_wishlisted ? { fontVariationSettings: "'FILL' 1" } : {}}>favorite</span>
                </button>
            </div>
            <Link to={`/products/${product.slug}`} className="flex flex-col gap-1">
                <h3 className="font-semibold text-lg text-on-surface line-clamp-1 group-hover:text-primary transition-colors">{product.name}</h3>
                <p className="text-on-surface-variant text-sm truncate">{product.category?.name || 'Collection'}</p>
                <span className="mt-2 text-on-surface font-bold">${parseFloat(product.price).toFixed(2)}</span>
            </Link>
        </div>
    );
};

const CategoryPage = () => {
    const { slug } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();

    // Filters from URL
    const sort = searchParams.get('sort_by') || 'newest';
    const minPrice = searchParams.get('min_price') || '';
    const maxPrice = searchParams.get('max_price') || '';
    const stockStatus = searchParams.get('stock_status') || '';

    const { data: categoryData, isLoading } = useQuery({
        queryKey: ['category', slug, sort, minPrice, maxPrice, stockStatus],
        queryFn: () => getCategoryBySlug(slug, {
            sort_by: sort,
            min_price: minPrice,
            max_price: maxPrice,
            stock_status: stockStatus
        }),
    });

    const category = categoryData?.category || categoryData?.data || categoryData;
    const products = categoryData?.products?.data || categoryData?.products || category?.products || [];
    const totalCount = categoryData?.products?.total || products.length;

    const updateFilter = (key, value) => {
        const newParams = new URLSearchParams(searchParams);
        if (value) newParams.set(key, value);
        else newParams.delete(key);
        setSearchParams(newParams);
    };

    if (isLoading) {
        return (
            <div className="pt-40 pb-40 flex justify-center items-center min-h-screen">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
            </div>
        );
    }

    if (!category) return (
        <div className="pt-60 pb-60 text-center space-y-8 min-h-screen flex flex-col items-center justify-center">
            <h1 className="text-4xl font-extrabold text-on-surface uppercase tracking-tight">Collection Not Found</h1>
            <Link to="/products" className="inline-block px-12 py-5 bg-primary text-on-primary font-bold uppercase text-xs tracking-widest rounded-full shadow-lg">Return to Shop</Link>
        </div>
    );

    return (
        <main className="pt-20 min-h-screen bg-surface font-manrope text-on-surface">
            {/* Header Section */}
            <header className="px-8 md:px-12 py-16 md:py-24 max-w-[1440px] mx-auto">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <span className="text-secondary font-medium tracking-[0.1em] uppercase text-[0.75rem] mb-4 block">
                            Mohanad Atelier
                        </span>
                        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter text-on-surface leading-none capitalize">
                            {category.name}
                        </h1>
                    </div>
                    <div className="text-on-surface-variant font-light text-lg">
                        <span className="font-bold text-on-surface">{totalCount}</span> items curated for the modern minimalist
                    </div>
                </div>
            </header>

            <div className="flex flex-col md:flex-row max-w-[1440px] mx-auto px-8 gap-12">
                {/* SideNavBar (Filters) */}
                <aside className="hidden md:block w-72 shrink-0 self-start sticky top-28 bg-surface-container-low rounded-3xl p-8 text-sm font-medium">
                    <div className="mb-10">
                        <div className="flex items-center gap-3 mb-1">
                            <span className="material-symbols-outlined text-on-surface text-lg">tune</span>
                            <h2 className="uppercase tracking-widest text-on-surface">Filters</h2>
                        </div>
                        <p className="text-xs text-on-surface-variant lowercase italic">Refine your selection</p>
                    </div>

                    <div className="flex flex-col gap-4">
                        <div className="group flex items-center justify-between text-on-surface-variant hover:text-on-surface px-5 py-3 cursor-pointer hover:translate-x-1 transition-transform duration-300">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-sm">straighten</span>
                                <span className="uppercase tracking-widest text-[0.7rem]">Size</span>
                            </div>
                            <span className="material-symbols-outlined text-sm">add</span>
                        </div>
                        <div className="group flex items-center justify-between text-on-surface-variant hover:text-on-surface px-5 py-3 cursor-pointer hover:translate-x-1 transition-transform duration-300">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-sm">palette</span>
                                <span className="uppercase tracking-widest text-[0.7rem]">Color</span>
                            </div>
                            <span className="material-symbols-outlined text-sm">add</span>
                        </div>
                        
                        {/* Interactive Sort By -> Map to dropdown/actions */}
                        <div className="group flex flex-col bg-surface-container-lowest text-on-surface rounded-3xl p-5 shadow-sm transition-transform duration-300">
                            <div className="flex items-center justify-between cursor-pointer mb-4">
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-sm">sort</span>
                                    <span className="uppercase tracking-widest text-[0.7rem] font-bold">Sort By</span>
                                </div>
                            </div>
                            <div className="flex flex-col gap-2 pl-8">
                                <label className="flex items-center gap-2 text-xs text-on-surface-variant hover:text-on-surface cursor-pointer">
                                    <input type="radio" name="sort" checked={sort === 'newest'} onChange={() => updateFilter('sort_by', 'newest')} className="accent-primary" />
                                    Newest
                                </label>
                                <label className="flex items-center gap-2 text-xs text-on-surface-variant hover:text-on-surface cursor-pointer">
                                    <input type="radio" name="sort" checked={sort === 'price_asc'} onChange={() => updateFilter('sort_by', 'price_asc')} className="accent-primary" />
                                    Price: Low to High
                                </label>
                                <label className="flex items-center gap-2 text-xs text-on-surface-variant hover:text-on-surface cursor-pointer">
                                    <input type="radio" name="sort" checked={sort === 'price_desc'} onChange={() => updateFilter('sort_by', 'price_desc')} className="accent-primary" />
                                    Price: High to Low
                                </label>
                            </div>
                        </div>
                    </div>

                    <button 
                        onClick={() => { setSearchParams(new URLSearchParams()); }}
                        className="w-full mt-10 py-4 rounded-full bg-primary text-on-primary font-bold uppercase tracking-widest text-[0.7rem] hover:opacity-90 transition-opacity"
                    >
                        Reset Filters
                    </button>
                </aside>

                {/* Product Grid */}
                <section className="flex-1 pb-24">
                    {products.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
                                {products.map((product, index) => (
                                    <CategoryProductCard key={product.id} product={product} index={index} />
                                ))}
                            </div>
                            
                            {/* Pagination (if applicable) */}
                            {categoryData?.products?.last_page > 1 && (
                                <div className="mt-24 flex justify-center">
                                    <button className="px-12 py-4 rounded-full border border-outline-variant text-on-surface-variant font-medium tracking-widest uppercase text-xs hover:bg-surface-container-low transition-colors duration-300">
                                        Load More Products
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="py-32 text-center text-on-surface-variant">
                            <span className="material-symbols-outlined text-6xl opacity-50 mb-4">search_off</span>
                            <h2 className="text-2xl font-bold text-on-surface">No Products Found</h2>
                            <p className="mt-2 text-sm">We couldn't find any items matching your filters.</p>
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
};

export default CategoryPage;
