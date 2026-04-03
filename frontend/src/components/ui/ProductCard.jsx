import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Heart, Star, Loader2 } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addToCart } from '../../services/cartService';
import { toggleWishlist } from '../../services/wishlistService';
import { toast } from 'react-hot-toast';
import useAuthStore from '../../store/authStore';

const ProductCard = ({ product }) => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const token = useAuthStore(state => state.token);

    const wishlistMutation = useMutation({
        mutationFn: (id) => toggleWishlist(id),
        onMutate: async (id) => {
            // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
            await queryClient.cancelQueries({ queryKey: ['wishlist'] });

            // Snapshot the previous value
            const previousWishlist = queryClient.getQueryData(['wishlist']);

            // Optimistically update to the new value
            queryClient.setQueryData(['wishlist'], (old) => {
                const updatedData = old?.data ? { ...old } : { data: [] };
                const exists = updatedData.data.some(p => p.id === id);
                if (exists) {
                    updatedData.data = updatedData.data.filter(p => p.id !== id);
                } else {
                    updatedData.data = [...updatedData.data, product];
                }
                return updatedData;
            });

            // Return a context object with the snapshotted value
            return { previousWishlist };
        },
        onError: (err, id, context) => {
            // If the mutation fails, use the context returned from onMutate to roll back
            queryClient.setQueryData(['wishlist'], context.previousWishlist);
            toast.error(err.response?.data?.message || 'Wishlist operation failed');
        },
        onSettled: () => {
            // Always refetch after error or success to keep server state in sync
            queryClient.invalidateQueries({ queryKey: ['wishlist'] });
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['category'] });
            queryClient.invalidateQueries({ queryKey: ['featuredProducts'] });
        },
        onSuccess: (data) => {
            toast.success(data.message);
        }
    });

    const cartMutation = useMutation({
        mutationFn: (data) => addToCart(data),
        onMutate: async () => {
            // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
            await queryClient.cancelQueries({ queryKey: ['cart'] });

            // Snapshot the previous value
            const previousCart = queryClient.getQueryData(['cart']);

            // Optimistically update the cart count in the cache
            queryClient.setQueryData(['cart'], (old) => {
                const updated = old ? { ...old } : { items: [] };
                // We add a dummy item to increment the count instantly
                return {
                    ...updated,
                    items: [...(updated.items || []), { id: 'temp-' + Date.now() }]
                };
            });

            // Return a context object with the snapshotted value
            return { previousCart };
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['cart']);
            toast.success('Added to cart');
        },
        onError: (err, variables, context) => {
            // If the mutation fails, roll back to the previous cart
            queryClient.setQueryData(['cart'], context.previousCart);
            toast.error(err.response?.data?.message || 'Cart operation failed');
        },
        onSettled: () => {
            // Always refetch to keep state in sync
            queryClient.invalidateQueries({ queryKey: ['cart'] });
        }
    });

    const handleQuickAdd = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!token) {
            toast.error('Please login to use cart');
            navigate('/login');
            return;
        }
        
        const variantId = product.variants?.[0]?.id || null;
        
        cartMutation.mutate({
            product_id: product.id,
            quantity: 1,
            variant_id: variantId
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

    if (!product) return null;

    return (
        <div className="group flex flex-col font-manrope cursor-pointer bg-white">
            {/* Image Area */}
            <div className="relative aspect-[3/4] bg-slate-50 overflow-hidden mb-6 border border-slate-100/50 shadow-sm transition-all duration-500 hover:shadow-xl">
                <Link to={`/products/${product.slug}`}>
                    <img 
                        src={product.image_url || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800'} 
                        alt={product.name} 
                        className="w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-105"
                    />
                </Link>
                
                {/* Badges */}
                {product.is_featured && (
                    <div className="absolute top-5 left-5 bg-slate-900 px-3 py-1.5 text-[9px] font-black text-white uppercase tracking-widest italic shadow-lg">
                        Featured
                    </div>
                )}
                
                {product.sale_price && (
                    <div className="absolute top-5 left-5 bg-amber-400 px-3 py-1.5 text-[9px] font-black text-slate-900 uppercase tracking-widest italic shadow-lg">
                        Special Offer
                    </div>
                )}

                {/* Wishlist Button */}
                <button 
                    onClick={handleToggleWishlist}
                    disabled={wishlistMutation.isPending}
                    className={`absolute top-5 right-5 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${product.is_wishlisted ? 'bg-rose-500 text-white' : 'bg-white opacity-0 group-hover:opacity-100 translate-x-10 group-hover:translate-x-0'} hover:scale-110 active:scale-95`}
                >
                    <Heart className={`w-4 h-4 ${product.is_wishlisted ? 'fill-current' : ''}`} />
                </button>

                {/* Quick Add Overlay */}
                <div className="absolute bottom-0 left-0 w-full p-5 translate-y-full group-hover:translate-y-0 transition-transform duration-500 bg-white/80 backdrop-blur-md border-t border-slate-100">
                    <button 
                        onClick={handleQuickAdd}
                        disabled={cartMutation.isPending}
                        className="w-full bg-slate-950 text-white flex items-center justify-center gap-3 py-3 text-[10px] font-bold uppercase tracking-[0.2em] shadow-xl hover:bg-slate-800 transition-all disabled:opacity-50"
                    >
                        {cartMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                        Quick Add
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex flex-col space-y-1.5">
                <div className="flex justify-between items-start gap-4">
                    <Link to={`/products/${product.slug}`} className="flex-1">
                        <h3 className="text-base font-black text-slate-900 tracking-tight uppercase italic leading-tight hover:text-slate-600 transition-colors">
                            {product.name}
                        </h3>
                    </Link>
                    <div className="flex flex-col items-end">
                        <span className="text-base font-black text-slate-950 italic">
                            ${product.sale_price || product.price}
                        </span>
                        {product.sale_price && (
                            <span className="text-[10px] text-slate-300 line-through font-bold">
                                ${product.price}
                            </span>
                        )}
                    </div>
                </div>
                
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                    {product.category?.name || 'Collection Item'}
                </p>

                <div className="flex items-center gap-0.5 pt-2 opacity-30 group-hover:opacity-100 transition-opacity">
                    {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-3 h-3 ${i < 4 ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
