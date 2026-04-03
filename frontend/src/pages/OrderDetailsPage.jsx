import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
    Package, 
    Truck, 
    CheckCircle, 
    Clock, 
    AlertCircle, 
    ChevronLeft, 
    Download, 
    MapPin, 
    CreditCard, 
    ShieldCheck, 
    Calendar,
    ArrowRight,
    ShoppingBag,
    Printer,
    HelpCircle,
    Loader2,
    X
} from 'lucide-react';
import axiosInstance from '../services/axiosInstance';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

const OrderDetailsPage = () => {
    const { orderNumber } = useParams();
    const { token } = useAuthStore();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: orderResp, isLoading } = useQuery({
        queryKey: ['order', orderNumber],
        queryFn: async () => {
            const { data } = await axiosInstance.get(`/orders/${orderNumber}`);
            return data;
        },
        enabled: !!token && !!orderNumber
    });

    const order = orderResp?.data || orderResp;

    const cancelMutation = useMutation({
        mutationFn: () => axiosInstance.post(`/orders/${orderNumber}/cancel`),
        onSuccess: () => {
            queryClient.invalidateQueries(['order', orderNumber]);
            toast.success('Order cancellation confirmed.');
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Cancellation failed.')
    });

    const completeMutation = useMutation({
        mutationFn: () => axiosInstance.post(`/orders/${orderNumber}/complete`),
        onSuccess: () => {
            queryClient.invalidateQueries(['order', orderNumber]);
            toast.success('Order completion confirmed.');
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Update failed.')
    });

    if (!token) {
        navigate('/login');
        return null;
    }

    if (isLoading) return (
        <div className="pt-40 min-h-screen text-center">
            <div className="inline-block w-12 h-12 border-4 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-8 font-black text-slate-400 uppercase tracking-widest text-[10px]">Accessing Order Details...</p>
        </div>
    );

    if (!order) return (
        <div className="pt-40 text-center py-40">
            <h2 className="text-4xl font-black uppercase italic italic">Order Not Found</h2>
            <Link to="/orders" className="mt-8 inline-block px-10 py-4 bg-slate-950 text-white font-bold uppercase tracking-widest rounded-xl shadow-xl">Back to Orders</Link>
        </div>
    );

    const getStatusIcon = (status) => {
        switch (status?.toLowerCase()) {
            case 'completed': return <CheckCircle className="w-8 h-8 text-emerald-500" />;
            case 'delivered': return <Truck className="w-8 h-8 text-blue-500" />;
            case 'shipped': return <Truck className="w-8 h-8 text-indigo-500" />;
            case 'processing': return <Clock className="w-8 h-8 text-amber-500 animate-pulse" />;
            case 'cancelled': return <X className="w-8 h-8 text-rose-500" />;
            default: return <Clock className="w-8 h-8 text-slate-300" />;
        }
    };

    const getStatusStyles = (status) => {
        switch (status?.toLowerCase()) {
            case 'completed': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'delivered': return 'bg-blue-50 text-blue-600 border-blue-100';
            case 'shipped': return 'bg-indigo-50 text-indigo-600 border-indigo-100';
            case 'processing': return 'bg-amber-50 text-amber-600 border-amber-100';
            case 'cancelled': return 'bg-rose-50 text-rose-600 border-rose-100';
            default: return 'bg-slate-50 text-slate-400 border-slate-100';
        }
    };

    return (
        <div className="bg-white min-h-screen pt-32 pb-40 font-manrope selection:bg-slate-950 selection:text-white">
            <main className="max-w-7xl mx-auto px-6 lg:px-12">
                
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 border-b border-slate-50 pb-16">
                   <div className="space-y-4">
                      <Link to="/orders" className="inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-950 transition-colors mb-4 group italic">
                         <ChevronLeft className="w-4 h-4 group-hover:-translate-x-2 transition-transform" /> Purchase Registry
                      </Link>
                      <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-12">
                         <h1 className="text-6xl md:text-8xl font-black text-slate-950 tracking-tighter uppercase italic leading-[0.8]">
                            Order #{order.order_number}
                         </h1>
                         <div className={`inline-flex px-8 py-3 rounded-full border text-[10px] font-bold uppercase tracking-[0.3em] italic ${getStatusStyles(order.status)} shrink-0`}>
                            {order.status}
                         </div>
                      </div>
                   </div>
                   <div className="flex flex-wrap items-center gap-4">
                      <button className="px-8 py-5 bg-slate-50 border border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400 rounded-2xl flex items-center gap-3 hover:bg-slate-950 hover:text-white transition-all shadow-sm">
                         <Printer className="w-4 h-4" /> Download Statement
                      </button>
                      {order.status === 'delivered' && (
                        <button 
                            onClick={completeMutation.mutate}
                            disabled={completeMutation.isPending}
                            className="px-10 py-5 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl flex items-center gap-3 shadow-xl hover:bg-emerald-700 transition-all active:scale-95 italic"
                        >
                            {completeMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                            Confirm Delivery
                        </button>
                      )}
                      {['pending', 'processing'].includes(order.status?.toLowerCase()) && (
                        <button 
                            onClick={cancelMutation.mutate}
                            disabled={cancelMutation.isPending}
                            className="px-10 py-5 bg-rose-50 text-rose-500 border border-rose-100 text-[10px] font-black uppercase tracking-widest rounded-2xl flex items-center gap-3 shadow-xl hover:bg-rose-500 hover:text-white transition-all active:scale-95 italic"
                        >
                            {cancelMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <AlertCircle className="w-4 h-4" />}
                            Cancel Order
                        </button>
                      )}
                   </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 py-16">
                    
                    {/* Items List (Left Column) */}
                    <div className="lg:col-span-8 space-y-12">
                        <div className="bg-slate-50/50 rounded-[3rem] p-10 lg:p-16 border border-slate-100 shadow-inner space-y-12">
                            <div className="flex justify-between items-end mb-12 border-b border-slate-100 pb-8">
                                <h3 className="text-3xl font-black tracking-tighter uppercase italic text-slate-950">Package Content</h3>
                                <div className="text-right">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic block mb-1">Total count</span>
                                    <p className="text-xl font-black text-slate-950 italic tracking-tighter">{parseInt(order.items_count || order.items?.length || 1)} Unit{parseInt(order.items_count || order.items?.length || 1) !== 1 ? 's' : ''}</p>
                                </div>
                            </div>
                            
                            <div className="space-y-8">
                                {order.items?.map((item) => (
                                    <div key={item.id} className="flex gap-8 group">
                                        <div className="w-24 h-32 bg-white rounded-2xl overflow-hidden shadow-xl border border-slate-100 shrink-0 group-hover:scale-105 transition-transform duration-500">
                                            <img 
                                                src={item.product?.image_url} 
                                                className="w-full h-full object-cover" 
                                                alt={item.product?.name} 
                                            />
                                        </div>
                                        <div className="flex-1 flex flex-col justify-between py-2 overflow-hidden">
                                            <div className="flex justify-between items-start gap-6">
                                                <div>
                                                    <h4 className="text-xl font-black text-slate-950 uppercase italic tracking-tighter truncate max-w-[300px] leading-none mb-2">
                                                        {item.product?.name}
                                                    </h4>
                                                    <div className="flex items-center gap-4 text-[9px] font-bold text-slate-400 tracking-widest uppercase">
                                                        <span>{item.variant?.value || 'Standard Edition'}</span>
                                                        <span className="w-1.5 h-1.5 bg-slate-100 rounded-full" />
                                                        <span>Qty: {item.quantity} Units</span>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-lg font-black text-slate-950 italic tracking-tighter tabular-nums">${item.price}</span>
                                                    <p className="text-[8px] font-bold text-slate-300 uppercase tracking-widest mt-1 italic">Unit Price</p>
                                                </div>
                                            </div>
                                            <div className="flex justify-end items-end border-t border-slate-50 pt-4">
                                                <span className="text-xl font-black text-slate-950 italic tracking-tighter tabular-nums underline decoration-amber-400 decoration-4 underline-offset-4">${item.total}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Payment & Logistics Summaries */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-white p-12 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
                                <div className="flex items-center gap-4 text-slate-400 mb-8">
                                    <MapPin className="w-6 h-6" />
                                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-950 italic">Delivery logistics</h4>
                                </div>
                                <div className="space-y-4">
                                    <p className="text-sm font-bold text-slate-900 leading-relaxed uppercase tracking-tighter italic">{order.full_name}</p>
                                    <p className="text-xs font-medium text-slate-400 leading-relaxed uppercase tracking-widest italic">{order.address}</p>
                                    <div className="pt-4 space-y-1">
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest italic">{order.city}, {order.state} {order.zip_code}</p>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest italic">Contact: {order.phone}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white p-12 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-10">
                                <div className="flex items-center gap-4 text-slate-400">
                                    <CreditCard className="w-6 h-6" />
                                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-950 italic">Acquisition protocol</h4>
                                </div>
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b border-slate-50 pb-4">
                                        <span>Payment Instrument</span>
                                        <span className="text-slate-950 italic">{order.payment_method?.toUpperCase()}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b border-slate-50 pb-4">
                                        <span>Transactional Status</span>
                                        <span className={`italic ${order.payment_status === 'paid' ? 'text-emerald-500' : 'text-amber-500'}`}>{order.payment_status?.toUpperCase()}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                        <span>Timestamp Registry</span>
                                        <span className="text-slate-950 italic">{new Date(order.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Order Sidebar (Right Column) */}
                    <aside className="lg:col-span-4 space-y-12">
                        
                        {/* Status Tracker */}
                        <div className="bg-slate-950 rounded-[2.5rem] p-12 text-white shadow-3xl space-y-12 relative overflow-hidden group">
                           <h3 className="text-3xl font-black tracking-tighter uppercase italic leading-none relative z-10">Live Registry</h3>
                           
                           <div className="space-y-12 relative z-10">
                               {/* Single tracker point - simplified */}
                               <div className="flex items-center gap-8 relative">
                                   <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center shrink-0 border border-white/20 group-hover:scale-110 transition-transform">
                                       {getStatusIcon(order.status)}
                                   </div>
                                   <div className="space-y-1">
                                       <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-amber-400 italic">Current Protocol Stage</span>
                                       <h4 className="text-xl font-black uppercase italic tracking-tighter leading-none">{order.status}</h4>
                                   </div>
                               </div>
                               
                               <div className="pt-8 border-t border-white/10 space-y-6">
                                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">
                                      <span>Dispatch Tracking</span>
                                      <span className="text-white italic">{order.tracking_number || 'Pending Assignment'}</span>
                                  </div>
                                  <p className="text-[10px] text-slate-500 font-medium italic leading-relaxed uppercase tracking-widest">Global logistics updates are transmitted via encrypted notification once the unit is in transit.</p>
                               </div>
                           </div>
                           
                           {/* Background Details */}
                           <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl" />
                        </div>

                        {/* Summary Block */}
                        <div className="bg-slate-50 p-12 rounded-[2.5rem] border border-slate-100 space-y-8">
                            <h3 className="text-2xl font-black tracking-tighter uppercase italic text-slate-950 underline decoration-amber-400 decoration-4 underline-offset-4">Registry Summary</h3>
                            
                            <div className="space-y-4">
                                <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-slate-400 italic">
                                    <span>Base Value</span>
                                    <span className="text-slate-950 tabular-nums">${parseFloat(order.subtotal || 0).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-slate-400 italic">
                                    <span>Logistics Fee</span>
                                    <span className="text-slate-950 tabular-nums">${parseFloat(order.shipping || 0).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-slate-400 italic">
                                    <span>Registry Tax</span>
                                    <span className="text-slate-950 tabular-nums">${parseFloat(order.tax || 0).toFixed(2)}</span>
                                </div>
                                {parseFloat(order.discount || 0) > 0 && (
                                    <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-rose-500 italic pt-2">
                                        <span>Discount Applied</span>
                                        <span className="tabular-nums">-${parseFloat(order.discount || 0).toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between pt-8 border-t border-slate-200 items-baseline">
                                    <span className="text-2xl font-black uppercase italic tracking-tighter text-slate-950">Grand Total</span>
                                    <span className="text-5xl font-black italic tracking-tighter text-slate-950 tabular-nums leading-none ml-4">${parseFloat(order.total || 0).toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Support Center */}
                        <div className="p-10 bg-indigo-50 rounded-[2.5rem] border border-indigo-100 flex items-start gap-8 group cursor-pointer hover:bg-slate-950 transition-all duration-500">
                            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shrink-0 shadow-lg group-hover:rotate-12 transition-transform">
                                <HelpCircle className="w-7 h-7 text-indigo-500" />
                            </div>
                            <div className="space-y-1">
                                <h4 className="text-sm font-black uppercase italic tracking-tighter text-slate-950 group-hover:text-white transition-colors">Disquisition Center</h4>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic group-hover:text-slate-500 transition-colors">Need logistical or product assistance regarding this order?</p>
                            </div>
                        </div>

                    </aside>
                </div>

            </main>
        </div>
    );
};

export default OrderDetailsPage;
