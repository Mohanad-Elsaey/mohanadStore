import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { getAdminCoupons, toggleCouponStatus } from '../services/adminService';
import axiosInstance from '../services/axiosInstance';

const AdminCoupons = () => {
    const queryClient = useQueryClient();
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('Status: All');
    const [typeFilter, setTypeFilter] = useState('Type: All');

    const [showForm, setShowForm] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    const emptyForm = {
        code: '', 
        type: 'percentage',
        value: '',
        min_order: 0,
        max_discount: '',
        usage_limit: '',
        per_user_limit: 1,
        expires_at: '', 
        is_active: true
    };
    const [formData, setFormData] = useState(emptyForm);
    const set = (key, val) => setFormData(p => ({ ...p, [key]: val }));

    const { data: couponsResp, isLoading } = useQuery({
        queryKey: ['adminCoupons'],
        queryFn: getAdminCoupons,
    });
    
    // Support paginated or unpaginated response locally
    let coupons = [];
    if (Array.isArray(couponsResp)) {
        coupons = couponsResp;
    } else if (couponsResp?.data) {
        coupons = couponsResp.data;
    }

    // Advanced local filtering map
    const filteredCoupons = useMemo(() => {
        return coupons.filter(c => {
            const matchesSearch = c.code.toLowerCase().includes(search.toLowerCase());
            
            let matchesStatus = true;
            const isExpired = c.expires_at && new Date(c.expires_at) < new Date();
            if (statusFilter === 'Active') matchesStatus = c.is_active && !isExpired;
            if (statusFilter === 'Expired') matchesStatus = isExpired;
            if (statusFilter === 'Inactive' || statusFilter === 'Scheduled') matchesStatus = !c.is_active;

            let matchesType = true;
            if (typeFilter === 'Percentage') matchesType = c.type === 'percentage';
            if (typeFilter === 'Fixed Amount') matchesType = c.type === 'fixed';

            return matchesSearch && matchesStatus && matchesType;
        });
    }, [coupons, search, statusFilter, typeFilter]);

    // Derived Statistics
    const stats = useMemo(() => {
        const activeCount = coupons.filter(c => c.is_active && (!c.expires_at || new Date(c.expires_at) > new Date())).length;
        const totalRedemptions = coupons.reduce((acc, c) => acc + (Number(c.uses_count) || 0), 0);
        const percentCoupons = coupons.filter(c => c.type === 'percentage');
        const avgDiscountRaw = percentCoupons.length > 0 
            ? percentCoupons.reduce((acc, c) => acc + Number(c.value), 0) / percentCoupons.length 
            : 0;
        const avgDiscount = Math.round(avgDiscountRaw);
        
        return { activeCount, totalRedemptions, avgDiscount };
    }, [coupons]);

    const handleEdit = (coupon) => {
        setEditingCoupon(coupon);
        setFormData({
            code: coupon.code,
            type: coupon.type,
            value: coupon.value,
            min_order: coupon.min_order || 0,
            max_discount: coupon.max_discount || '',
            usage_limit: coupon.usage_limit || '',
            per_user_limit: coupon.per_user_limit || 1,
            expires_at: coupon.expires_at ? new Date(coupon.expires_at).toISOString().split('T')[0] : '',
            is_active: coupon.is_active
        });
        setShowForm(true);
    };

    const handleDuplicate = (coupon) => {
        setEditingCoupon(null);
        setFormData({
            code: `${coupon.code}_COPY`,
            type: coupon.type,
            value: coupon.value,
            min_order: coupon.min_order || 0,
            max_discount: coupon.max_discount || '',
            usage_limit: coupon.usage_limit || '',
            per_user_limit: coupon.per_user_limit || 1,
            expires_at: '',
            is_active: false
        });
        setShowForm(true);
        toast('Ready to duplicate. Adjust code to save.', { icon: '📝' });
    };

    const resetForm = () => {
        setFormData(emptyForm);
        setEditingCoupon(null);
        setShowForm(false);
    };

    const saveMutation = useMutation({
        mutationFn: (data) => {
            const payload = {
                ...data,
                min_order: data.min_order === '' ? 0 : data.min_order,
                max_discount: data.max_discount === '' ? null : data.max_discount,
                usage_limit: data.usage_limit === '' ? null : data.usage_limit,
                per_user_limit: data.per_user_limit === '' ? 1 : data.per_user_limit,
                expires_at: data.expires_at || null
            };
            return editingCoupon
                ? axiosInstance.put(`/admin/coupons/${editingCoupon.id}`, payload)
                : axiosInstance.post('/admin/coupons', payload);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminCoupons'] });
            toast.success(editingCoupon ? 'Campaign updated successfully.' : 'Campaign launched successfully.');
            resetForm();
        },
        onError: (err) => {
            const msg = err.response?.data?.message || 'Operation failed';
            toast.error(msg);
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => axiosInstance.delete(`/admin/coupons/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminCoupons'] });
            toast.success('Campaign permanently deleted.');
            setDeleteConfirm(null);
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Delete failed')
    });

    const toggleStatusMutation = useMutation({
        mutationFn: (id) => toggleCouponStatus(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminCoupons'] });
            toast.success('Campaign status toggled.');
        },
        onError: () => toast.error('Failed to change status')
    });

    if (isLoading) return (
        <div className="flex flex-col items-center justify-center py-40 space-y-6 font-manrope">
            <span className="material-symbols-outlined animate-spin text-4xl text-primary" style={{ animationDirection: 'reverse' }}>progress_activity</span>
            <p className="font-bold text-on-surface-variant text-sm uppercase tracking-widest">Loading Campaigns</p>
        </div>
    );

    const StatusBadge = ({ coupon }) => {
        const isExpired = coupon.expires_at && new Date(coupon.expires_at) < new Date();
        if (isExpired) {
            return (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-error/10 text-error text-[10px] font-black rounded-full uppercase">
                    <span className="w-1.5 h-1.5 bg-error rounded-full"></span> Expired
                </span>
            );
        }
        if (!coupon.is_active) {
            return (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-surface-container-high text-on-surface-variant text-[10px] font-black rounded-full uppercase">
                    <span className="w-1.5 h-1.5 bg-on-surface-variant rounded-full"></span> Inactive
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-black rounded-full uppercase">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> Active
            </span>
        );
    };

    return (
        <div className="font-manrope animate-in fade-in duration-700 space-y-12 pb-16">
            
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <span className="text-[10px] font-bold tracking-[0.2em] text-secondary uppercase">Promotions & Marketing</span>
                    <h2 className="text-4xl font-extrabold tracking-tighter text-on-surface">Coupon Campaigns</h2>
                    <p className="text-on-surface-variant max-w-lg font-medium">Manage and track the performance of your promotional offers with our integrated analytics dashboard.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-6 py-3 border border-outline-variant/30 rounded-full text-sm font-semibold text-on-surface hover:bg-surface-container-low transition-all duration-300">
                        <span className="material-symbols-outlined text-lg" data-icon="share">share</span>
                        <span>Export Data</span>
                    </button>
                    <button 
                        onClick={() => { resetForm(); setShowForm(true); }}
                        className="flex items-center gap-2 px-8 py-3 bg-primary text-on-primary rounded-full text-sm font-bold shadow-lg shadow-primary/10 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all duration-400"
                    >
                        <span className="material-symbols-outlined text-lg" data-icon="add">add</span>
                        <span>Create New Coupon</span>
                    </button>
                </div>
            </div>

            {/* Statistics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/5 hover:border-outline-variant/20 hover:shadow-lg transition-all group">
                    <div className="flex items-start justify-between mb-4">
                        <div className="p-3 bg-secondary-container/30 rounded-xl text-secondary group-hover:bg-secondary-container transition-colors">
                            <span className="material-symbols-outlined" data-icon="confirmation_number">confirmation_number</span>
                        </div>
                    </div>
                    <p className="text-3xl font-extrabold tracking-tighter">{stats.activeCount}</p>
                    <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mt-1">Active Campaigns</p>
                </div>

                <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/5 hover:border-outline-variant/20 hover:shadow-lg transition-all group">
                    <div className="flex items-start justify-between mb-4">
                        <div className="p-3 bg-primary-container/30 rounded-xl text-primary group-hover:bg-primary-container transition-colors">
                            <span className="material-symbols-outlined" data-icon="redeem">redeem</span>
                        </div>
                    </div>
                    <p className="text-3xl font-extrabold tracking-tighter">{stats.totalRedemptions >= 1000 ? (stats.totalRedemptions/1000).toFixed(1) + 'k' : stats.totalRedemptions}</p>
                    <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mt-1">Total Redemptions</p>
                </div>

                <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/5 hover:border-outline-variant/20 hover:shadow-lg transition-all group">
                    <div className="flex items-start justify-between mb-4">
                        <div className="p-3 bg-tertiary-container/30 rounded-xl text-tertiary group-hover:bg-tertiary-container transition-colors">
                            <span className="material-symbols-outlined" data-icon="percent">percent</span>
                        </div>
                    </div>
                    <p className="text-3xl font-extrabold tracking-tighter">{stats.avgDiscount}%</p>
                    <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mt-1">Average Discount</p>
                </div>

                <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/5 hover:border-outline-variant/20 hover:shadow-lg transition-all group">
                    <div className="flex items-start justify-between mb-4">
                        <div className="p-3 bg-outline-variant/10 rounded-xl text-on-surface-variant group-hover:bg-outline-variant/20 transition-colors">
                            <span className="material-symbols-outlined" data-icon="inventory">inventory</span>
                        </div>
                    </div>
                    <p className="text-3xl font-extrabold tracking-tighter">{coupons.length}</p>
                    <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mt-1">Lifetime Codes</p>
                </div>
            </div>

            {/* Management Section */}
            <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/5 shadow-xl shadow-surface-container/20 overflow-hidden">
                {/* Table Controls */}
                <div className="p-8 border-b border-surface-container-low flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="relative flex-1 max-w-md">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
                        <input 
                            className="w-full pl-12 pr-4 py-3 bg-surface-container-low border-none rounded-2xl text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none font-medium text-on-surface" 
                            placeholder="Search by coupon code..." 
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-4">
                        <select 
                            className="bg-surface-container-low border-none rounded-full text-xs font-bold px-6 py-3 focus:ring-2 focus:ring-primary/20 cursor-pointer text-on-surface outline-none"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="Status: All">Status: All</option>
                            <option value="Active">Active</option>
                            <option value="Expired">Expired</option>
                            <option value="Inactive">Inactive</option>
                        </select>
                        <select 
                            className="bg-surface-container-low border-none rounded-full text-xs font-bold px-6 py-3 focus:ring-2 focus:ring-primary/20 cursor-pointer text-on-surface outline-none"
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                        >
                            <option value="Type: All">Type: All</option>
                            <option value="Percentage">Percentage</option>
                            <option value="Fixed Amount">Fixed Amount</option>
                        </select>
                        <button 
                            onClick={() => { setSearch(''); setStatusFilter('Status: All'); setTypeFilter('Type: All'); }}
                            className="p-3 bg-surface-container-low rounded-full hover:bg-surface-container-high transition-colors"
                            title="Clear Filters"
                        >
                            <span className="material-symbols-outlined text-on-surface-variant" data-icon="refresh">refresh</span>
                        </button>
                    </div>
                </div>

                {/* Responsive Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-surface-container-low/30">
                                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-[0.15em] text-on-surface-variant">Coupon Code</th>
                                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-[0.15em] text-on-surface-variant">Type & Value</th>
                                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-[0.15em] text-on-surface-variant">Usage</th>
                                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-[0.15em] text-on-surface-variant">Status</th>
                                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-[0.15em] text-on-surface-variant">Expiry Date</th>
                                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-[0.15em] text-on-surface-variant text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-surface-container-low">
                            {filteredCoupons.length > 0 ? filteredCoupons.map((coupon) => {
                                const usagePercent = coupon.usage_limit ? Math.min(100, Math.round(((coupon.uses_count || 0) / coupon.usage_limit) * 100)) : 0;
                                
                                return (
                                    <tr key={coupon.id} className="hover:bg-surface-container-low/30 transition-colors duration-300 group">
                                        <td className="px-8 py-6">
                                            <span className="font-mono font-bold text-sm bg-surface-container-low px-3 py-1.5 rounded-lg text-primary uppercase tracking-widest">{coupon.code}</span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2">
                                                <span className={`px-3 py-1 text-[10px] font-black rounded-full uppercase ${coupon.type === 'percentage' ? 'bg-secondary-container text-on-secondary-container' : 'bg-primary-container/60 text-on-primary-fixed'}`}>
                                                    {coupon.type}
                                                </span>
                                                <span className="font-bold text-sm text-on-surface">
                                                    {coupon.type === 'percentage' ? `${coupon.value}%` : `$${coupon.value}`}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="space-y-1.5 w-32">
                                                <div className="flex justify-between text-[10px] font-bold text-on-surface-variant">
                                                    <span>{coupon.uses_count || 0} / {coupon.usage_limit || '∞'}</span>
                                                    <span>{coupon.usage_limit ? `${usagePercent}%` : 'Unlimited'}</span>
                                                </div>
                                                <div className="h-1.5 bg-surface-container-low rounded-full overflow-hidden">
                                                    <div 
                                                        className={`h-full rounded-full ${usagePercent >= 100 ? 'bg-error' : 'bg-primary'}`} 
                                                        style={{ width: `${coupon.usage_limit ? usagePercent : 100}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <button onClick={() => toggleStatusMutation.mutate(coupon.id)} className="hover:scale-105 active:scale-95 transition-transform" title="Toggle Status">
                                                <StatusBadge coupon={coupon} />
                                            </button>
                                        </td>
                                        <td className="px-8 py-6">
                                            {coupon.expires_at ? (
                                                <p className="text-sm font-medium text-on-surface">{new Date(coupon.expires_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                            ) : (
                                                <p className="text-sm font-medium text-on-surface-variant italic">No Expiry</p>
                                            )}
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button 
                                                    onClick={() => handleEdit(coupon)}
                                                    className="p-2 hover:bg-surface-container-low rounded-lg transition-colors text-on-surface-variant hover:text-primary" 
                                                    title="Edit"
                                                >
                                                    <span className="material-symbols-outlined text-lg" data-icon="edit">edit</span>
                                                </button>
                                                <button 
                                                    onClick={() => handleDuplicate(coupon)}
                                                    className="p-2 hover:bg-surface-container-low rounded-lg transition-colors text-on-surface-variant hover:text-primary" 
                                                    title="Duplicate"
                                                >
                                                    <span className="material-symbols-outlined text-lg" data-icon="content_copy">content_copy</span>
                                                </button>
                                                <button 
                                                    onClick={() => setDeleteConfirm(coupon)}
                                                    className="p-2 hover:bg-error-container/20 rounded-lg transition-colors text-on-surface-variant hover:text-error" 
                                                    title="Delete"
                                                >
                                                    <span className="material-symbols-outlined text-lg" data-icon="delete">delete</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            }) : (
                                <tr>
                                    <td colSpan="6" className="py-24 text-center">
                                        <div className="flex flex-col items-center gap-4 text-on-surface-variant/50">
                                            <span className="material-symbols-outlined text-6xl" data-icon="local_activity">local_activity</span>
                                            <h3 className="text-xl font-bold text-on-surface mb-1">No coupons found</h3>
                                            <p className="text-sm max-w-sm mx-auto">Click "Create New Coupon" to generate a campaign code.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Promotion Lookbook/Tips */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 relative h-64 rounded-3xl overflow-hidden group">
                    <img 
                        alt="Retail space" 
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                        src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=1600"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8">
                        <h3 className="text-white text-2xl font-bold tracking-tight mb-2">Maximize Conversion</h3>
                        <p className="text-white/80 text-sm max-w-sm">Combining percentage-based discounts with early access pushes drives up cart value immediately.</p>
                    </div>
                </div>
                <div className="bg-secondary-container/50 p-8 rounded-3xl flex flex-col justify-center border border-secondary-container">
                    <span className="material-symbols-outlined text-4xl text-secondary mb-4" data-icon="auto_awesome">auto_awesome</span>
                    <h4 className="text-lg font-bold text-on-secondary-container mb-2">Campaign Tip</h4>
                    <p className="text-on-secondary-container/80 text-sm leading-relaxed mb-6">Create urgency by applying strict usage limits. Highly limited drops see a 4x higher instant redemption rate.</p>
                </div>
            </div>

            {/* Form Modal */}
            {showForm && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-inverse-surface/40 backdrop-blur-sm p-4">
                    <div className="bg-surface-container-lowest w-full max-w-2xl rounded-[2rem] shadow-2xl overflow-hidden border border-outline-variant/10 animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-8 py-6 border-b border-surface-container-low flex items-center justify-between">
                            <div>
                                <h3 className="text-2xl font-extrabold text-on-surface tracking-tight">
                                    {editingCoupon ? 'Edit Campaign' : 'New Campaign Code'}
                                </h3>
                                <p className="text-sm font-medium text-on-surface-variant mt-1">Configure discount rules and usage limits.</p>
                            </div>
                            <button onClick={resetForm} className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors cursor-pointer outline-none">
                                <span className="material-symbols-outlined text-xl">close</span>
                            </button>
                        </div>
                        
                        <div className="p-8 space-y-6 max-h-[65vh] overflow-y-auto custom-scrollbar">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Coupon Code <span className="text-error">*</span></label>
                                <input
                                    className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-xl text-sm font-mono font-bold px-4 py-3 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 text-on-surface uppercase placeholder-on-surface-variant/50 transition-all outline-none"
                                    placeholder="e.g. SUMMER24"
                                    value={formData.code}
                                    onChange={e => set('code', e.target.value.toUpperCase())}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Type <span className="text-error">*</span></label>
                                    <select
                                        className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-xl text-sm font-bold px-4 py-3 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 text-on-surface cursor-pointer transition-all outline-none"
                                        value={formData.type}
                                        onChange={e => set('type', e.target.value)}
                                    >
                                        <option value="percentage">% Percentage</option>
                                        <option value="fixed">$ Fixed Amount</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Value <span className="text-error">*</span></label>
                                    <input
                                        className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-xl text-sm font-bold px-4 py-3 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 text-on-surface transition-all outline-none"
                                        type="number"
                                        placeholder={formData.type === 'percentage' ? '20' : '50.00'}
                                        value={formData.value}
                                        onChange={e => set('value', e.target.value)}
                                    />
                                </div>
                            </div>

                            {formData.type === 'percentage' && (
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Max Discount Amount (Optional)</label>
                                    <input
                                        className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-xl text-sm font-medium px-4 py-3 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 text-on-surface placeholder-on-surface-variant/50 transition-all outline-none"
                                        type="number"
                                        placeholder="Leave empty for unlimited"
                                        value={formData.max_discount}
                                        onChange={e => set('max_discount', e.target.value)}
                                    />
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Min. Order ($)</label>
                                    <input
                                        className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-xl text-sm font-medium px-4 py-3 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 text-on-surface transition-all outline-none"
                                        type="number"
                                        placeholder="0.00"
                                        value={formData.min_order}
                                        onChange={e => set('min_order', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Total Uses Limit</label>
                                    <input
                                        className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-xl text-sm font-medium px-4 py-3 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 text-on-surface placeholder-on-surface-variant/50 transition-all outline-none"
                                        type="number"
                                        placeholder="∞ (Unlimited)"
                                        value={formData.usage_limit}
                                        onChange={e => set('usage_limit', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Per User Limit</label>
                                    <input
                                        className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-xl text-sm font-medium px-4 py-3 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 text-on-surface transition-all outline-none"
                                        type="number"
                                        placeholder="1"
                                        value={formData.per_user_limit}
                                        onChange={e => set('per_user_limit', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Expiry Date</label>
                                <input
                                    className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-xl text-sm font-medium px-4 py-3 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 text-on-surface transition-all outline-none"
                                    type="date"
                                    value={formData.expires_at}
                                    onChange={e => set('expires_at', e.target.value)}
                                />
                            </div>

                            <div className="flex items-center justify-between p-5 bg-surface-container-low/50 rounded-2xl border border-surface-container-low">
                                <div>
                                    <p className="text-sm font-bold text-on-surface">Active Campaign</p>
                                    <p className="text-xs font-medium text-on-surface-variant mt-0.5">Enable or disable this coupon globally.</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => set('is_active', !formData.is_active)}
                                    className={`w-14 h-7 rounded-full p-1 transition-colors duration-300 ${formData.is_active ? 'bg-primary' : 'bg-outline-variant/50'}`}
                                >
                                    <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-300 ${formData.is_active ? 'translate-x-7' : 'translate-x-0'}`} />
                                </button>
                            </div>
                        </div>

                        <div className="px-8 py-6 border-t border-surface-container-low bg-surface-container-low/20 flex items-center justify-end gap-3">
                            <button
                                onClick={resetForm}
                                className="px-6 py-2.5 rounded-full text-sm font-bold text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => saveMutation.mutate(formData)}
                                disabled={saveMutation.isPending || !formData.code || !formData.value}
                                className="flex items-center gap-2 px-8 py-2.5 bg-primary text-on-primary rounded-full text-sm font-bold shadow-lg shadow-primary/10 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {saveMutation.isPending && <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>}
                                {editingCoupon ? 'Save Changes' : 'Launch Campaign'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteConfirm && (
                <div className="fixed inset-0 bg-inverse-surface/40 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
                    <div className="bg-surface-container-lowest rounded-3xl shadow-2xl p-8 max-w-sm w-full border border-outline-variant/10 animate-in zoom-in-95 duration-200">
                        <div className="w-16 h-16 bg-error-container/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <span className="material-symbols-outlined text-3xl text-error">delete_forever</span>
                        </div>
                        <h3 className="text-2xl font-extrabold text-on-surface tracking-tight text-center mb-2">
                            Delete Campaign?
                        </h3>
                        <p className="text-center text-sm font-medium text-on-surface-variant mb-6">
                            You are about to permanently delete <span className="font-bold text-on-surface bg-surface-container-low px-2 py-0.5 rounded-md">{deleteConfirm?.code}</span>. This action cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteConfirm(null)}
                                className="flex-1 py-3 rounded-full border border-outline-variant/30 font-bold text-sm text-on-surface hover:bg-surface-container-low transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => deleteMutation.mutate(deleteConfirm.id)}
                                disabled={deleteMutation.isPending}
                                className="flex-1 py-3 rounded-full bg-error text-on-error font-bold text-sm hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 shadow-lg shadow-error/20"
                            >
                                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminCoupons;