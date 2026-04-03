import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getFeaturedProducts } from '../services/productService';
import { getCategories } from '../services/categoryService';
import { addToCart } from '../services/cartService';
import { toast } from 'react-hot-toast';
import useAuthStore from '../store/authStore';

const HomePage = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const token = useAuthStore(state => state.token);

    const { data: featuredProducts = [], isLoading: productsLoading } = useQuery({
        queryKey: ['featuredProducts'],
        queryFn: getFeaturedProducts,
    });

    const { data: categories = [], isLoading: categoriesLoading } = useQuery({
        queryKey: ['categories'],
        queryFn: getCategories,
    });

    const cartMutation = useMutation({
        mutationFn: (data) => addToCart(data),
        onSuccess: () => {
            queryClient.invalidateQueries(['cart']);
            toast.success('Added to cart successfully!');
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || 'Cart operation failed');
        }
    });

    const handleAddToCart = (product, e) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (!token) {
            toast.error('Please log in to add items to your cart');
            navigate('/login');
            return;
        }
        
        cartMutation.mutate({
            product_id: product.id,
            quantity: 1,
            variant_id: product.variants?.[0]?.id || null
        });
    };

    return (
        <main>
            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center pt-20 px-4 md:px-8 overflow-hidden bg-surface">
                <div className="max-w-7xl mx-auto w-full grid md:grid-cols-2 gap-12 items-center">
                    <div className="z-10 order-2 md:order-1">
                        <span className="inline-block text-secondary font-label tracking-[0.15em] uppercase text-[0.7rem] mb-6 px-4 py-1.5 bg-secondary-container rounded-full">New Season Arrived</span>
                        <h1 className="text-on-surface text-5xl md:text-7xl font-extrabold tracking-tighter leading-[1.1] mb-6">
                            Elevate Your <br/><span className="text-primary italic font-light">Style</span>
                        </h1>
                        <p className="text-on-surface-variant text-lg md:text-xl max-w-md mb-10 leading-relaxed">
                            Discover the new season collection at Mohanad. Curated essentials designed for the modern individual who values quality and understated luxury.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link to="/shop">
                                <button className="bg-primary text-on-primary px-10 py-4 rounded-full font-semibold hover:opacity-90 transition-all duration-400 scale-100 active:scale-95 shadow-lg shadow-primary/20 w-full sm:w-auto">
                                    Shop Now
                                </button>
                            </Link>
                            <Link to="/categories">
                                <button className="border border-outline-variant/30 px-10 py-4 rounded-full font-semibold hover:bg-surface-container-low transition-all duration-400 w-full sm:w-auto">
                                    View Categories
                                </button>
                            </Link>
                        </div>
                    </div>
                    <div className="relative order-1 md:order-2">
                        <div className="relative aspect-[4/5] rounded-xl overflow-hidden shadow-2xl scale-105 md:scale-110 rotate-2">
                            <img alt="Fashion Model" className="w-full h-full object-cover" data-alt="fashion model wearing minimalist beige linen clothing standing against a clean neutral background with soft natural lighting" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA_GB09wEpqgSfI3JopLOdKv2jim1it4YkZ84yUE_giAV-_U_Sk1sPEl3BHux1N2AVjaf_IrCoW_mU3VHV2l8QPqtyXXupIlrHjNt6D2OXvu1yVsvJNDwyZiXMxb7fIt345of7ld5xAtcZWKEpBONpFyS8c2TmCPwABe029i8ZpedqT34fnWMJt9lE1WNW5c6SO1M0VL3_Vt33Q87xG7WqCv5bSFc9yn3USz3zxW4q2Fi5ciWyohiNavgTMh_Zu9S_G8Mru8ZzYyIjN"/>
                        </div>
                        {/* Decorative element */}
                        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-secondary-container rounded-full -z-10 blur-3xl opacity-50"></div>
                    </div>
                </div>
            </section>

            {/* Categories Section */}
            <section className="py-24 bg-surface-container-low">
                <div className="max-w-7xl mx-auto px-4 md:px-8">
                    <div className="mb-16 flex justify-between items-end">
                        <div>
                            <h2 className="text-on-surface text-3xl font-bold tracking-tight mb-2 font-headline">Shop by Category</h2>
                            <p className="text-on-surface-variant">Find the perfect piece for your wardrobe.</p>
                        </div>
                        <Link className="text-primary font-semibold flex items-center gap-2 group" to="/categories">
                            Explore All <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {categoriesLoading ? (
                            Array.from({ length: 4 }).map((_, i) => (
                                <div key={`skeleton-cat-${i}`} className={`group relative aspect-[3/4] rounded-xl overflow-hidden bg-surface animate-pulse ${i % 2 !== 0 ? 'md:mt-8' : ''}`}></div>
                            ))
                        ) : (
                            categories.slice(0, 4).map((category, index) => (
                                <Link to={`/category/${category.slug}`} key={category.id} className={`group relative aspect-[3/4] rounded-xl overflow-hidden cursor-pointer block ${index % 2 !== 0 ? 'md:mt-8' : ''}`}>
                                    <img 
                                        alt={category.name} 
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                                        src={category.image_url || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800'}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-8">
                                        <h3 className="text-white text-xl font-bold">{category.name}</h3>
                                        <p className="text-white/80 text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">{category.description || 'Discover collection'}</p>
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>
                </div>
            </section>

            {/* Featured Products Section */}
            <section className="py-24 bg-surface">
                <div className="max-w-7xl mx-auto px-4 md:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-on-surface text-4xl font-bold tracking-tight mb-4 font-headline">Featured Collection</h2>
                        <div className="w-12 h-1 bg-primary mx-auto rounded-full"></div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
                        {productsLoading ? (
                            Array.from({ length: 3 }).map((_, i) => (
                                <div key={`skeleton-prod-${i}`} className="group flex flex-col">
                                    <div className="relative bg-surface-container-low rounded-xl overflow-hidden aspect-[4/5] mb-6 animate-pulse"></div>
                                    <div className="h-6 bg-surface-container-low rounded w-3/4 mb-2 animate-pulse"></div>
                                    <div className="h-4 bg-surface-container-low rounded w-1/4 animate-pulse"></div>
                                </div>
                            ))
                        ) : (
                            featuredProducts.slice(0, 3).map((product) => (
                                <div key={product.id} className="group flex flex-col">
                                    <div className="relative bg-surface-container-low rounded-xl overflow-hidden aspect-[4/5] mb-6">
                                        <Link to={`/product/${product.slug}`} className="block w-full h-full">
                                            <img 
                                                alt={product.name} 
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                                                src={product.image_url || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800'}
                                            />
                                        </Link>
                                        <button 
                                            onClick={(e) => handleAddToCart(product, e)}
                                            disabled={cartMutation.isPending}
                                            className="absolute bottom-4 right-4 bg-surface-container-lowest text-on-surface p-3 rounded-full shadow-lg opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 hover:bg-primary hover:text-on-primary disabled:opacity-50"
                                        >
                                            <span className="material-symbols-outlined">shopping_bag</span>
                                        </button>
                                    </div>
                                    <div className="flex justify-between items-start mb-2">
                                        <Link to={`/product/${product.slug}`} className="flex-1">
                                            <h3 className="text-on-surface font-semibold text-lg hover:text-primary transition-colors pr-2 line-clamp-1">{product.name}</h3>
                                            <p className="text-on-surface-variant text-sm line-clamp-1">{product.category?.name || 'Essential piece'}</p>
                                        </Link>
                                        <span className="text-primary font-bold whitespace-nowrap">${parseFloat(product.price).toFixed(2)}</span>
                                    </div>
                                    <button 
                                        onClick={(e) => handleAddToCart(product, e)}
                                        disabled={cartMutation.isPending}
                                        className="mt-4 w-full py-3 border border-outline-variant/30 rounded-full text-sm font-semibold hover:bg-on-surface hover:text-surface transition-colors duration-300 disabled:opacity-50"
                                    >
                                        {cartMutation.isPending ? 'Adding to Cart...' : 'Add to Cart'}
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </section>

            {/* Product Features Highlight */}
            <section className="py-20 bg-surface-container-lowest border-y border-outline-variant/10">
                <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-3 gap-12">
                    <div className="flex flex-col items-center text-center px-6">
                        <div className="w-16 h-16 bg-secondary-container rounded-full flex items-center justify-center mb-6 text-on-secondary-container">
                            <span className="material-symbols-outlined text-3xl">verified</span>
                        </div>
                        <h4 className="text-on-surface font-bold text-xl mb-3">High Quality Fabric</h4>
                        <p className="text-on-surface-variant text-sm leading-relaxed">We source only the finest sustainable materials to ensure longevity and comfort in every piece.</p>
                    </div>
                    <div className="flex flex-col items-center text-center px-6 border-y md:border-y-0 md:border-x border-outline-variant/20 py-12 md:py-0">
                        <div className="w-16 h-16 bg-secondary-container rounded-full flex items-center justify-center mb-6 text-on-secondary-container">
                            <span className="material-symbols-outlined text-3xl">checkroom</span>
                        </div>
                        <h4 className="text-on-surface font-bold text-xl mb-3">Comfortable Fit</h4>
                        <p className="text-on-surface-variant text-sm leading-relaxed">Each garment is designed with precision tailoring to offer a perfect balance of form and function.</p>
                    </div>
                    <div className="flex flex-col items-center text-center px-6">
                        <div className="w-16 h-16 bg-secondary-container rounded-full flex items-center justify-center mb-6 text-on-secondary-container">
                            <span className="material-symbols-outlined text-3xl">auto_awesome</span>
                        </div>
                        <h4 className="text-on-surface font-bold text-xl mb-3">Trendy Design</h4>
                        <p className="text-on-surface-variant text-sm leading-relaxed">Stay ahead of the curve with our thoughtfully curated collections that define contemporary fashion.</p>
                    </div>
                </div>
            </section>
        </main>
    );
};

export default HomePage;
