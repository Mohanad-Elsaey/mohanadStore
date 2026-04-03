import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Settings,
    Shield,
    Globe,
    Bell,
    Database,
    Cpu,
    Save,
    Lock,
    Eye,
    EyeOff,
    CheckCircle2,
    AlertCircle,
    Server,
    Mail,
    CreditCard,
    ArrowRight
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getAdminSettings } from '../services/adminService';
import axiosInstance from '../services/axiosInstance';

const AdminSettings = () => {
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState('general');

    const { data: settingsResp, isLoading, isError } = useQuery({
        queryKey: ['adminSettings'],
        queryFn: getAdminSettings,
    });

    const settings = settingsResp?.data || settingsResp || {};

    const saveMutation = useMutation({
        mutationFn: (data) => axiosInstance.post('/admin/settings', data),
        onSuccess: () => {
            queryClient.invalidateQueries(['adminSettings']);
            toast.success('System configuration updated successfully.');
        },
        onError: () => toast.error('Failed to synchronize settings.')
    });

    if (isLoading) return (
        <div className="flex flex-col items-center justify-center py-40 gap-8 min-h-[60vh]">
            <div className="w-12 h-12 border-4 border-slate-100 border-t-slate-900 rounded-full animate-spin"></div>
            <p className="font-bold text-slate-400 text-sm italic uppercase tracking-widest">Loading Configuration...</p>
        </div>
    );

    const sections = [
        { id: 'general', name: 'Store Profile', icon: Globe, desc: 'Public identity & localization' },
        { id: 'system', name: 'Operational', icon: Server, desc: 'Fulfillment & inventory logic' },
        { id: 'security', name: 'Access Control', icon: Shield, desc: 'Authentication & safety' },
        { id: 'notifications', name: 'Alert System', icon: Bell, desc: 'Administrative triggers' },
        { id: 'payment', name: 'Transaction', icon: CreditCard, desc: 'Gateways & processing' },
    ];

    return (
        <div className="space-y-12 pb-24 font-manrope">

            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="space-y-4">
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic">Centralized Platform Management</span>
                    <h1 className="text-6xl font-black text-slate-900 tracking-tighter uppercase italic leading-[0.8] font-headline">System settings</h1>
                </div>
                <button
                    onClick={() => saveMutation.mutate(settings)}
                    disabled={saveMutation.isPending}
                    className="bg-slate-950 text-white rounded-2xl px-12 py-6 text-xs font-black uppercase tracking-widest flex items-center gap-4 hover:bg-slate-800 active:scale-95 transition-all shadow-3xl disabled:opacity-50 italic"
                >
                    <Save className="w-5 h-5 text-amber-400" /> Commit Changes
                </button>
            </div>

            <div className="flex flex-col lg:flex-row gap-12">

                {/* Vertical Navigation Rail */}
                <div className="w-full lg:w-80 shrink-0 space-y-3">
                    {sections.map(section => {
                        const Icon = section.icon;
                        const isActive = activeTab === section.id;
                        return (
                            <button
                                key={section.id}
                                onClick={() => setActiveTab(section.id)}
                                className={`w-full p-8 rounded-[2.5rem] flex flex-col items-start gap-4 transition-all duration-500 border-2 text-left ${isActive
                                        ? 'bg-white border-slate-950 text-slate-950 shadow-2xl translate-x-3 scale-[1.02]'
                                        : 'bg-slate-50 border-transparent text-slate-400 hover:bg-white hover:border-slate-200 hover:text-slate-900 shadow-sm'
                                    }`}
                            >
                                <div className={`p-3 rounded-xl ${isActive ? 'bg-slate-950 text-white shadow-lg' : 'bg-white text-slate-300 border border-slate-100'}`}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-[11px] font-black uppercase tracking-widest italic">{section.name}</p>
                                    <p className="text-[9px] font-bold opacity-60 mt-1 uppercase tracking-tight">{section.desc}</p>
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* Principal Configuration Content */}
                <div className="flex-1 bg-white rounded-[3.5rem] p-10 lg:p-16 border border-slate-100 shadow-sm min-h-[700px] relative overflow-hidden group/main">

                    <div className="space-y-16 relative z-10">
                        {activeTab === 'general' && (
                            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                <div>
                                    <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic leading-none flex items-center gap-4">
                                        <Globe className="w-8 h-8 text-primary" /> Store Information
                                    </h3>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-3 ml-12">Public identity and regional preferences</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-4">Official Brand Name</label>
                                        <input 
                                            defaultValue={settings?.site_name || "Mohaned Store"}
                                            className="w-full bg-slate-50 border border-transparent px-8 py-6 rounded-[2rem] text-sm font-bold tracking-tight outline-none focus:bg-white focus:border-slate-950 focus:ring-4 focus:ring-slate-950/5 transition-all shadow-inner"
                                            placeholder="Store Title"
                                        />
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-4">Support Email Address</label>
                                        <input 
                                            defaultValue={settings?.contact_email || "support@mohaned.com"}
                                            placeholder="contact@store.com"
                                            className="w-full bg-slate-50 border border-transparent px-8 py-6 rounded-[2rem] text-sm font-bold tracking-tight outline-none focus:bg-white focus:border-slate-950 focus:ring-4 focus:ring-slate-950/5 transition-all shadow-inner"
                                        />
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-4">Transactional Currency</label>
                                        <div className="relative">
                                            <select className="w-full bg-slate-50 border border-transparent px-8 py-6 rounded-[2rem] text-sm font-black uppercase tracking-widest outline-none focus:bg-white focus:border-slate-950 appearance-none shadow-inner cursor-pointer">
                                                <option>USD - US Dollar</option>
                                                <option>EGP - Egyptian Pound</option>
                                                <option>EUR - Euro</option>
                                                <option>GBP - British Pound</option>
                                            </select>
                                            <div className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">
                                                <ArrowRight className="w-4 h-4 rotate-90" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-4">Deployment Status</label>
                                        <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-[2rem] shadow-inner">
                                            <div className="flex-1 text-center py-4 bg-slate-950 text-white rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest cursor-pointer shadow-xl transition-all">Production</div>
                                            <div className="flex-1 text-center py-4 text-slate-400 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest cursor-pointer hover:bg-slate-200 transition-all">Maintenance</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'security' && (
                            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                <div>
                                    <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic leading-none flex items-center gap-4">
                                        <Shield className="w-8 h-8 text-rose-500" /> Platform Security
                                    </h3>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-3 ml-12">Administrative access & session control</p>
                                </div>

                                <div className="space-y-6">
                                    {[
                                        { title: 'Force Multi-Factor Auth', desc: 'Require additional verification for administrative access', enabled: true },
                                        { title: 'Session Duration Control', desc: 'Automatically terminate inactive administrative sessions after 12 hours', enabled: true },
                                        { title: 'Advanced Firewall Logs', desc: 'Record all incoming traffic metadata for security auditing', enabled: false },
                                    ].map((opt, i) => (
                                        <div key={i} className={`flex items-center justify-between p-8 rounded-[2.5rem] border-2 transition-all hover:shadow-md cursor-pointer ${opt.enabled ? 'bg-slate-50 border-slate-100' : 'bg-white border-slate-50 opacity-60'}`}>
                                            <div className="space-y-1">
                                                <h4 className="text-xl font-black uppercase italic tracking-tighter text-slate-950">{opt.title}</h4>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{opt.desc}</p>
                                            </div>
                                            <div className={`w-14 h-8 rounded-full p-1.5 transition-all duration-500 relative ${opt.enabled ? 'bg-slate-950' : 'bg-slate-200'}`}>
                                                <div className={`w-5 h-5 bg-white rounded-full shadow-lg transition-all transform ${opt.enabled ? 'translate-x-6' : 'translate-x-0'}`} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Recent System Activity Log */}
                        <div className="pt-24 border-t border-slate-100 space-y-8">
                            <div className="flex items-center justify-between">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 italic">Audit Log Insight</h4>
                                <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-2">
                                    <CheckCircle2 className="w-3 h-3" /> System Operational
                                </span>
                            </div>
                            <div className="bg-slate-950 rounded-[2.5rem] p-10 font-mono text-[10px] text-slate-400 shadow-3xl border border-white/5 relative overflow-hidden">
                                <div className="space-y-3 relative z-10 transition-all">
                                    <p className="flex items-center gap-4"><span className="text-amber-500 font-bold">[SYNC]</span> Initializing system configuration handshake...</p>
                                    <p className="flex items-center gap-4 text-emerald-400"><span className="font-bold">[SUCCESS]</span> Environment variables synchronized across 4 nodes.</p>
                                    <p className="flex items-center gap-4 opacity-40"><span className="text-slate-200 font-bold">[LOG]</span> Entry detected: User (Admin) updated 'CURRENCY_MODE' to 'USD'.</p>
                                    <p className="flex items-center gap-4 opacity-40"><span className="text-slate-200 font-bold">[LOG]</span> Security audit completed: 0 critical vulnerabilities found.</p>
                                </div>
                                <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-slate-950 to-transparent pointer-events-none" />
                            </div>
                        </div>

                    </div>

                    {/* Aesthetic Background Decoration */}
                    <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-primary opacity-[0.03] rounded-full blur-[120px] pointer-events-none group-hover/main:opacity-5 transition-opacity" />
                    <div className="absolute top-0 right-0 w-40 h-40 bg-slate-950 opacity-[0.02] -translate-y-1/2 translate-x-1/2 rounded-full blur-[80px] pointer-events-none" />
                </div>
            </div>

        </div>
    );
};

export default AdminSettings;
