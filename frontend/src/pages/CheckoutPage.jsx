import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Loader2 } from 'lucide-react';
import { getCart, applyCoupon } from '../services/cartService';
import { placeOrder } from '../services/orderService';
import useAuthStore from '../store/authStore';

const CheckoutPage = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const { token } = useAuthStore();

    const [formData, setFormData] = useState({
        full_name: '', email: '', phone: '', address_line1: '', address_line2: '',
        city: '', state: '', zip: '', country: 'Egypt',
        payment_method: 'card', shipping_method: 'standard', notes: ''
    });
    const set = (key, val) => setFormData(p => ({ ...p, [key]: val }));

    const [couponCode, setCouponCode] = useState('');

    const { data: cartResp, isLoading: cartLoading } = useQuery({
        queryKey: ['cart'],
        queryFn: getCart,
        enabled: !!token
    });
    const cart = cartResp;

    const applyMutation = useMutation({
        mutationFn: (code) => applyCoupon(code),
        onSuccess: () => {
            queryClient.invalidateQueries(['cart']);
            toast.success('Promo code applied successfully');
            setCouponCode('');
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Invalid promo code'),
    });

    const orderMutation = useMutation({
        mutationFn: (data) => placeOrder(data),
        onSuccess: () => {
            queryClient.invalidateQueries(['cart']);
            toast.success('Order placed successfully!');
            navigate('/orders');
        },
        onError: (err) => {
            const errors = err.response?.data?.errors;
            if (errors) Object.values(errors).forEach(e => toast.error(e[0]));
            else toast.error(err.response?.data?.message || 'Checkout failed');
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        orderMutation.mutate(formData);
    };

    if (!token) {
        return (
            <div className="pt-40 pb-40 min-h-screen flex flex-col items-center justify-center bg-surface text-center px-6">
                <span className="material-symbols-outlined text-6xl text-on-surface-variant mb-6">lock</span>
                <h2 className="text-3xl font-extrabold tracking-tighter mb-4 text-on-surface">Authentication Required</h2>
                <p className="text-on-surface-variant font-medium max-w-sm mb-8">
                    Please log in to complete your purchase.
                </p>
                <Link to="/login">
                    <button className="bg-primary text-on-primary px-10 py-4 rounded-full font-bold uppercase tracking-widest text-xs shadow-lg">
                        Sign In
                    </button>
                </Link>
            </div>
        );
    }

    if (cartLoading) return (
        <div className="pt-40 min-h-screen flex items-center justify-center bg-surface">
            <Loader2 className="w-12 h-12 text-primary animate-spin inline-block mx-auto" />
        </div>
    );

    if (!cart || cart.items?.length === 0) {
        return (
            <div className="pt-40 pb-40 min-h-screen flex flex-col items-center justify-center bg-surface text-center px-6">
                <div className="w-24 h-24 bg-surface-container-low rounded-full flex items-center justify-center mb-6 text-on-surface-variant">
                    <span className="material-symbols-outlined text-4xl">shopping_bag</span>
                </div>
                <h2 className="text-3xl font-extrabold tracking-tighter mb-4 text-on-surface">Your cart is empty.</h2>
                <Link to="/products">
                    <button className="bg-primary text-on-primary px-10 py-4 rounded-full font-bold uppercase tracking-widest text-xs shadow-lg mt-8 border-none">
                        Explore Collection
                    </button>
                </Link>
            </div>
        );
    }

    const paymentMethodsList = [
        { id: 'card', iconName: 'credit_card', label: 'Card' },
        { id: 'cod', iconName: 'payments', label: 'Cash' },
        { id: 'instapay', iconName: 'bolt', label: 'InstaPay' },
        { id: 'vodafone_cash', iconName: 'phone_iphone', label: 'Vodafone' },
    ];

    return (
        <main className="font-manrope text-on-surface pt-32 pb-24 px-6 md:px-12 max-w-screen-xl mx-auto min-h-screen">
            <header className="mb-16">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-on-surface mb-4">Checkout</h1>
                <p className="text-on-surface-variant font-medium">Review your order and select shipping preferences.</p>
            </header>
            
            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
                {/* Left Column: Forms */}
                <div className="lg:col-span-7 space-y-16">
                    
                    {/* Shipping Information */}
                    <section>
                        <div className="flex items-center gap-3 mb-8">
                            <span className="w-8 h-8 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center text-xs font-bold">01</span>
                            <h2 className="text-xl font-semibold tracking-tight uppercase">Shipping Information</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold tracking-widest uppercase text-on-surface-variant mb-2">Full Name</label>
                                <input 
                                    className="w-full bg-surface-container-low border-none rounded-lg px-4 py-3 focus:ring-1 focus:ring-outline-variant transition-all outline-none" 
                                    placeholder="Ahmed Mohamed" 
                                    required
                                    type="text"
                                    value={formData.full_name}
                                    onChange={e => set('full_name', e.target.value)}
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold tracking-widest uppercase text-on-surface-variant mb-2">Email Address</label>
                                <input 
                                    className="w-full bg-surface-container-low border-none rounded-lg px-4 py-3 focus:ring-1 focus:ring-outline-variant transition-all outline-none" 
                                    placeholder="design@mohanad.com" 
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={e => set('email', e.target.value)}
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold tracking-widest uppercase text-on-surface-variant mb-2">Shipping Address</label>
                                <input 
                                    className="w-full bg-surface-container-low border-none rounded-lg px-4 py-3 focus:ring-1 focus:ring-outline-variant transition-all outline-none" 
                                    placeholder="123 Minimalist Way" 
                                    type="text"
                                    required
                                    value={formData.address_line1}
                                    onChange={e => set('address_line1', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold tracking-widest uppercase text-on-surface-variant mb-2">Phone Number</label>
                                <input 
                                    className="w-full bg-surface-container-low border-none rounded-lg px-4 py-3 focus:ring-1 focus:ring-outline-variant transition-all outline-none" 
                                    placeholder="+1 234 567 890" 
                                    type="tel"
                                    required
                                    value={formData.phone}
                                    onChange={e => set('phone', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold tracking-widest uppercase text-on-surface-variant mb-2">Postal Code</label>
                                <input 
                                    className="w-full bg-surface-container-low border-none rounded-lg px-4 py-3 focus:ring-1 focus:ring-outline-variant transition-all outline-none" 
                                    placeholder="10001" 
                                    type="text"
                                    value={formData.zip}
                                    onChange={e => set('zip', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold tracking-widest uppercase text-on-surface-variant mb-2">City</label>
                                <input 
                                    className="w-full bg-surface-container-low border-none rounded-lg px-4 py-3 focus:ring-1 focus:ring-outline-variant transition-all outline-none" 
                                    placeholder="Cairo" 
                                    type="text"
                                    required
                                    value={formData.city}
                                    onChange={e => set('city', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold tracking-widest uppercase text-on-surface-variant mb-2">State / Region</label>
                                <input 
                                    className="w-full bg-surface-container-low border-none rounded-lg px-4 py-3 focus:ring-1 focus:ring-outline-variant transition-all outline-none" 
                                    placeholder="Cairo" 
                                    type="text"
                                    required
                                    value={formData.state}
                                    onChange={e => set('state', e.target.value)}
                                />
                            </div>
                        </div>
                    </section>

                    {/* Shipping Method */}
                    <section>
                        <div className="flex items-center gap-3 mb-8">
                            <span className="w-8 h-8 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center text-xs font-bold">02</span>
                            <h2 className="text-xl font-semibold tracking-tight uppercase">Shipping Method</h2>
                        </div>
                        <div className="space-y-4">
                            <label className="relative flex items-center p-5 rounded-xl bg-surface-container-lowest cursor-pointer group transition-all hover:bg-surface-container-low border border-outline-variant/10 shadow-sm">
                                <input 
                                    type="radio" 
                                    name="shipping" 
                                    value="standard"
                                    checked={formData.shipping_method === 'standard'}
                                    onChange={e => set('shipping_method', e.target.value)}
                                    className="w-5 h-5 text-primary border-outline-variant focus:ring-primary" 
                                />
                                <div className="ml-4 flex-1">
                                    <div className="flex justify-between items-center">
                                        <span className="font-semibold text-on-surface">Standard Delivery</span>
                                        <span className="font-bold text-on-surface">$15.00</span>
                                    </div>
                                    <p className="text-sm text-on-surface-variant">4-7 business days via courier</p>
                                </div>
                            </label>
                            <label className="relative flex items-center p-5 rounded-xl bg-surface-container-lowest cursor-pointer group transition-all hover:bg-surface-container-low border border-outline-variant/10 shadow-sm">
                                <input 
                                    type="radio" 
                                    name="shipping" 
                                    value="express"
                                    checked={formData.shipping_method === 'express'}
                                    onChange={e => set('shipping_method', e.target.value)}
                                    className="w-5 h-5 text-primary border-outline-variant focus:ring-primary" 
                                />
                                <div className="ml-4 flex-1">
                                    <div className="flex justify-between items-center">
                                        <span className="font-semibold text-on-surface">Express Delivery</span>
                                        <span className="font-bold text-on-surface">$45.00</span>
                                    </div>
                                    <p className="text-sm text-on-surface-variant">1-2 business days with priority tracking</p>
                                </div>
                            </label>
                        </div>
                    </section>

                    {/* Payment Method */}
                    <section>
                        <div className="flex items-center gap-3 mb-8">
                            <span className="w-8 h-8 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center text-xs font-bold">03</span>
                            <h2 className="text-xl font-semibold tracking-tight uppercase">Payment Method</h2>
                        </div>
                        
                        <div className="flex flex-wrap gap-4 mb-8">
                            {paymentMethodsList.map((method) => (
                                <button 
                                    type="button"
                                    key={method.id}
                                    onClick={() => set('payment_method', method.id)}
                                    className={`flex-1 py-4 px-6 rounded-full flex items-center justify-center gap-2 transition-all ${
                                        formData.payment_method === method.id 
                                        ? 'bg-surface-container-high border-2 border-primary-dim' 
                                        : 'bg-surface-container-low border-2 border-transparent hover:bg-surface-container-high'
                                    }`}
                                >
                                    <span className="material-symbols-outlined text-lg">{method.iconName}</span>
                                    <span className="text-sm font-bold uppercase tracking-wider">{method.label}</span>
                                </button>
                            ))}
                        </div>

                        {formData.payment_method === 'card' && (
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-in slide-in-from-top-4 duration-500">
                                <div className="md:col-span-4 relative">
                                    <label className="block text-xs font-bold tracking-widest uppercase text-on-surface-variant mb-2">Card Number</label>
                                    <input 
                                        className="w-full bg-surface-container-low border-none rounded-lg px-4 py-3 focus:ring-1 focus:ring-outline-variant transition-all outline-none" 
                                        placeholder="0000 0000 0000 0000" 
                                        type="text"
                                    />
                                    <div className="absolute right-4 bottom-3 flex gap-2">
                                        <span className="material-symbols-outlined text-on-surface-variant">credit_card</span>
                                    </div>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold tracking-widest uppercase text-on-surface-variant mb-2">Expiry Date</label>
                                    <input 
                                        className="w-full bg-surface-container-low border-none rounded-lg px-4 py-3 focus:ring-1 focus:ring-outline-variant transition-all outline-none" 
                                        placeholder="MM / YY" 
                                        type="text"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold tracking-widest uppercase text-on-surface-variant mb-2">CVV</label>
                                    <input 
                                        className="w-full bg-surface-container-low border-none rounded-lg px-4 py-3 focus:ring-1 focus:ring-outline-variant transition-all outline-none" 
                                        placeholder="123" 
                                        type="text"
                                    />
                                </div>
                            </div>
                        )}
                        
                        {(formData.payment_method === 'instapay' || formData.payment_method === 'vodafone_cash') && (
                            <div className="bg-surface-container-low p-6 rounded-xl text-center">
                                <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-4">account_balance_wallet</span>
                                <h3 className="font-bold mb-2 uppercase tracking-widest text-sm">Transfer Instructions</h3>
                                <p className="text-sm text-on-surface-variant max-w-sm mx-auto">
                                    Please proceed with placing your order. Our agent will contact you with the specific number/address to send the funds.
                                </p>
                            </div>
                        )}
                        
                    </section>
                </div>

                {/* Right Column: Summary */}
                <aside className="lg:col-span-5 sticky top-32">
                    <div className="bg-surface-container-lowest rounded-xl p-8 shadow-[0_20px_40px_rgba(45,52,53,0.06)] border border-outline-variant/10">
                        <h2 className="text-xl font-bold uppercase tracking-tight mb-8">Order Summary</h2>
                        
                        {/* Cart Items */}
                        <div className="space-y-6 mb-10 pb-10 border-b border-surface-container-low max-h-[300px] overflow-y-auto no-scrollbar">
                            {cart.items.map((item) => (
                                <div key={item.id} className="flex gap-4">
                                    <div className="w-20 h-28 bg-surface-container-low rounded-lg overflow-hidden flex-shrink-0 border border-outline-variant/10">
                                        <img 
                                            src={item.product?.image_url || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800'} 
                                            alt={item.product?.name} 
                                            className="w-full h-full object-cover" 
                                        />
                                    </div>
                                    <div className="flex flex-col justify-between py-1">
                                        <div>
                                            <h3 className="font-bold text-on-surface line-clamp-1">{item.product?.name}</h3>
                                            <p className="text-xs text-on-surface-variant uppercase tracking-widest mt-1 truncate">
                                                Qty: {item.quantity} {item.variant ? `| ${item.variant.name}` : ''}
                                            </p>
                                        </div>
                                        <span className="font-bold">${parseFloat(item.total).toFixed(2)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Promo Code */}
                        <div className="mb-10">
                            <label className="block text-xs font-bold tracking-widest uppercase text-on-surface-variant mb-3">Promo Code</label>
                            <div className="flex gap-2">
                                <input 
                                    className="flex-1 bg-surface-container-low border-none rounded-lg px-4 py-2 focus:ring-1 focus:ring-outline-variant outline-none text-sm" 
                                    placeholder="ATELIER10" 
                                    type="text"
                                    value={couponCode}
                                    onChange={e => setCouponCode(e.target.value)}
                                />
                                <button 
                                    type="button"
                                    disabled={applyMutation.isPending || !couponCode}
                                    onClick={() => applyMutation.mutate(couponCode)}
                                    className="bg-on-surface text-on-primary px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-opacity disabled:opacity-50"
                                >
                                    {applyMutation.isPending ? '...' : 'Apply'}
                                </button>
                            </div>
                        </div>

                        {/* Pricing Breakdown */}
                        <div className="space-y-4 mb-10">
                            <div className="flex justify-between text-sm">
                                <span className="text-on-surface-variant uppercase tracking-widest">Subtotal</span>
                                <span className="font-semibold text-on-surface tabular-nums">${parseFloat(cart.totals?.subtotal || 0).toFixed(2)}</span>
                            </div>
                            
                            {cart.totals?.discount > 0 && (
                                <div className="flex justify-between text-sm text-emerald-500">
                                    <span className="uppercase tracking-widest">Discount</span>
                                    <span className="font-semibold tabular-nums">-${parseFloat(cart.totals?.discount || 0).toFixed(2)}</span>
                                </div>
                            )}

                            <div className="flex justify-between text-sm">
                                <span className="text-on-surface-variant uppercase tracking-widest">Shipping</span>
                                <span className="font-semibold text-on-surface tabular-nums">
                                    {formData.shipping_method === 'express' 
                                        ? '$45.00' 
                                        : (cart.totals?.shipping > 0 ? `$${parseFloat(cart.totals.shipping).toFixed(2)}` : '$15.00')}
                                </span>
                            </div>
                            
                            <div className="flex justify-between text-sm">
                                <span className="text-on-surface-variant uppercase tracking-widest">Taxes</span>
                                <span className="font-semibold text-on-surface tabular-nums">${parseFloat(cart.totals?.tax || 0).toFixed(2)}</span>
                            </div>

                            <div className="pt-6 mt-6 border-t border-surface-container-low flex justify-between items-end">
                                <span className="text-lg font-bold uppercase tracking-tighter">Total</span>
                                <div className="text-right">
                                    <span className="text-xs text-on-surface-variant uppercase tracking-widest block mb-1">USD</span>
                                    <span className="text-3xl font-extrabold tracking-tighter text-on-surface tabular-nums">
                                        {/* A simplified recalculation representation adjusting for shipping choice difference. 
                                            Ideally handled by API calculation when shipping changes. */}
                                        ${(parseFloat(cart.totals?.total || 0) + (formData.shipping_method === 'express' ? 30 : 0)).toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <button 
                            type="submit"
                            disabled={orderMutation.isPending}
                            className="w-full py-5 bg-primary text-on-primary rounded-full font-bold uppercase tracking-[0.2em] shadow-lg hover:bg-primary-dim transition-all active:scale-[0.98] disabled:opacity-50"
                        >
                            {orderMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Complete Order'}
                        </button>
                        
                        <p className="text-center text-[10px] text-on-surface-variant mt-6 uppercase tracking-widest">
                            Secure checkout powered by Atelier Systems
                        </p>
                    </div>
                </aside>
            </form>
        </main>
    );
};

export default CheckoutPage;