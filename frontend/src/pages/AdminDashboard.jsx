import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { getAdminStats, getAdminCategories } from '../services/adminService';
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis } from 'recharts';
import ProductModal from '../components/admin/ProductModal';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { data: statsResp, isLoading } = useQuery({
        queryKey: ['adminStats'],
        queryFn: getAdminStats,
    });

    const { data: categoriesResp } = useQuery({
        queryKey: ['adminCategories'],
        queryFn: getAdminCategories,
    });

    const [isProductModalOpen, setIsProductModalOpen] = useState(false);

    const stats = statsResp?.data || statsResp;
    const summary = stats?.summary;
    const categories = categoriesResp?.data || [];

    if (isLoading) return (
        <div className="pt-40 pb-40 text-center flex flex-col justify-center items-center font-manrope">
             <span className="material-symbols-outlined animate-spin text-4xl text-primary mb-4" style={{ animationDirection: 'reverse' }}>progress_activity</span>
             <p className="text-sm font-bold text-on-surface-variant uppercase tracking-widest">Loading Dashboard</p>
        </div>
    );

    const formatCurrency = (val) => `$${parseFloat(val || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    const formatNumber = (val) => (val || 0).toLocaleString();

    return (
        <div className="font-manrope animate-in fade-in duration-700">
            {/* Dashboard Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
                <div>
                    <h2 className="text-3xl font-extrabold tracking-tight text-on-surface mb-2">Admin Dashboard</h2>
                    <p className="text-on-surface-variant">Overview of your atelier's performance this month.</p>
                </div>
                <div className="flex items-center gap-4 bg-surface-container-lowest p-1.5 rounded-full shadow-sm">
                    <button className="px-6 py-2 rounded-full text-sm font-medium bg-surface-container-low text-on-surface">Last 30 Days</button>
                    <button className="px-6 py-2 rounded-full text-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors"
                        onClick={() => {
                            queryClient.invalidateQueries(['adminStats']);
                            toast.success('Stats refreshed.');
                        }}
                    >
                        Refresh
                    </button>
                    <button className="material-symbols-outlined p-2 text-on-surface-variant cursor-pointer hover:bg-surface-container-low rounded-full transition-colors" data-icon="calendar_today">calendar_today</button>
                </div>
            </header>

            {/* KPI Cards Grid */}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
                <div className="bg-surface-container-lowest p-8 rounded-xl transition-all duration-400 hover:shadow-[0_20px_40px_rgba(45,52,53,0.06)] group cursor-pointer hover:-translate-y-1" onClick={() => navigate('/admin/orders')}>
                    <div className="flex justify-between items-start mb-6">
                        <div className="p-3 bg-surface-container-low rounded-xl group-hover:bg-secondary-container transition-colors">
                            <span className="material-symbols-outlined text-primary" data-icon="payments">payments</span>
                        </div>
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">+12.5%</span>
                    </div>
                    <p className="text-sm font-bold text-on-surface-variant uppercase tracking-widest mb-1">Total Sales</p>
                    <h3 className="text-2xl font-extrabold text-on-surface">{formatCurrency(summary?.total_sales)}</h3>
                </div>
                
                <div className="bg-surface-container-lowest p-8 rounded-xl transition-all duration-400 hover:shadow-[0_20px_40px_rgba(45,52,53,0.06)] group cursor-pointer hover:-translate-y-1" onClick={() => navigate('/admin/orders')}>
                    <div className="flex justify-between items-start mb-6">
                        <div className="p-3 bg-surface-container-low rounded-xl group-hover:bg-secondary-container transition-colors">
                            <span className="material-symbols-outlined text-primary" data-icon="shopping_cart">shopping_cart</span>
                        </div>
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">+8.2%</span>
                    </div>
                    <p className="text-sm font-bold text-on-surface-variant uppercase tracking-widest mb-1">Total Orders</p>
                    <h3 className="text-2xl font-extrabold text-on-surface">{formatNumber(summary?.total_orders)}</h3>
                </div>
                
                <div className="bg-surface-container-lowest p-8 rounded-xl transition-all duration-400 hover:shadow-[0_20px_40px_rgba(45,52,53,0.06)] group cursor-pointer hover:-translate-y-1" onClick={() => navigate('/admin/customers')}>
                    <div className="flex justify-between items-start mb-6">
                        <div className="p-3 bg-surface-container-low rounded-xl group-hover:bg-secondary-container transition-colors">
                            <span className="material-symbols-outlined text-primary" data-icon="person_add">person_add</span>
                        </div>
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">+15.4%</span>
                    </div>
                    <p className="text-sm font-bold text-on-surface-variant uppercase tracking-widest mb-1">Active Customers</p>
                    <h3 className="text-2xl font-extrabold text-on-surface">{formatNumber(summary?.total_customers)}</h3>
                </div>
                
                <div className="bg-surface-container-lowest p-8 rounded-xl transition-all duration-400 hover:shadow-[0_20px_40px_rgba(45,52,53,0.06)] group cursor-pointer hover:-translate-y-1" onClick={() => navigate('/admin/orders')}>
                    <div className="flex justify-between items-start mb-6">
                        <div className="p-3 bg-surface-container-low rounded-xl group-hover:bg-secondary-container transition-colors">
                            <span className="material-symbols-outlined text-primary" data-icon="analytics">analytics</span>
                        </div>
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">+4.1%</span>
                    </div>
                    <p className="text-sm font-bold text-on-surface-variant uppercase tracking-widest mb-1">Avg. Order Value</p>
                    <h3 className="text-2xl font-extrabold text-on-surface">{formatCurrency(summary?.total_orders ? summary.total_sales / summary.total_orders : 0)}</h3>
                </div>
            </section>

            {/* Main Chart & Top Selling Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-16">
                
                {/* Sales Chart */}
                <div className="lg:col-span-2 bg-surface-container-lowest p-10 rounded-xl relative overflow-hidden flex flex-col min-h-[400px] border border-surface-container-low">
                    <div className="flex justify-between items-center mb-10 relative z-20">
                        <h4 className="text-lg font-bold text-on-surface">Revenue Statistics</h4>
                        <select className="bg-transparent border-none text-sm font-semibold text-on-surface-variant focus:ring-0 cursor-pointer text-right min-w-[100px] hover:bg-surface-container-low rounded-lg py-1 px-2 transition-colors">
                            <option>Monthly</option>
                            <option>Weekly</option>
                        </select>
                    </div>
                    
                    <div className="flex-1 w-full relative z-20 min-h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={stats?.chart_data?.length ? stats.chart_data : [{date: 'No Data', total: 0}]} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                        <stop offset="0%" stopColor="#5f5e5e" stopOpacity={0.15}></stop>
                                        <stop offset="100%" stopColor="#5f5e5e" stopOpacity={0}></stop>
                                    </linearGradient>
                                </defs>
                                <XAxis 
                                    dataKey="date" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{fontSize: 10, fontWeight: 700, fill: '#adb3b4'}}
                                    dy={10}
                                    tickFormatter={(str) => {
                                        try {
                                            if (str === 'No Data') return '';
                                            const date = new Date(str);
                                            return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
                                        } catch(e) { return "" }
                                    }}
                                />
                                <Tooltip 
                                    cursor={{ stroke: '#adb3b4', strokeWidth: 1, strokeDasharray: '4 4' }}
                                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #dde4e5', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)', fontSize: '12px', fontWeight: 'bold' }} 
                                />
                                <Area type="monotone" dataKey="total" stroke="#5f5e5e" strokeWidth={3} fill="url(#gradient)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
                        <span className="text-8xl font-black rotate-[-5deg] tracking-tighter">REVENUE</span>
                    </div>
                </div>

                {/* Top Selling Products */}
                <div className="bg-surface-container-lowest p-8 rounded-xl flex flex-col border border-surface-container-low">
                    <div className="flex justify-between items-center mb-8">
                        <h4 className="text-lg font-bold text-on-surface">Top Selling</h4>
                        <Link to="/admin/products" className="text-xs font-bold text-primary hover:underline underline-offset-4">View All</Link>
                    </div>
                    <div className="space-y-6 flex-1">
                        {stats?.top_products?.length > 0 ? stats.top_products.slice(0, 3).map((product) => (
                            <div key={product.id} className="flex items-center gap-4 cursor-pointer group" onClick={() => navigate(`/product/${product.slug}`)}>
                                <img 
                                    src={product.image_url || 'https://via.placeholder.com/64x80'} 
                                    alt={product.name}
                                    className="w-16 h-20 rounded-lg object-cover bg-surface-container-low group-hover:opacity-80 transition-opacity" 
                                />
                                <div className="flex-1 overflow-hidden">
                                    <h5 className="text-sm font-bold text-on-surface mb-0.5 truncate pr-2 group-hover:text-primary transition-colors">{product.name}</h5>
                                    <p className="text-xs text-on-surface-variant">{product.total_sold || 0} Sales</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-on-surface">${parseFloat(product.price).toFixed(2)}</p>
                                </div>
                            </div>
                        )) : (
                            <div className="text-center py-10 text-on-surface-variant/50 font-bold text-xs uppercase tracking-widest">
                                No Products Sold Yet
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Recent Orders Table */}
            <section className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-[0_2px_10px_rgba(45,52,53,0.02)] border border-surface-container-low">
                <div className="p-8 flex justify-between items-center border-b border-surface-container-low">
                    <h4 className="text-lg font-bold text-on-surface">Recent Orders</h4>
                    <div className="flex items-center gap-2">
                        <button className="p-2 hover:bg-surface-container-low rounded-full transition-colors group">
                            <span className="material-symbols-outlined text-on-surface-variant group-hover:text-on-surface text-xl" data-icon="filter_list">filter_list</span>
                        </button>
                        <button className="p-2 hover:bg-surface-container-low rounded-full transition-colors group">
                            <span className="material-symbols-outlined text-on-surface-variant group-hover:text-on-surface text-xl" data-icon="download">download</span>
                        </button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-surface-container-low/30 border-b border-surface-container-low">
                                <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Order ID</th>
                                <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Customer</th>
                                <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Date</th>
                                <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant text-right">Total</th>
                                <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant text-center">Status</th>
                                <th className="px-8 py-4"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-surface-container-low">
                            {stats?.recent_orders?.length > 0 ? stats.recent_orders.slice(0, 5).map((order) => {
                                const colors = {
                                    pending: 'bg-slate-100 text-slate-800 border border-slate-200',
                                    processing: 'bg-blue-100 text-blue-800 border border-blue-200',
                                    shipped: 'bg-amber-100 text-amber-800 border border-amber-200',
                                    delivered: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
                                    cancelled: 'bg-red-100 text-red-800 border border-red-200',
                                };
                                const bgAvatar = {
                                    pending: 'bg-surface-variant text-on-surface-variant',
                                    processing: 'bg-info-container text-on-info-container',
                                    shipped: 'bg-primary-container text-on-primary-container',
                                    delivered: 'bg-secondary-container text-on-secondary-container',
                                    cancelled: 'bg-error-container text-on-error-container',
                                };
                                const statusClass = colors[order.status?.toLowerCase()] || colors.pending;
                                const avatarClass = bgAvatar[order.status?.toLowerCase()] || bgAvatar.pending;

                                return (
                                    <tr key={order.id} className="hover:bg-surface-container-lowest transition-colors group cursor-pointer" onClick={() => navigate(`/admin/orders/${order.id}`)}>
                                        <td className="px-8 py-6 text-sm font-bold text-on-surface">#{order.order_number}</td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold ${avatarClass}`}>
                                                    {order.user?.name?.substring(0,2).toUpperCase() || 'GS'}
                                                </div>
                                                <span className="text-sm font-medium text-on-surface">{order.user?.name || 'Guest'}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-sm text-on-surface-variant">
                                            {new Date(order.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </td>
                                        <td className="px-8 py-6 text-sm font-bold text-on-surface text-right">{formatCurrency(order.total)}</td>
                                        <td className="px-8 py-6">
                                            <div className="flex justify-center">
                                                <span className={`px-4 py-1.5 rounded-full text-[9px] font-extrabold uppercase tracking-widest ${statusClass}`}>
                                                    {order.status}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <button className="material-symbols-outlined text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity" data-icon="more_vert">more_vert</button>
                                        </td>
                                    </tr>
                                )
                            }) : (
                                <tr>
                                    <td colSpan="6" className="text-center py-12 text-sm font-bold text-on-surface-variant uppercase tracking-widest">No Active Orders</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                {stats?.recent_orders?.length > 5 && (
                    <div className="p-6 text-center border-t border-surface-container-low">
                        <Link to="/admin/orders" className="text-sm font-bold text-on-surface-variant hover:text-on-surface transition-colors flex items-center justify-center gap-2 mx-auto decoration-2 underline-offset-4 hover:underline">
                            Load More Transactions
                            <span className="material-symbols-outlined text-xs" data-icon="expand_more">expand_more</span>
                        </Link>
                    </div>
                )}
            </section>
            
            {/* Floating Action Button */}
            <button 
                onClick={() => setIsProductModalOpen(true)}
                className="fixed bottom-10 right-10 w-14 h-14 bg-on-surface text-surface flex items-center justify-center rounded-full shadow-[0_10px_40px_rgba(45,52,53,0.3)] hover:scale-110 active:scale-95 transition-all group z-40 overflow-visible"
            >
                <span className="material-symbols-outlined" data-icon="add" style={{ fontVariationSettings: "'FILL' 1" }}>add</span>
                <span className="absolute right-full mr-4 bg-on-surface text-surface text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-full whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl">New Product</span>
            </button>

            <ProductModal 
                isOpen={isProductModalOpen}
                onClose={() => setIsProductModalOpen(false)}
                product={null}
                categories={categories}
            />
        </div>
    );
};

export default AdminDashboard;
