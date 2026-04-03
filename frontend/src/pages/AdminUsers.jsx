import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { getAdminUsers, toggleUserRole, getAdminStats } from '../services/adminService';
import axiosInstance from '../services/axiosInstance';

const AdminUsers = () => {
    const queryClient = useQueryClient();
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('');

    const { data: usersResp, isLoading } = useQuery({
        queryKey: ['adminUsers', page, search],
        queryFn: () => getAdminUsers({ page, search }),
    });

    const { data: statsResp } = useQuery({
        queryKey: ['adminStats'],
        queryFn: getAdminStats,
    });

    const users = usersResp?.data || [];
    let filteredUsers = users;
    if (roleFilter === 'admin') filteredUsers = users.filter(u => u.role === 'admin');
    if (roleFilter === 'user') filteredUsers = users.filter(u => u.role !== 'admin');
    const meta = usersResp?.meta;
    const summary = statsResp?.data?.summary || {};

    const toggleStatusMutation = useMutation({
        mutationFn: (user) => {
            const endpoint = user.is_banned
                ? `/admin/users/${user.id}/unban`
                : `/admin/users/${user.id}/ban`;
            return axiosInstance.post(endpoint);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
            toast.success('User status updated.');
        },
        onError: () => toast.error('Failed to update status.')
    });

    const toggleRoleMutation = useMutation({
        mutationFn: (id) => toggleUserRole(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
            toast.success('User role updated.');
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Failed to update role.')
    });

    if (isLoading) return (
        <div className="flex flex-col items-center justify-center py-40 space-y-6 font-manrope">
            <span className="material-symbols-outlined animate-spin text-4xl text-primary" style={{ animationDirection: 'reverse' }}>progress_activity</span>
            <p className="font-bold text-on-surface-variant text-sm uppercase tracking-widest">Loading users</p>
        </div>
    );

    return (
        <div className="font-manrope animate-in fade-in duration-700">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                <div>
                    <h2 className="text-4xl font-extrabold tracking-tight text-on-surface mb-2">User Management</h2>
                    <p className="text-on-surface-variant max-w-lg">Orchestrate your atelier's ecosystem. Manage staff access levels and client relationships with precision.</p>
                </div>
                <div className="flex gap-3">
                    <button className="px-6 py-3 rounded-full border border-outline-variant/20 text-on-surface font-semibold text-sm hover:bg-surface-container-low transition-colors flex items-center gap-2 shadow-sm bg-surface-container-lowest">
                        <span className="material-symbols-outlined text-lg">file_download</span>
                        Export List
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/10 shadow-[0_4px_20px_rgba(45,52,53,0.02)] group hover:shadow-[0_12px_30px_rgba(45,52,53,0.06)] transition-all duration-500">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 rounded-xl bg-surface-container-low text-primary">
                            <span className="material-symbols-outlined">group</span>
                        </div>
                    </div>
                    <p className="text-on-surface-variant text-sm font-medium uppercase tracking-widest mb-1">Total Users</p>
                    <h3 className="text-3xl font-black text-on-surface">{summary?.total_customers || meta?.total || 0}</h3>
                </div>
                <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/10 shadow-[0_4px_20px_rgba(45,52,53,0.02)] group hover:shadow-[0_12px_30px_rgba(45,52,53,0.06)] transition-all duration-500">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 rounded-xl bg-secondary-container/50 text-on-secondary-container">
                            <span className="material-symbols-outlined">verified_user</span>
                        </div>
                    </div>
                    <p className="text-on-surface-variant text-sm font-medium uppercase tracking-widest mb-1">Admin Staff</p>
                    <h3 className="text-3xl font-black text-on-surface">Protected</h3>
                </div>
                <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/10 shadow-[0_4px_20px_rgba(45,52,53,0.02)] group hover:shadow-[0_12px_30px_rgba(45,52,53,0.06)] transition-all duration-500">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 rounded-xl bg-error-container/20 text-error">
                            <span className="material-symbols-outlined">person_off</span>
                        </div>
                    </div>
                    <p className="text-on-surface-variant text-sm font-medium uppercase tracking-widest mb-1">Restricted</p>
                    <h3 className="text-3xl font-black text-on-surface">Monitored</h3>
                </div>
            </div>

            {/* Table Section */}
            <div className="bg-surface-container-lowest rounded-3xl overflow-hidden shadow-[0_10px_30px_rgba(45,52,53,0.03)] border border-outline-variant/10">
                <div className="px-8 py-6 flex flex-col md:flex-row items-center justify-between border-b border-outline-variant/10 gap-4">
                    <div className="flex gap-6 overflow-x-auto w-full md:w-auto no-scrollbar">
                        <button 
                            onClick={() => setRoleFilter('')}
                            className={`text-sm whitespace-nowrap pb-1 transition-colors ${roleFilter === '' ? 'font-bold border-b-2 border-primary text-on-surface' : 'font-medium text-on-surface-variant hover:text-on-surface'}`}
                        >
                            All Users
                        </button>
                        <button 
                            onClick={() => setRoleFilter('admin')}
                            className={`text-sm whitespace-nowrap pb-1 transition-colors ${roleFilter === 'admin' ? 'font-bold border-b-2 border-primary text-on-surface' : 'font-medium text-on-surface-variant hover:text-on-surface'}`}
                        >
                            Admin Staff
                        </button>
                        <button 
                            onClick={() => setRoleFilter('user')}
                            className={`text-sm whitespace-nowrap pb-1 transition-colors ${roleFilter === 'user' ? 'font-bold border-b-2 border-primary text-on-surface' : 'font-medium text-on-surface-variant hover:text-on-surface'}`}
                        >
                            Standard Clients
                        </button>
                    </div>
                    <div className="flex items-center gap-2 w-full md:w-auto bg-surface-container-low/50 px-4 py-2 rounded-full border border-outline-variant/10 focus-within:border-primary/30 transition-colors">
                        <span className="material-symbols-outlined text-on-surface-variant/50 text-sm">search</span>
                        <input 
                            className="bg-transparent border-none focus:ring-0 text-sm font-medium w-full md:w-48 placeholder:text-on-surface-variant/50 outline-none text-on-surface" 
                            placeholder="Search users..." 
                            type="text"
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        />
                    </div>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-surface-container-low/30 border-b border-surface-container-low">
                                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant">User</th>
                                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant">Role</th>
                                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant">Status</th>
                                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant">Joined Date</th>
                                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant/10">
                            {filteredUsers.length > 0 ? filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-surface-container-low/30 transition-colors duration-300 group">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full overflow-hidden bg-surface-container-high border-2 border-transparent group-hover:border-primary/20 transition-all shrink-0">
                                                <img 
                                                    className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500" 
                                                    src={`https://i.pravatar.cc/150?u=${user.id}`} 
                                                    alt={user.name} 
                                                />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-bold text-on-surface group-hover:text-primary transition-colors truncate">{user.name}</p>
                                                <p className="text-xs text-on-surface-variant truncate">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        {user.role === 'admin' ? (
                                            <span className="px-3 py-1 rounded-full bg-on-background text-on-primary text-[10px] font-bold uppercase tracking-wider">Admin</span>
                                        ) : (
                                            <span className="px-3 py-1 rounded-full bg-secondary-container/50 text-on-secondary-container text-[10px] font-bold uppercase tracking-wider">Customer</span>
                                        )}
                                    </td>
                                    <td className="px-8 py-5">
                                        {user.is_banned ? (
                                            <div className="flex items-center gap-1.5 text-xs font-bold text-error">
                                                <span className="w-2 h-2 rounded-full bg-error"></span> Restricted
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                                                <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Active
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-8 py-5 text-sm font-medium text-on-surface-variant">
                                        {new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button 
                                                onClick={() => toggleRoleMutation.mutate(user.id)}
                                                disabled={toggleRoleMutation.isPending}
                                                className={`p-2 rounded-lg transition-colors ${user.role === 'admin' ? 'hover:bg-error-container/20 hover:text-error text-on-surface-variant' : 'hover:bg-primary/10 hover:text-primary text-on-surface-variant'}`}
                                                title={user.role === 'admin' ? "Demote to Customer" : "Promote to Admin"}
                                            >
                                                <span className="material-symbols-outlined text-[20px]">{user.role === 'admin' ? 'shield_minus' : 'shield_person'}</span>
                                            </button>
                                            <button 
                                                onClick={() => toggleStatusMutation.mutate(user)}
                                                disabled={toggleStatusMutation.isPending}
                                                className={`p-2 rounded-lg transition-colors ${user.is_banned ? 'hover:bg-emerald-50 hover:text-emerald-600 text-error' : 'hover:bg-error-container/20 hover:text-error text-on-surface-variant'}`}
                                                title={user.is_banned ? "Unban User" : "Ban User"}
                                            >
                                                <span className="material-symbols-outlined text-[20px]">{user.is_banned ? 'how_to_reg' : 'person_cancel'}</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" className="py-24 text-center">
                                        <div className="flex flex-col items-center gap-4 text-on-surface-variant/50">
                                            <span className="material-symbols-outlined text-6xl" data-icon="group_off">group_off</span>
                                            <h3 className="text-xl font-bold text-on-surface mb-1">No users found</h3>
                                            <p className="text-sm max-w-sm mx-auto">We couldn't find any users matching your criteria.</p>
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
                        <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">
                            Showing <span className="text-on-surface">{meta.from || 0}-{meta.to || 0}</span> of <span className="text-on-surface">{meta.total}</span>
                        </p>
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

            {/* Contextual Insight Footer */}
            <div className="mt-12 p-8 bg-surface-container-lowest border border-outline-variant/10 rounded-[2rem] flex items-center gap-8 relative overflow-hidden shadow-sm">
                <div className="relative z-10 flex-1">
                    <h4 className="text-xl font-bold text-on-surface mb-2">User Access & Security</h4>
                    <p className="text-on-surface-variant text-sm max-w-xl">
                        Monitor staff roles and perform periodic access reviews. Protect the atelier's platform by instantly restricting users exhibiting suspicious patterns or managing admin promotions to trusted personnel.
                    </p>
                </div>
                <div className="absolute -right-10 -top-10 w-48 h-48 bg-primary/5 rounded-full blur-3xl"></div>
                <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-secondary/5 rounded-full blur-3xl"></div>
            </div>
        </div>
    );
};

export default AdminUsers;