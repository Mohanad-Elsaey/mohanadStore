import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../services/axiosInstance';
import { getAdminOrders, getAdminStats } from '../services/adminService';
import { toast } from 'react-hot-toast';

const AdminOrders = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [page, setPage] = useState(1);
    const [status, setStatus] = useState('');
    const [search, setSearch] = useState('');

    const { data: ordersResp, isLoading } = useQuery({
        queryKey: ['adminOrders', page, status, search],
        queryFn: () => getAdminOrders({ page, status, search }),
    });

    const { data: statsResp } = useQuery({
        queryKey: ['adminStats'],
        queryFn: getAdminStats,
    });

    const orders = ordersResp?.data;
    const meta = ordersResp?.meta || { last_page: 1, current_page: 1 };
    const summary = statsResp?.data?.summary || {};

    const updateStatusMutation = useMutation({
        mutationFn: ({ id, status }) => axiosInstance.patch(`/admin/orders/${id}/status`, { status }),
        onSuccess: () => {
             queryClient.invalidateQueries({ queryKey: ['adminOrders'] });
             queryClient.invalidateQueries({ queryKey: ['adminStats'] });
             toast.success('Order status updated.');
        },
        onError: () => toast.error('Status update failed.')
    });

    if (isLoading) return (
        <div className="flex flex-col items-center justify-center py-40 space-y-6 font-manrope">
            <span className="material-symbols-outlined animate-spin text-4xl text-primary" style={{ animationDirection: 'reverse' }}>progress_activity</span>
            <p className="font-bold text-on-surface-variant text-sm uppercase tracking-widest">Loading orders</p>
        </div>
    );

    const statuses = [
        { label: 'All Orders', value: '' },
        { label: 'Pending', value: 'pending' },
        { label: 'Processing', value: 'processing' },
        { label: 'Shipped', value: 'shipped' },
        { label: 'Delivered', value: 'delivered' }
    ];

    const getStatusStyles = (s) => {
        switch (s?.toLowerCase()) {
            case 'pending': return "bg-amber-100 text-amber-700";
            case 'processing': return "bg-blue-50 text-blue-600";
            case 'shipped': return "bg-indigo-50 text-indigo-600";
            case 'delivered': return "bg-emerald-50 text-emerald-600";
            case 'completed': return "bg-emerald-50 text-emerald-600";
            case 'cancelled': return "bg-error-container/20 text-error";
            default: return "bg-surface-variant text-on-surface-variant";
        }
    };

    return (
        <div className="font-manrope animate-in fade-in duration-700">
            {/* Page Header */}
            <div className="flex justify-between items-end mb-12">
                <div>
                    <h2 className="text-4xl font-extrabold text-on-surface tracking-tight mb-2">Order Management</h2>
                    <p className="text-on-surface-variant text-lg">Track and process your atelier's latest orders with precision.</p>
                </div>
                <button 
                    onClick={() => queryClient.invalidateQueries({ queryKey: ['adminOrders'] })}
                    className="bg-primary text-on-primary px-8 py-3 rounded-full flex items-center justify-center gap-2 font-semibold shadow-sm hover:opacity-90 active:scale-95 transition-all duration-400"
                >
                    <span className="material-symbols-outlined text-sm" data-icon="refresh">refresh</span>
                    Refresh List
                </button>
            </div>

            {/* Dashboard Stats Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-outline-variant/10">
                    <p className="text-xs uppercase tracking-widest text-on-surface-variant font-bold mb-4">Total Revenue</p>
                    <div className="flex justify-between items-end">
                        <h3 className="text-3xl font-bold text-on-surface">${Number(summary?.total_sales || 0).toLocaleString()}</h3>
                        <span className="text-emerald-600 text-xs font-bold bg-emerald-50 px-2 py-1 rounded-full"><span className="material-symbols-outlined text-[12px] align-middle">payments</span></span>
                    </div>
                </div>
                <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-outline-variant/10">
                    <p className="text-xs uppercase tracking-widest text-on-surface-variant font-bold mb-4">Pending Orders</p>
                    <div className="flex justify-between items-end">
                        <h3 className="text-3xl font-bold text-on-surface">{summary?.orders_by_status?.pending || 0}</h3>
                        <span className="text-amber-600 text-xs font-bold bg-amber-50 px-2 py-1 rounded-full">Needs Action</span>
                    </div>
                </div>
                <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-outline-variant/10">
                    <p className="text-xs uppercase tracking-widest text-on-surface-variant font-bold mb-4">Total Orders</p>
                    <div className="flex justify-between items-end">
                        <h3 className="text-3xl font-bold text-on-surface">{summary?.total_orders || 0}</h3>
                        <span className="text-primary text-xs font-bold bg-primary-container/30 px-2 py-1 rounded-full">All Time</span>
                    </div>
                </div>
                <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-outline-variant/10">
                    <p className="text-xs uppercase tracking-widest text-on-surface-variant font-bold mb-4">Returns & Cancels</p>
                    <div className="flex justify-between items-end">
                        <h3 className="text-3xl font-bold text-on-surface">{summary?.orders_by_status?.cancelled || 0}</h3>
                        <span className="text-error text-xs font-bold bg-error-container/20 px-2 py-1 rounded-full"><span className="material-symbols-outlined text-[12px] align-middle">block</span></span>
                    </div>
                </div>
            </div>

            {/* Filters & Tabs Container */}
            <div className="bg-surface-container-low p-2 rounded-[2rem] mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex p-1 bg-surface-container-lowest rounded-full shadow-sm w-full md:w-auto overflow-x-auto no-scrollbar">
                    {statuses.map(s => (
                        <button 
                            key={s.value}
                            onClick={() => { setStatus(s.value); setPage(1); }}
                            className={`px-6 py-2 rounded-full text-sm transition-all whitespace-nowrap ${status === s.value ? 'font-semibold bg-primary text-on-primary' : 'font-medium text-on-surface-variant hover:text-on-surface'}`}
                        >
                            {s.label}
                        </button>
                    ))}
                </div>
                
                <div className="flex items-center gap-4 px-4 w-full md:w-auto">
                    <div className="relative group w-full md:w-72">
                        <span className="absolute inset-y-0 left-4 flex items-center text-on-surface-variant/50 group-focus-within:text-primary transition-colors pointer-events-none">
                            <span className="material-symbols-outlined text-[18px]">search</span>
                        </span>
                        <input 
                            className="bg-surface-container-lowest w-full border border-outline-variant/10 rounded-full py-2.5 pl-11 pr-4 text-sm focus:ring-1 focus:ring-primary/20 focus:border-transparent transition-all font-manrope shadow-sm text-on-surface placeholder:text-on-surface-variant/50 outline-none" 
                            placeholder="Search orders..." 
                            type="text"
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        />
                    </div>
                </div>
            </div>

            {/* Orders Table Section */}
            <div className="bg-surface-container-lowest rounded-[2rem] shadow-[0_20px_40px_rgba(45,52,53,0.03)] overflow-hidden border border-outline-variant/10">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-surface-container-low/50 border-b border-surface-container-low">
                                <th className="px-8 py-6 text-[10px] uppercase tracking-[0.15em] font-extrabold text-on-surface-variant">Order ID</th>
                                <th className="px-8 py-6 text-[10px] uppercase tracking-[0.15em] font-extrabold text-on-surface-variant">Customer</th>
                                <th className="px-8 py-6 text-[10px] uppercase tracking-[0.15em] font-extrabold text-on-surface-variant">Date</th>
                                <th className="px-8 py-6 text-[10px] uppercase tracking-[0.15em] font-extrabold text-on-surface-variant">Payment</th>
                                <th className="px-8 py-6 text-[10px] uppercase tracking-[0.15em] font-extrabold text-on-surface-variant">Total</th>
                                <th className="px-8 py-6 text-[10px] uppercase tracking-[0.15em] font-extrabold text-on-surface-variant text-center">Status</th>
                                <th className="px-8 py-6 text-[10px] uppercase tracking-[0.15em] font-extrabold text-on-surface-variant text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant/10">
                            {orders && Object.values(orders).length > 0 ? Object.values(orders).map((order) => (
                                <tr key={order.id} className="hover:bg-surface-container-low/30 transition-colors group cursor-pointer" onClick={() => navigate(`/admin/orders/${order.id}`)}>
                                    <td className="px-8 py-5 font-bold text-on-surface text-sm">#{order.order_number}</td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container font-bold text-xs uppercase shadow-sm shrink-0">
                                                {order.user?.name?.substring(0,2).toUpperCase() || 'GS'}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-bold text-on-surface group-hover:text-primary transition-colors truncate">{order.user?.name || 'Guest User'}</p>
                                                <p className="text-xs text-on-surface-variant truncate">{order.shipping_address?.email || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-sm font-medium text-on-surface-variant">
                                        {new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-on-surface-variant text-[18px]" data-icon="credit_card">credit_card</span>
                                            <span className="text-sm font-medium text-on-surface-variant">{order.payment_method?.replace('_', ' ').toUpperCase() || 'N/A'}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-sm font-extrabold text-on-surface whitespace-nowrap">
                                        ${Number(order.total || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </td>
                                    <td className="px-8 py-5 text-center" onClick={(e) => e.stopPropagation()}>
                                        <select 
                                            className={`px-4 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest outline-none border-none cursor-pointer hover:opacity-80 transition-opacity appearance-none text-center focus:ring-1 focus:ring-primary/20 ${getStatusStyles(order.status)}`}
                                            value={order.status}
                                            onChange={(e) => updateStatusMutation.mutate({ id: order.id, status: e.target.value })}
                                            style={{ textAlignLast: 'center' }}
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="processing">Processing</option>
                                            <option value="shipped">Shipped</option>
                                            <option value="delivered">Delivered</option>
                                            <option value="completed">Completed</option>
                                            <option value="cancelled">Cancelled</option>
                                        </select>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); navigate(`/admin/orders/${order.id}`); }}
                                                className="p-2 hover:bg-surface-container rounded-lg text-on-surface-variant hover:text-primary transition-colors" 
                                                title="View Details"
                                            >
                                                <span className="material-symbols-outlined text-[20px]" data-icon="visibility">visibility</span>
                                            </button>
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); toast.success('Invoice will be downloaded shortly.'); }}
                                                className="p-2 hover:bg-surface-container rounded-lg text-on-surface-variant hover:text-primary transition-colors" 
                                                title="Print Invoice"
                                            >
                                                <span className="material-symbols-outlined text-[20px]" data-icon="print">print</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="7" className="py-24 text-center">
                                        <div className="flex flex-col items-center gap-4 text-on-surface-variant/50">
                                            <span className="material-symbols-outlined text-6xl" data-icon="shopping_basket">shopping_basket</span>
                                            <h3 className="text-xl font-bold text-on-surface mb-1">No orders found</h3>
                                            <p className="text-sm max-w-sm mx-auto">Try adjusting your filters or search query to find the specific order you're looking for.</p>
                                            <button 
                                                onClick={() => { setSearch(''); setStatus(''); setPage(1); }} 
                                                className="mt-4 text-primary font-bold flex items-center gap-2 hover:underline"
                                            >
                                                <span className="material-symbols-outlined text-sm" data-icon="refresh">refresh</span>
                                                Clear all filters
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {meta && meta.last_page > 1 && (
                    <div className="px-8 py-6 flex flex-col sm:flex-row items-center justify-between border-t border-outline-variant/10 bg-surface-container-low/20 gap-4">
                        <p className="text-sm text-on-surface-variant">Showing <span className="font-bold text-on-surface">{meta.from || 0}-{meta.to || 0}</span> of <span className="font-bold text-on-surface">{meta.total}</span> orders</p>
                        <div className="flex gap-2">
                            <button 
                                disabled={page === 1}
                                onClick={() => setPage(page - 1)}
                                className="w-10 h-10 flex items-center justify-center rounded-full border border-outline-variant/20 hover:bg-surface-container transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                            >
                                <span className="material-symbols-outlined text-sm" data-icon="chevron_left">chevron_left</span>
                            </button>
                            
                            <div className="hidden sm:flex items-center gap-1">
                                {[...Array(meta.last_page)].map((_, i) => {
                                    const p = i + 1;
                                    if (p === 1 || p === meta.last_page || (p >= page - 1 && p <= page + 1)) {
                                        return (
                                            <button 
                                                key={p}
                                                onClick={() => setPage(p)}
                                                className={`w-10 h-10 flex items-center justify-center rounded-full text-sm font-bold transition-colors ${page === p ? 'bg-primary text-on-primary border border-primary' : 'text-on-surface-variant hover:bg-surface-container border border-transparent'}`}
                                            >
                                                {p}
                                            </button>
                                        );
                                    }
                                    if (p === page - 2 || p === page + 2) {
                                        return <span key={p} className="text-xs text-on-surface-variant px-2">...</span>;
                                    }
                                    return null;
                                })}
                            </div>

                            <button 
                                disabled={page === meta.last_page}
                                onClick={() => setPage(page + 1)}
                                className="w-10 h-10 flex items-center justify-center rounded-full border border-outline-variant/20 hover:bg-surface-container transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                            >
                                <span className="material-symbols-outlined text-sm" data-icon="chevron_right">chevron_right</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminOrders;
