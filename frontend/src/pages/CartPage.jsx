import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Loader2 } from 'lucide-react';
import { getCart, updateCartItem, removeFromCart } from '../services/cartService';
import { getFeaturedProducts } from '../services/productService';
import useAuthStore from '../store/authStore';

const CartPage = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const { token } = useAuthStore();

    const { data: cartResp, isLoading } = useQuery({
        queryKey: ['cart'],
        queryFn: getCart,
        enabled: !!token
    });

    const { data: featuredProducts } = useQuery({
        queryKey: ['featuredProducts'],
        queryFn: getFeaturedProducts,
    });

    const cart = cartResp;

    const updateMutation = useMutation({
        mutationFn: ({ itemId, quantity }) => updateCartItem(itemId, quantity),
        onSuccess: () => queryClient.invalidateQueries(['cart']),
        onError: () => toast.error('Failed to update quantity')
    });

    const removeMutation = useMutation({
        mutationFn: (id) => removeFromCart(id),
        onSuccess: () => {
            queryClient.invalidateQueries(['cart']);
            toast.success('Item removed');
        },
        onError: () => toast.error('Failed to remove item')
    });

    if (!token) {
        return (
            <div className="pt-40 pb-40 min-h-screen flex flex-col items-center justify-center bg-surface text-center px-6">
                <span className="material-symbols-outlined text-6xl text-on-surface-variant mb-6">lock</span>
                <h2 className="text-3xl font-extrabold tracking-tighter mb-4 text-on-surface">Authentication Required</h2>
                <p className="text-on-surface-variant font-medium max-w-sm mb-8">
                    Please log in to view and manage your cart.
                </p>
                <Link to="/login">
                    <button className="bg-primary text-on-primary px-10 py-4 rounded-full font-bold uppercase tracking-widest text-xs hover:-translate-y-0.5 transition-transform shadow-lg shadow-primary/20">
                        Sign In
                    </button>
                </Link>
            </div>
        );
    }

    if (isLoading) return (
        <div className="pt-40 pb-40 min-h-screen flex items-center justify-center bg-surface">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
        </div>
    );

    if (!cart || cart.items?.length === 0) return (
        <div className="pt-40 pb-40 min-h-screen flex flex-col items-center justify-center bg-surface text-center px-6">
            <div className="w-24 h-24 bg-surface-container-low rounded-full flex items-center justify-center mb-6 text-on-surface-variant">
                <span className="material-symbols-outlined text-4xl">shopping_bag</span>
            </div>
            <h2 className="text-3xl font-extrabold tracking-tighter mb-4 text-on-surface">Your cart is empty.</h2>
            <p className="text-on-surface-variant font-medium max-w-sm mb-8">
                You haven't added any items to your digital atelier curated selection.
            </p>
            <Link to="/products">
                <button className="bg-primary text-on-primary px-10 py-4 rounded-full font-bold uppercase tracking-widest text-xs hover:-translate-y-0.5 transition-transform shadow-lg shadow-primary/20">
                    Explore New Arrivals
                </button>
            </Link>
        </div>
    );

    return (
        <main className="font-manrope text-on-surface pt-32 pb-24 px-6 lg:px-12 max-w-screen-2xl mx-auto min-h-screen">
            <div className="mb-12">
                <h1 className="text-[3.5rem] font-extrabold tracking-tighter leading-none mb-2">Your Cart</h1>
                <p className="text-on-surface-variant font-medium">Review your selected pieces from the Digital Atelier.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
                {/* Left Side: Cart Items */}
                <div className="lg:col-span-8 space-y-12">
                    {cart.items.map((item, index) => (
                        <React.Fragment key={item.id}>
                            <div className="flex flex-col md:flex-row items-start gap-8 group">
                                <div className="w-full md:w-48 aspect-[3/4] rounded-xl overflow-hidden bg-surface-container-low shrink-0 border border-outline-variant/10">
                                    <Link to={`/products/${item.product?.slug}`}>
                                        <img 
                                            src={item.product?.image_url || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800'} 
                                            alt={item.product?.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                                        />
                                    </Link>
                                </div>
                                <div className="flex-grow flex flex-col justify-between py-2 h-full w-full">
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <Link to={`/products/${item.product?.slug}`}>
                                                    <h3 className="text-xl font-bold tracking-tight mb-1 hover:text-primary transition-colors">{item.product?.name}</h3>
                                                </Link>
                                                <p className="text-on-surface-variant text-sm tracking-wide uppercase">
                                                    {item.product?.category?.name || 'Collection'} 
                                                    {item.variant ? ` | ${item.variant.name}` : ''}
                                                </p>
                                            </div>
                                            <span className="text-lg font-semibold whitespace-nowrap">${parseFloat(item.total).toFixed(2)}</span>
                                        </div>
                                        <div className="flex items-center gap-6 mt-6">
                                            <div className="flex items-center bg-surface-container-low rounded-full px-4 py-2 border border-outline-variant/10 shadow-inner">
                                                <button 
                                                    onClick={() => updateMutation.mutate({ itemId: item.id, quantity: Math.max(1, item.quantity - 1) })}
                                                    disabled={updateMutation.isPending}
                                                    className="w-8 h-8 flex items-center justify-center hover:bg-surface-container-high transition-colors rounded-full disabled:opacity-50"
                                                >
                                                    <span className="material-symbols-outlined text-sm">remove</span>
                                                </button>
                                                <span className="mx-4 font-medium min-w-[20px] text-center tabular-nums">
                                                    {updateMutation.isPending && updateMutation.variables?.itemId === item.id ? <Loader2 className="w-4 h-4 animate-spin inline" /> : item.quantity}
                                                </span>
                                                <button 
                                                    onClick={() => updateMutation.mutate({ itemId: item.id, quantity: item.quantity + 1 })}
                                                    disabled={updateMutation.isPending}
                                                    className="w-8 h-8 flex items-center justify-center hover:bg-surface-container-high transition-colors rounded-full disabled:opacity-50"
                                                >
                                                    <span className="material-symbols-outlined text-sm">add</span>
                                                </button>
                                            </div>
                                            <button 
                                                onClick={() => removeMutation.mutate(item.id)}
                                                disabled={removeMutation.isPending}
                                                className="text-on-surface-variant text-sm font-medium hover:text-error transition-colors flex items-center gap-1 disabled:opacity-50"
                                            >
                                                <span className="material-symbols-outlined text-lg">delete</span>
                                                <span>Remove</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* Separator, unless it's the last item */}
                            {index !== cart.items.length - 1 && (
                                <div className="h-px bg-surface-container-high w-full"></div>
                            )}
                        </React.Fragment>
                    ))}

                    <div className="pt-4">
                        <Link to="/products" className="inline-flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors font-medium">
                            <span className="material-symbols-outlined">arrow_back</span>
                            <span>Continue Shopping</span>
                        </Link>
                    </div>
                </div>

                {/* Right Side: Order Summary */}
                <aside className="lg:col-span-4 bg-surface-container-lowest p-8 rounded-2xl shadow-[0_20px_40px_rgba(45,52,53,0.06)] border border-outline-variant/10 lg:sticky lg:top-32">
                    <h2 className="text-xl font-bold tracking-tight mb-8">Order Summary</h2>
                    <div className="space-y-6 mb-8">
                        <div className="flex justify-between items-center text-on-surface-variant">
                            <span>Subtotal</span>
                            <span className="font-medium text-on-surface tabular-nums">${parseFloat(cart.totals?.subtotal || 0).toFixed(2)}</span>
                        </div>
                        {cart.totals?.discount > 0 && (
                            <div className="flex justify-between items-center text-emerald-500">
                                <span>Discount</span>
                                <span className="font-medium tabular-nums">-${parseFloat(cart.totals?.discount).toFixed(2)}</span>
                            </div>
                        )}
                        <div className="flex justify-between items-center text-on-surface-variant">
                            <span>Shipping</span>
                            <span className="text-sm">{cart.totals?.shipping > 0 ? `$${parseFloat(cart.totals.shipping).toFixed(2)}` : 'Calculated at checkout'}</span>
                        </div>
                        <div className="flex justify-between items-center text-on-surface-variant">
                            <span>Estimated Tax</span>
                            <span className="font-medium text-on-surface tabular-nums">${parseFloat(cart.totals?.tax || 0).toFixed(2)}</span>
                        </div>
                        <div className="h-px bg-surface-container-low w-full"></div>
                        <div className="flex justify-between items-center pt-2">
                            <span className="text-lg font-bold">Total</span>
                            <span className="text-2xl font-extrabold tracking-tighter tabular-nums">${parseFloat(cart.totals?.total || 0).toFixed(2)}</span>
                        </div>
                    </div>
                    
                    <div className="space-y-4">
                        <button 
                            onClick={() => navigate('/checkout')}
                            className="w-full py-5 bg-primary text-on-primary font-bold rounded-full hover:bg-primary-dim transition-all duration-300 scale-100 active:scale-95 shadow-lg shadow-primary/10"
                        >
                            Checkout
                        </button>
                        <div className="flex items-center justify-center gap-4 pt-4 text-outline-variant">
                            <span className="material-symbols-outlined text-lg">lock</span>
                            <span className="text-xs uppercase tracking-widest font-bold">Secure SSL Checkout</span>
                        </div>
                    </div>
                    
                    <div className="mt-8 p-4 bg-surface-container-low rounded-xl">
                        <p className="text-xs text-on-surface-variant leading-relaxed">
                            Shipping globally from our atelier in Florence. Standard delivery 3-5 business days. Free returns within 30 days.
                        </p>
                    </div>
                </aside>
            </div>

            {/* You Might Also Like Section */}
            {featuredProducts && featuredProducts.length > 0 && (
                <section className="mt-32 border-t border-outline-variant/10 pt-16">
                    <h3 className="text-2xl font-bold tracking-tight mb-8">You Might Also Like</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {featuredProducts.slice(0, 4).map((product) => (
                            <Link key={product.id} to={`/products/${product.slug}`} className="space-y-4 group cursor-pointer block">
                                <div className="aspect-[4/5] bg-surface-container-low rounded-lg overflow-hidden relative border border-outline-variant/10">
                                    <img 
                                        src={product.image_url || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800'} 
                                        alt={product.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
                                    />
                                    {product.is_featured && (
                                        <div className="absolute bottom-4 left-4">
                                            <span className="bg-surface-container-lowest/80 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm">
                                                Featured
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <p className="text-sm font-bold line-clamp-1 group-hover:text-primary transition-colors">{product.name}</p>
                                    <p className="text-sm text-on-surface-variant">${parseFloat(product.price).toFixed(2)}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            )}
        </main>
    );
};

export default CartPage;