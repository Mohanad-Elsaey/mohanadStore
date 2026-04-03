import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { getAdminOrder, addOrderTracking, updateAdminOrderStatus } from '../services/adminService';

const AdminOrderDetail = () => {
    const { id } = useParams();
    const queryClient = useQueryClient();
    const [isEditingTracking, setIsEditingTracking] = useState(false);
    const [trackingNumber, setTrackingNumber] = useState('');

    const { data: orderResp, isLoading, isError } = useQuery({
        queryKey: ['adminOrder', id],
        queryFn: () => getAdminOrder(id),
    });

    const order = orderResp?.data || orderResp;

    const statusMutation = useMutation({
        mutationFn: (newStatus) => updateAdminOrderStatus({ id, status: newStatus }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminOrder', id] });
            toast.success('Order status updated successfully.');
        },
        onError: () => toast.error('Failed to update status.')
    });

    const trackingMutation = useMutation({
        mutationFn: (num) => addOrderTracking(id, num),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminOrder', id] });
            setIsEditingTracking(false);
            toast.success('Tracking number updated.');
        },
        onError: () => toast.error('Failed to update tracking.')
    });

    if (isLoading) return (
        <div className="flex flex-col items-center justify-center py-40 gap-8 min-h-[60vh] font-manrope">
            <span className="material-symbols-outlined animate-spin text-4xl text-primary" style={{ animationDirection: 'reverse' }}>progress_activity</span>
            <p className="font-bold text-on-surface-variant text-sm uppercase tracking-widest">Loading order intel...</p>
        </div>
    );

    if (isError || !order) return (
        <div className="text-center py-40 bg-surface-container-lowest rounded-3xl border border-outline-variant/10 shadow-sm mx-10 font-manrope">
            <span className="material-symbols-outlined text-6xl text-error mb-4">error</span>
            <h3 className="text-2xl font-bold text-on-surface">Order Not Found</h3>
            <Link to="/admin/orders" className="mt-8 inline-block px-8 py-3 bg-primary text-on-primary font-bold text-sm rounded-full shadow-lg hover:opacity-90 transition-opacity">Return to Orders</Link>
        </div>
    );

    const getStatusStyles = (s) => {
        switch (s?.toLowerCase()) {
            case 'pending': return "bg-orange-50 text-orange-700 border-orange-200";
            case 'processing': return "bg-blue-50 text-blue-700 border-blue-200";
            case 'shipped': return "bg-secondary-container text-on-secondary-container border-secondary-container";
            case 'delivered': return "bg-emerald-50 text-emerald-700 border-emerald-200";
            case 'completed': return "bg-emerald-100 text-emerald-800 border-emerald-300";
            case 'cancelled': return "bg-error/10 text-error border-error/20";
            default: return "bg-surface-container-high text-on-surface-variant border-surface-container-highest";
        }
    };

    return (
        <div className="font-manrope animate-in fade-in duration-700 pb-12">
            
            {/* Breadcrumbs */}
            <nav className="flex flex-wrap items-center gap-2 mb-8 text-[11px] font-bold uppercase tracking-[0.15em] text-on-surface-variant">
                <Link to="/admin/orders" className="hover:text-primary transition-colors flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">arrow_back</span>
                    Order Management
                </Link>
                <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                <span className="text-on-surface">#{order.order_number}</span>
            </nav>

            {/* Header Section */}
            <section className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <div>
                    <div className="flex flex-wrap items-center gap-4 mb-2">
                        <h2 className="text-4xl font-extrabold tracking-tighter text-on-surface">#{order.order_number}</h2>
                        
                        <div className="relative group inline-block">
                            <select 
                                value={order.status} 
                                onChange={(e) => statusMutation.mutate(e.target.value)}
                                className={`px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest rounded-full appearance-none pr-8 cursor-pointer outline-none transition-all ${getStatusStyles(order.status)}`}
                                disabled={statusMutation.isPending}
                            >
                                <option value="pending">Pending</option>
                                <option value="processing">Processing</option>
                                <option value="shipped">Shipped</option>
                                <option value="delivered">Delivered</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                            <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-[14px] pointer-events-none opacity-50">expand_more</span>
                        </div>
                    </div>
                    <p className="text-on-surface-variant font-medium flex items-center gap-2">
                        <span className="material-symbols-outlined text-base">calendar_today</span>
                        {new Date(order.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <a 
                        href={`${(import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:8000')}/admin/orders/${order.id}/invoice`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-6 py-3 border border-outline-variant/30 text-on-surface-variant rounded-full text-xs font-bold uppercase tracking-widest hover:bg-surface-container-low hover:text-on-surface transition-all flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-sm">print</span> Print Invoice
                    </a>
                </div>
            </section>

            {/* Grid of Info Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
                {/* Customer Info */}
                <div className="p-8 bg-surface-container-lowest rounded-xl shadow-[0_4px_20px_rgba(45,52,53,0.03)] border border-outline-variant/5 hover:border-outline-variant/20 transition-all duration-300">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-14 h-14 rounded-full bg-surface-container-high flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-on-surface-variant text-2xl">person</span>
                        </div>
                        <div className="min-w-0">
                            <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-on-surface-variant mb-1">Customer</h4>
                            <p className="font-bold text-on-surface truncate">{order.shipping_address?.full_name || order.user?.name || 'Guest'}</p>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 text-sm">
                            <span className="material-symbols-outlined text-on-surface-variant text-base">mail</span>
                            <span className="text-on-surface-variant truncate">{order.user?.email || 'No email provided'}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                            <span className="material-symbols-outlined text-on-surface-variant text-base">call</span>
                            <span className="text-on-surface-variant">{order.shipping_address?.phone || 'No phone provided'}</span>
                        </div>
                    </div>
                </div>

                {/* Shipping Details */}
                <div className="p-8 bg-surface-container-lowest rounded-xl shadow-[0_4px_20px_rgba(45,52,53,0.03)] border border-outline-variant/5 hover:border-outline-variant/20 transition-all duration-300">
                    <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-on-surface-variant mb-6">Shipping Details</h4>
                    <div className="flex gap-4 mb-6">
                        <span className="material-symbols-outlined text-primary mt-1 text-base">location_on</span>
                        <div className="text-sm text-on-surface-variant leading-relaxed">
                            <p className="font-bold text-on-surface mb-1">{order.shipping_address?.full_name}</p>
                            <p>{order.shipping_address?.address_line1}</p>
                            {order.shipping_address?.address_line2 && <p>{order.shipping_address?.address_line2}</p>}
                            <p>{order.shipping_address?.city}, {order.shipping_address?.state}</p>
                            <p>{order.shipping_address?.country} {order.shipping_address?.zip}</p>
                        </div>
                    </div>
                </div>

                {/* Payment Info */}
                <div className="p-8 bg-surface-container-lowest rounded-xl shadow-[0_4px_20px_rgba(45,52,53,0.03)] border border-outline-variant/5 hover:border-outline-variant/20 transition-all duration-300">
                    <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-on-surface-variant mb-6">Financial Info</h4>
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-8 bg-surface-container-low border border-outline-variant/20 rounded flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-on-surface-variant text-lg">credit_card</span>
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-bold text-on-surface uppercase truncate">{String(order.payment_method || 'Unknown').replace('_', ' ')}</p>
                            <p className="text-[11px] text-on-surface-variant truncate">Paid via Gateway</p>
                        </div>
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-on-surface-variant">Status</span>
                            {order.payment_status === 'paid' ? (
                                <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">check_circle</span> Paid</span>
                            ) : (
                                <span className="text-xs font-bold text-error uppercase tracking-widest flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">schedule</span> {order.payment_status}</span>
                            )}
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-on-surface-variant">Transaction Date</span>
                            <span className="text-xs font-bold text-on-surface">{new Date(order.created_at).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex flex-col xl:flex-row gap-8">
                
                {/* Left Column: Items & Notes */}
                <div className="flex-grow space-y-8">
                    
                    {/* Order Items Table */}
                    <div className="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-sm border border-outline-variant/5">
                        <div className="px-8 py-6 border-b border-surface-container-low flex items-center gap-3">
                            <span className="material-symbols-outlined text-primary">local_mall</span>
                            <h3 className="text-lg font-bold tracking-tight text-on-surface">Order Items</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-surface-container-low/30 border-b border-surface-container-low">
                                        <th className="px-8 py-4 text-[10px] font-extrabold uppercase tracking-widest text-on-surface-variant">Product</th>
                                        <th className="px-6 py-4 text-[10px] font-extrabold uppercase tracking-widest text-on-surface-variant">SKU</th>
                                        <th className="px-6 py-4 text-[10px] font-extrabold uppercase tracking-widest text-on-surface-variant">Details</th>
                                        <th className="px-6 py-4 text-[10px] font-extrabold uppercase tracking-widest text-on-surface-variant text-center">Qty</th>
                                        <th className="px-6 py-4 text-[10px] font-extrabold uppercase tracking-widest text-on-surface-variant text-right">Unit Price</th>
                                        <th className="px-8 py-4 text-[10px] font-extrabold uppercase tracking-widest text-on-surface-variant text-right">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-surface-container-low">
                                    {order.items?.map((item) => (
                                        <tr key={item.id} className="hover:bg-surface-container-low/20 transition-colors">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-16 h-20 rounded-lg overflow-hidden bg-surface-container-high border border-outline-variant/10 shrink-0">
                                                        <img 
                                                            src={item.product?.image_url} 
                                                            className="w-full h-full object-cover mix-blend-multiply opacity-90 hover:scale-110 transition-transform duration-500" 
                                                            alt={item.name} 
                                                            onError={(e) => { e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" fill="%23f2f4f4"%3E%3Crect width="100%" height="100%"/%3E%3C/svg%3E' }}
                                                        />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-on-surface text-sm line-clamp-2">{item.name}</p>
                                                        <p className="text-[10px] text-on-surface-variant uppercase tracking-wider mt-1">{item.product?.category?.name || 'Uncategorized'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6 text-sm text-on-surface-variant font-mono">{item.product?.sku || 'N/A'}</td>
                                            <td className="px-6 py-6">
                                                <div className="text-xs text-on-surface-variant space-y-1">
                                                    {item.variant?.size && <p><span className="font-semibold text-on-surface">Size:</span> {item.variant.size}</p>}
                                                    {item.variant?.color && <p><span className="font-semibold text-on-surface">Color:</span> {item.variant.color}</p>}
                                                    {!item.variant?.size && !item.variant?.color && <p className="italic">N/A</p>}
                                                </div>
                                            </td>
                                            <td className="px-6 py-6 text-sm text-center font-bold text-on-surface">{item.quantity}</td>
                                            <td className="px-6 py-6 text-sm text-right text-on-surface-variant">${parseFloat(item.price || 0).toFixed(2)}</td>
                                            <td className="px-8 py-6 text-sm text-right font-bold text-on-surface">${parseFloat(item.total || 0).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Order Notes */}
                    {order.notes && (
                        <div className="p-8 bg-secondary-container/30 border border-secondary/10 rounded-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <span className="material-symbols-outlined text-6xl">format_quote</span>
                            </div>
                            <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-on-secondary-container mb-4">Customer Order Notes</h4>
                            <p className="text-on-surface italic leading-relaxed text-sm">
                                "{order.notes}"
                            </p>
                        </div>
                    )}
                </div>

                {/* Right Column: Financials & Timeline */}
                <div className="w-full xl:w-96 shrink-0 space-y-8">
                    
                    {/* Financial Summary */}
                    <div className="p-8 bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/5 transition-all hover:border-outline-variant/20">
                        <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-on-surface-variant mb-6 border-b border-surface-container-low pb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">receipt_long</span> Financial Summary
                        </h4>
                        <div className="space-y-4 mb-8">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-on-surface-variant">Subtotal</span>
                                <span className="font-semibold text-on-surface">${parseFloat(order.subtotal || 0).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-on-surface-variant">Shipping Fee</span>
                                <span className="font-semibold text-on-surface">${parseFloat(order.shipping_cost || 0).toFixed(2)}</span>
                            </div>
                            {parseFloat(order.discount || 0) > 0 && (
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-emerald-600 font-bold">Applied Discount</span>
                                    <span className="font-black text-emerald-600">-${parseFloat(order.discount || 0).toFixed(2)}</span>
                                </div>
                            )}
                        </div>
                        <div className="pt-6 border-t border-dashed border-outline-variant/30 flex justify-between items-end">
                            <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Grand Total</span>
                            <span className="text-3xl font-extrabold text-on-surface tracking-tighter">${parseFloat(order.total || 0).toFixed(2)}</span>
                        </div>
                    </div>

                    {/* Tracking Updater */}
                    <div className="p-8 bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/5 transition-all hover:border-outline-variant/20">
                         <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-on-surface-variant mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">local_shipping</span> Tracking Information
                        </h4>
                        {!isEditingTracking ? (
                            <div 
                                className="flex items-center justify-between bg-surface-container-low/50 p-4 rounded-xl border border-outline-variant/10 hover:bg-surface-container-high transition-colors cursor-pointer group"
                                onClick={() => { setTrackingNumber(order.tracking_number || ''); setIsEditingTracking(true); }}
                            >
                                <p className="text-base font-bold text-on-surface truncate pr-4">
                                    {order.tracking_number || <span className="text-on-surface-variant italic font-medium text-sm">Add tracking #</span>}
                                </p>
                                <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors text-lg">edit</span>
                            </div>
                        ) : (
                            <div className="flex gap-2">
                                <input 
                                    autoFocus
                                    className="bg-surface-container-low border border-outline-variant/20 rounded-xl px-4 py-2 text-sm text-on-surface outline-none w-full focus:ring-1 focus:ring-primary/50 font-mono"
                                    value={trackingNumber}
                                    onChange={(e) => setTrackingNumber(e.target.value)}
                                    placeholder="Enter Tracking ID..."
                                />
                                <button 
                                    onClick={() => trackingMutation.mutate(trackingNumber)}
                                    disabled={trackingMutation.isPending}
                                    className="px-4 bg-primary text-on-primary rounded-xl hover:opacity-90 active:scale-95 transition-all shadow-sm flex items-center justify-center shrink-0 disabled:opacity-50"
                                >
                                    <span className="material-symbols-outlined text-sm">check</span>
                                </button>
                                <button 
                                    onClick={() => setIsEditingTracking(false)}
                                    className="px-3 border border-outline-variant/30 text-on-surface-variant rounded-xl hover:bg-surface-container-low transition-all items-center justify-center shrink-0"
                                >
                                    <span className="material-symbols-outlined text-sm">close</span>
                                </button>
                            </div>
                        )}
                        {order.tracking_number && (
                            <a 
                                href={`https://www.google.com/search?q=${order.tracking_number}`} 
                                target="_blank" 
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 mt-4 text-[10px] font-bold uppercase tracking-widest text-primary hover:text-primary-dim transition-colors"
                            >
                                Track Package <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                            </a>
                        )}
                    </div>

                    {/* Simplified Order Status Log */}
                    <div className="p-8 bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/5 transition-all hover:border-outline-variant/20">
                        <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-on-surface-variant mb-8 flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">history</span> Fulfillment Status
                        </h4>
                        <div className="space-y-6 relative">
                            {/* Line connecting notes */}
                            {order.status !== 'pending' && <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-surface-container-high"></div>}
                            
                            {/* Current Status */}
                            <div className="relative flex gap-5">
                                <div className="z-10 w-6 h-6 rounded-full bg-primary flex items-center justify-center ring-4 ring-surface-container-lowest shrink-0">
                                    <span className="material-symbols-outlined text-on-primary text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>noise_aware</span>
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-on-surface capitalize">{order.status}</p>
                                    <p className="text-[11px] text-on-surface-variant mt-0.5">Current Status</p>
                                </div>
                            </div>

                            {/* Placed Status */}
                            <div className="relative flex gap-5">
                                <div className="z-10 w-6 h-6 rounded-full bg-surface-container-high flex items-center justify-center ring-4 ring-surface-container-lowest shrink-0">
                                    <span className="material-symbols-outlined text-on-surface-variant text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>shopping_cart</span>
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-on-surface">Order Placed</p>
                                    <p className="text-[11px] text-on-surface-variant mt-0.5">{new Date(order.created_at).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminOrderDetail;
