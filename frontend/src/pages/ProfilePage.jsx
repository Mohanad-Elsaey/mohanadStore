import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Loader2 } from 'lucide-react';
import axiosInstance from '../services/axiosInstance';
import { getOrders } from '../services/orderService';
import useAuthStore from '../store/authStore';

const ProfilePage = () => {
    const { user, setUser, logout } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();
    
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
    });

    const { data: ordersResp, isLoading: isLoadingOrders } = useQuery({
        queryKey: ['userOrders'],
        queryFn: getOrders,
    });

    const orders = ordersResp?.data || [];
    const latestAddress = orders[0]?.shipping_address;

    const updateProfileMutation = useMutation({
        mutationFn: (data) => axiosInstance.put('/profile', data),
        onSuccess: (res) => {
            setUser(res.data.user || res.data);
            setIsEditing(false);
            toast.success('Your profile has been updated.');
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Failed to update profile.')
    });

    const avatarMutation = useMutation({
        mutationFn: (formData) => axiosInstance.post('/profile/avatar', formData),
        onSuccess: (res) => {
            setUser(res.data.user || res.data);
            toast.success('Avatar updated successfully.');
        },
        onError: (err) => {
            const errors = err.response?.data?.errors;
            if (errors) {
                Object.values(errors).forEach(e => toast.error(e[0]));
            } else {
                toast.error(err.response?.data?.message || 'Failed to update avatar.');
            }
        }
    });

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Check if file is larger than 5MB
            if (file.size > 5 * 1024 * 1024) {
                toast.error('الصورة كبيرة جدًا، يرجى اختيار صورة حجمها أقل من 5 ميجابايت. / File too large (Max 5MB)');
                return;
            }
            const fd = new FormData();
            fd.append('avatar', file);
            avatarMutation.mutate(fd);
        }
    };

    const handleLogout = (e) => {
        e.preventDefault();
        logout();
        navigate('/');
        toast.success('Logged out successfully');
    };

    return (
        <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto min-h-screen font-manrope">
            <div className="flex flex-col lg:flex-row gap-12">
                {/* Sidebar Navigation */}
                <aside className="w-full lg:w-64 flex-shrink-0">
                    <div className="sticky top-32 space-y-2">
                        <h2 className="px-4 mb-6 text-xs font-bold tracking-widest uppercase text-secondary">Account</h2>
                        <Link to="/profile" className="flex items-center gap-4 px-4 py-3 rounded-full bg-primary-container text-on-primary-container font-semibold transition-all duration-400">
                            <span className="material-symbols-outlined text-base">person</span>
                            <span className="text-sm">Profile</span>
                        </Link>
                        <Link to="/wishlist" className="flex items-center gap-4 px-4 py-3 rounded-full text-on-surface-variant hover:bg-surface-container-low transition-all duration-400">
                            <span className="material-symbols-outlined text-base">favorite</span>
                            <span className="text-sm">Wishlist</span>
                        </Link>
                        <Link to="/orders" className="flex items-center gap-4 px-4 py-3 rounded-full text-on-surface-variant hover:bg-surface-container-low transition-all duration-400">
                            <span className="material-symbols-outlined text-base">shopping_bag</span>
                            <span className="text-sm">Orders</span>
                        </Link>
                        <div className="pt-8 mt-8 border-t border-outline-variant/15">
                            <button onClick={handleLogout} className="w-full flex items-center gap-4 px-4 py-3 rounded-full text-error/80 hover:bg-error/5 transition-all duration-400">
                                <span className="material-symbols-outlined text-base">logout</span>
                                <span className="text-sm">Sign Out</span>
                            </button>
                        </div>
                    </div>
                </aside>
                
                {/* Profile Content Area */}
                <section className="flex-grow">
                    <div className="max-w-3xl">
                        <div className="flex justify-between items-end mb-12">
                            <div>
                                <span className="text-xs font-bold tracking-[0.2em] uppercase text-secondary mb-2 block">Personal Information</span>
                                <h1 className="text-4xl font-extrabold tracking-tight text-on-surface">Profile Details</h1>
                            </div>
                            <button 
                                onClick={() => setIsEditing(!isEditing)} 
                                className={`flex items-center gap-2 px-6 py-2 rounded-full border border-outline-variant/30 text-sm font-semibold transition-all duration-300 hover:bg-surface-container-low ${isEditing ? 'bg-surface-container-high' : ''}`}
                            >
                                <span className="material-symbols-outlined text-sm">{isEditing ? 'close' : 'edit'}</span>
                                {isEditing ? 'Cancel Edit' : 'Edit Profile'}
                            </button>
                        </div>
                        
                        {isEditing ? (
                            <form 
                                onSubmit={(e) => { e.preventDefault(); updateProfileMutation.mutate(formData); }} 
                                className="space-y-6 bg-surface-container-lowest p-8 rounded-3xl border border-outline-variant/10 shadow-[0_20px_40px_rgba(45,52,53,0.03)]"
                            >
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-on-surface">Full Name</label>
                                    <input 
                                        type="text" 
                                        value={formData.name} 
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                        className="w-full px-4 py-3 rounded-xl border border-outline-variant/30 bg-surface-container-low focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-on-surface">Email Address</label>
                                    <input 
                                        type="email" 
                                        value={formData.email} 
                                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                                        className="w-full px-4 py-3 rounded-xl border border-outline-variant/30 bg-surface-container-low focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-on-surface">Phone Number</label>
                                    <input 
                                        type="tel" 
                                        value={formData.phone} 
                                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                        className="w-full px-4 py-3 rounded-xl border border-outline-variant/30 bg-surface-container-low focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                    />
                                </div>
                                <button 
                                    type="submit" 
                                    disabled={updateProfileMutation.isPending}
                                    className="w-full flex justify-center items-center gap-2 mt-8 px-6 py-4 rounded-xl bg-primary text-on-primary font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
                                >
                                    {updateProfileMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Changes'}
                                </button>
                            </form>
                        ) : (
                            <>
                                {/* Profile Bento Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Main Card */}
                                    <div className="md:col-span-2 p-8 rounded-3xl bg-surface-container-lowest border border-outline-variant/10 shadow-[0_20px_40px_rgba(45,52,53,0.03)] flex flex-col md:flex-row items-center gap-8">
                                        <div className="relative group">
                                            <div className="w-32 h-32 rounded-full overflow-hidden bg-surface-container-low ring-4 ring-white">
                                                <img 
                                                    className="w-full h-full object-cover" 
                                                    alt={user?.name || "Profile"} 
                                                    src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=e4e2e1&color=5f5e5e`} 
                                                />
                                            </div>
                                            <label className="absolute bottom-0 right-0 p-2 bg-primary text-on-primary rounded-full shadow-lg scale-90 active:scale-75 transition-transform cursor-pointer hover:opacity-90">
                                                {avatarMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <span className="material-symbols-outlined text-base">photo_camera</span>}
                                                <input type="file" className="hidden" onChange={handleAvatarChange} disabled={avatarMutation.isPending} />
                                            </label>
                                        </div>
                                        <div className="text-center md:text-left">
                                            <h3 className="text-2xl font-bold text-on-surface">{user?.name || 'Guest User'}</h3>
                                            <p className="text-on-surface-variant">Member since {user?.created_at ? new Date(user.created_at).toLocaleDateString(undefined, { month: 'long', year: 'numeric' }) : 'Recently'}</p>
                                            <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-2">
                                                <span className="px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container text-[10px] font-bold tracking-wider uppercase">Premium Member</span>
                                                <span className="px-3 py-1 rounded-full bg-surface-container-high text-on-surface-variant text-[10px] font-bold tracking-wider uppercase">Verified</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Data Tiles */}
                                    <div className="p-8 rounded-3xl bg-surface-container-low transition-colors hover:bg-surface-container-high">
                                        <div className="flex items-center gap-3 mb-4">
                                            <span className="material-symbols-outlined text-secondary text-lg">mail</span>
                                            <span className="text-xs font-bold tracking-widest uppercase text-secondary">Email Address</span>
                                        </div>
                                        <p className="text-lg font-medium text-on-surface break-words">{user?.email || 'N/A'}</p>
                                    </div>
                                    
                                    <div className="p-8 rounded-3xl bg-surface-container-low transition-colors hover:bg-surface-container-high">
                                        <div className="flex items-center gap-3 mb-4">
                                            <span className="material-symbols-outlined text-secondary text-lg">call</span>
                                            <span className="text-xs font-bold tracking-widest uppercase text-secondary">Phone Number</span>
                                        </div>
                                        <p className="text-lg font-medium text-on-surface">{user?.phone || 'Not provided'}</p>
                                    </div>
                                    
                                    <div className="p-8 rounded-3xl bg-surface-container-low transition-colors hover:bg-surface-container-high md:col-span-2 flex flex-col justify-center">
                                        <div className="flex items-center gap-3 mb-4">
                                            <span className="material-symbols-outlined text-secondary text-lg">location_on</span>
                                            <span className="text-xs font-bold tracking-widest uppercase text-secondary">Default Shipping</span>
                                        </div>
                                        <div className="flex justify-between items-start">
                                            <p className="text-lg font-medium text-on-surface leading-relaxed">
                                                {latestAddress ? (
                                                    <>
                                                        {latestAddress.address_line1} <br />
                                                        {latestAddress.city}, {latestAddress.country}
                                                    </>
                                                ) : 'No default address set.'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Recent Activity Section */}
                                <div className="mt-20">
                                    <div className="flex items-center justify-between mb-8">
                                        <h2 className="text-2xl font-bold tracking-tight text-on-surface">Recent Orders</h2>
                                        <Link to="/orders" className="text-sm font-semibold text-primary underline underline-offset-4 hover:opacity-80">View All Orders</Link>
                                    </div>
                                    <div className="space-y-4">
                                        {isLoadingOrders ? (
                                            <div className="flex justify-center py-10">
                                                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                            </div>
                                        ) : orders.length > 0 ? (
                                            orders.slice(0, 3).map((order) => {
                                                const firstItem = order.items?.[0];
                                                const statusColors = {
                                                    pending: 'text-amber-600',
                                                    processing: 'text-blue-600',
                                                    shipped: 'text-purple-600',
                                                    delivered: 'text-green-600',
                                                    cancelled: 'text-red-600',
                                                };
                                                return (
                                                    <div key={order.order_number} onClick={() => navigate(`/orders/${order.order_number}`)} className="group flex items-center gap-6 p-6 rounded-3xl bg-surface-container-lowest border border-outline-variant/10 hover:border-primary/20 transition-all duration-300 cursor-pointer">
                                                        <div className="w-16 h-20 rounded-xl bg-surface overflow-hidden flex-shrink-0">
                                                            <img 
                                                                className="w-full h-full object-cover" 
                                                                src={firstItem?.product?.images?.[0]?.image_path || 'https://via.placeholder.com/64x80'} 
                                                                alt={firstItem?.name || "Order Thumbnail"} 
                                                            />
                                                        </div>
                                                        <div className="flex-grow">
                                                            <p className={`text-xs font-bold tracking-widest uppercase mb-1 ${statusColors[order.status] || 'text-secondary'}`}>
                                                                {order.status}
                                                            </p>
                                                            <h4 className="font-bold text-on-surface">{firstItem ? `${firstItem.name} ${order.items.length > 1 ? `(+${order.items.length - 1})` : ''}` : 'Unknown Item'}</h4>
                                                            <p className="text-sm text-on-surface-variant">Order #{order.order_number} • ${parseFloat(order.total).toFixed(2)}</p>
                                                        </div>
                                                        <span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors">arrow_forward</span>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <div className="text-center py-12 bg-surface-container-lowest rounded-3xl border border-outline-variant/10">
                                                <p className="text-sm font-bold text-on-surface-variant uppercase tracking-widest">No order history found</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </section>
            </div>
        </main>
    );
};

export default ProfilePage;
