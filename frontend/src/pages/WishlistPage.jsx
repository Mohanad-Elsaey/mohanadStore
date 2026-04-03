import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Loader2 } from 'lucide-react';
import { getWishlist, toggleWishlist } from '../services/wishlistService';
import { addToCart } from '../services/cartService';
import useAuthStore from '../store/authStore';

const WishlistPage = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const { token, logout } = useAuthStore();

    const { data: wishlistResp, isLoading } = useQuery({
        queryKey: ['wishlist'],
        queryFn: getWishlist,
    });

    const items = wishlistResp?.data || [];

    const removeMutation = useMutation({
        mutationFn: (id) => toggleWishlist(id),
        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey: ['wishlist'] });
            const previousWishlist = queryClient.getQueryData(['wishlist']);
            queryClient.setQueryData(['wishlist'], (old) => {
                const updated = old?.data ? { ...old } : { data: [] };
                updated.data = updated.data.filter(p => p.id !== id);
                return updated;
            });
            return { previousWishlist };
        },
        onSuccess: () => toast.success('Removed from wishlist'),
        onError: (err, id, context) => {
            queryClient.setQueryData(['wishlist'], context.previousWishlist);
            toast.error('Failed to remove item');
        },
        onSettled: () => queryClient.invalidateQueries(['wishlist']),
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

    const handleLogout = (e) => {
        e.preventDefault();
        logout();
        navigate('/');
        toast.success('Logged out successfully');
    };

    return (
        <main className="font-manrope max-w-7xl mx-auto px-6 pt-32 pb-24 flex flex-col md:flex-row gap-12 min-h-screen">
            {/* Sidebar Navigation */}
            <aside className="w-full lg:w-64 flex-shrink-0">
                <div className="sticky top-32 space-y-2">
                    <h2 className="px-4 mb-6 text-xs font-bold tracking-widest uppercase text-secondary">Account</h2>
                    <Link to="/profile" className="flex items-center gap-4 px-4 py-3 rounded-full text-on-surface-variant hover:bg-surface-container-low transition-all duration-400">
                        <span className="material-symbols-outlined text-base">person</span>
                        <span className="text-sm">Profile</span>
                    </Link>
                    <Link to="/wishlist" className="flex items-center gap-4 px-4 py-3 rounded-full bg-primary-container text-on-primary-container font-semibold transition-all duration-400">
                        <span className="material-symbols-outlined text-base decoration-0" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                        <span className="text-sm">Wishlist</span>
                    </Link>
                    <Link to="/orders" className="flex items-center gap-4 px-4 py-3 rounded-full text-on-surface-variant hover:bg-surface-container-low transition-all duration-400">
                        <span className="material-symbols-outlined text-base">shopping_bag</span>
                        <span className="text-sm">Orders</span>
                    </Link>
                    <div className="pt-8 mt-8 border-t border-outline-variant/15">
                        <button onClick={handleLogout} className="w-full flex items-center gap-4 px-4 py-3 rounded-full text-error/80 hover:bg-error/5 transition-all duration-400">
                            <span className="material-symbols-outlined text-base">logout</span>
                            <span className="text-sm">Sign Out</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Wishlist Grid */}
            <section className="flex-1">
                <div className="mb-12">
                    <h1 className="text-4xl font-extrabold tracking-tight text-on-surface mb-2">Your Wishlist</h1>
                    <p className="text-on-surface-variant">Items you've curated for your personal collection.</p>
                </div>

                {isLoading ? (
                    <div className="flex justify-center items-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : items.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-x-8 gap-y-16">
                        {items.map((product, index) => (
                            <div key={product.id} className={`group ${index % 2 !== 0 ? 'lg:mt-12' : ''}`}>
                                <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-surface-container-low mb-6">
                                    <Link to={`/products/${product.slug}`}>
                                        <img 
                                            alt={product.name} 
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                                            src={product.image_url || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800'}
                                        />
                                    </Link>
                                    <button 
                                        onClick={() => removeMutation.mutate(product.id)}
                                        disabled={removeMutation.isPending}
                                        className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur rounded-full shadow-sm hover:bg-white transition-colors disabled:opacity-50"
                                    >
                                        <span className="material-symbols-outlined text-error text-base">delete</span>
                                    </button>
                                </div>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <span className="text-[0.65rem] font-bold tracking-[0.15em] uppercase text-secondary mb-1 block">{product.category?.name || 'Collection'}</span>
                                        <Link to={`/products/${product.slug}`}>
                                            <h3 className="text-lg font-bold text-on-surface hover:text-primary transition-colors pr-2 line-clamp-1">{product.name}</h3>
                                        </Link>
                                        <p className="text-primary font-medium mt-1">${parseFloat(product.price).toFixed(2)}</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={(e) => handleAddToCart(product, e)}
                                    disabled={cartMutation.isPending}
                                    className="mt-6 w-full py-4 bg-primary text-on-primary rounded-full font-bold text-sm tracking-wide flex items-center justify-center gap-2 hover:bg-primary-dim transition-all duration-400 active:scale-95 shadow-lg shadow-primary/10 disabled:opacity-50"
                                >
                                    {cartMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <span className="material-symbols-outlined text-lg">add_shopping_cart</span>}
                                    Add to Cart
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-20 text-center space-y-6 bg-surface-container-lowest rounded-3xl border border-outline-variant/10">
                        <span className="material-symbols-outlined text-6xl text-outline-variant/50">heart_broken</span>
                        <div>
                            <h2 className="text-2xl font-extrabold tracking-tight text-on-surface">Your wishlist is empty</h2>
                            <p className="text-on-surface-variant max-w-sm mx-auto mt-2">Discover our latest collection and save your favorite essential pieces.</p>
                        </div>
                        <Link to="/products" className="inline-block mt-4">
                            <button className="bg-primary text-on-primary px-8 py-3 rounded-full font-bold text-sm tracking-wide hover:bg-primary-dim transition-all duration-300">
                                Explore Products
                            </button>
                        </Link>
                    </div>
                )}
            </section>
        </main>
    );
};

export default WishlistPage;