import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import axiosInstance from '../services/axiosInstance';
import useAuthStore from '../store/authStore';
import { toast } from 'react-hot-toast';

const OrdersPage = () => {
    const { token, logout } = useAuthStore();
    const navigate = useNavigate();

    const { data: ordersResp, isLoading } = useQuery({
        queryKey: ['myOrders'],
        queryFn: async () => {
            const { data } = await axiosInstance.get('/orders');
            return data;
        },
        enabled: !!token
    });

    const orders = ordersResp?.data || ordersResp || [];

    const getStatusStyles = (status) => {
        switch (status?.toLowerCase()) {
            case 'completed': 
            case 'delivered': 
                return 'bg-secondary-container text-on-secondary-container';
            case 'processing': 
            case 'pending': 
                return 'bg-primary-container text-on-primary-container';
            case 'shipped': 
                return 'bg-surface-variant text-on-surface-variant';
            case 'cancelled': 
                return 'bg-error-container text-on-error-container';
            default: 
                return 'bg-surface-container-high text-on-surface-variant';
        }
    };

    const handleLogout = (e) => {
        e.preventDefault();
        logout();
        navigate('/');
        toast.success('Logged out successfully');
    };

    return (
        <main className="font-manrope pt-32 pb-24 px-6 max-w-7xl mx-auto min-h-screen">
            <div className="flex flex-col md:flex-row gap-12">
                {/* Sidebar Navigation */}
                <aside className="w-full md:w-64 flex-shrink-0">
                    <div className="sticky top-32 space-y-8">
                        <div className="px-2">
                            <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-secondary mb-6 opacity-60">Account Settings</h2>
                            <nav className="space-y-2">
                                <Link to="/profile" className="flex items-center gap-4 px-4 py-3 rounded-full text-zinc-500 hover:bg-surface-container-low transition-all duration-300">
                                    <span className="material-symbols-outlined text-[20px]">person</span>
                                    <span className="font-medium">Profile</span>
                                </Link>
                                <Link to="/wishlist" className="flex items-center gap-4 px-4 py-3 rounded-full text-zinc-500 hover:bg-surface-container-low transition-all duration-300">
                                    <span className="material-symbols-outlined text-[20px]">favorite</span>
                                    <span className="font-medium">Wishlist</span>
                                </Link>
                                <Link to="/orders" className="flex items-center gap-4 px-4 py-3 rounded-full bg-surface-container-low text-zinc-900 font-semibold shadow-sm">
                                    <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>package_2</span>
                                    <span className="font-medium">Order History</span>
                                </Link>
                            </nav>
                        </div>
                        <div className="bg-surface-container-low rounded-xl p-6 hidden md:block">
                            <p className="text-sm text-on-surface-variant leading-relaxed">Need help with an order? Our concierge is available 24/7.</p>
                            <button className="mt-4 text-xs font-bold uppercase tracking-widest text-primary hover:text-on-surface transition-colors">Contact Support</button>
                        </div>
                        <div className="px-2 pt-8 border-t border-outline-variant/15">
                            <button onClick={handleLogout} className="w-full flex items-center gap-4 px-4 py-3 rounded-full text-error/80 hover:bg-error/5 transition-all duration-400">
                                <span className="material-symbols-outlined text-base">logout</span>
                                <span className="text-sm font-medium">Sign Out</span>
                            </button>
                        </div>
                    </div>
                </aside>

                {/* Main Content: Order History */}
                <section className="flex-grow">
                    <header className="mb-12">
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-on-surface mb-4">Order History</h1>
                        <p className="text-on-surface-variant text-lg max-w-2xl">Track, manage and review your previous purchases at Mohanad Atelier.</p>
                    </header>

                    {isLoading ? (
                        <div className="flex justify-center items-center py-32">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        </div>
                    ) : orders.length > 0 ? (
                        <div className="space-y-6">
                            {orders.map((order) => {
                                const firstItem = order.items?.[0];
                                const isMultiple = order.items?.length > 1;
                                const defaultImage = 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800';
                                
                                return (
                                    <div key={order.id} className="group bg-surface-container-lowest rounded-xl p-8 shadow-[0_2px_15px_rgba(0,0,0,0.02)] transition-all duration-400 hover:shadow-[0_20px_40px_rgba(45,52,53,0.06)]">
                                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                                            <div className="flex items-center gap-6">
                                                <div className="w-20 h-24 bg-surface-container-low rounded-lg overflow-hidden flex-shrink-0">
                                                    <img 
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                                                        src={firstItem?.product?.image_url || defaultImage} 
                                                        alt="Order thumbnail" 
                                                    />
                                                </div>
                                                <div>
                                                    <div className="flex flex-wrap items-center gap-3 mb-1">
                                                        <span className="text-xs font-bold uppercase tracking-widest text-secondary-dim">Order #{order.order_number}</span>
                                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusStyles(order.status)}`}>
                                                            {order.status || 'Pending'}
                                                        </span>
                                                    </div>
                                                    <h3 className="text-xl font-bold text-on-surface mb-1">
                                                        {firstItem?.product?.name || 'Various Items'} {isMultiple ? `(+${order.items.length - 1} more)` : ''}
                                                    </h3>
                                                    <p className="text-sm text-on-surface-variant">Placed on {new Date(order.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                                </div>
                                            </div>
                                            <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-2">
                                                <span className="text-2xl font-bold text-on-surface whitespace-nowrap">${parseFloat(order.total || 0).toFixed(2)}</span>
                                                <Link to={`/orders/${order.order_number}`} className="flex items-center gap-2 text-sm font-bold text-primary hover:text-on-surface transition-colors whitespace-nowrap">
                                                    View Details
                                                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-24 text-center bg-surface-container-lowest rounded-3xl border border-outline-variant/10">
                            <div className="w-24 h-24 bg-surface-container-low rounded-full flex items-center justify-center mb-6">
                                <span className="material-symbols-outlined text-4xl text-on-surface-variant">shopping_bag</span>
                            </div>
                            <h2 className="text-2xl font-bold text-on-surface mb-2">No orders yet</h2>
                            <p className="text-on-surface-variant mb-8 max-w-sm">When you buy something, your order history will appear here.</p>
                            <Link to="/products">
                                <button className="bg-primary text-on-primary px-8 py-3 rounded-full font-bold transition-all hover:bg-primary-dim">Start Shopping</button>
                            </Link>
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
};

export default OrdersPage;
