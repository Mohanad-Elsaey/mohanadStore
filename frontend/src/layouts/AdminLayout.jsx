import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

const AdminLayout = () => {
    const { user, logout } = useAuthStore();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const menuItems = [
        { name: 'Dashboard', icon: 'dashboard', path: '/admin' },
        { name: 'Products', icon: 'inventory_2', path: '/admin/products' },
        { name: 'Orders', icon: 'shopping_bag', path: '/admin/orders' },
        { name: 'Customers', icon: 'group', path: '/admin/customers' },
        { name: 'Categories', icon: 'category', path: '/admin/categories' },
        { name: 'Coupons', icon: 'confirmation_number', path: '/admin/coupons' },
    ];

    return (
        <div className="flex h-screen bg-background text-on-surface antialiased font-manrope selection:bg-surface-container-high">
            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-inverse-surface/40 backdrop-blur-sm z-40 lg:hidden animate-fade-in"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* SideNavBar */}
            <aside className={`fixed lg:static inset-y-0 left-0 h-full w-64 bg-surface lg:bg-transparent border-r border-surface-container-low lg:border-transparent flex flex-col py-8 z-50 transition-transform duration-500 lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="px-8 mb-12 flex justify-between items-center">
                    <Link to="/admin" className="block" onClick={() => setIsSidebarOpen(false)}>
                        <h1 className="text-2xl font-bold tracking-tighter text-on-surface">Mohanad</h1>
                        <p className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant/60 font-semibold mt-1">Admin Atelier</p>
                    </Link>
                    <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-on-surface-variant hover:text-on-surface">
                        <span className="material-symbols-outlined" data-icon="close">close</span>
                    </button>
                </div>
                
                <nav className="flex-1 space-y-1 px-4 overflow-y-auto no-scrollbar">
                    {menuItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link 
                                key={item.name}
                                to={item.path}
                                onClick={() => setIsSidebarOpen(false)}
                                className={`flex items-center gap-4 py-3 rounded-lg transition-colors duration-400 ease-out ${isActive ? 'text-on-surface font-bold border-l-4 border-surface-tint pl-4 bg-surface-container-low' : 'text-on-surface-variant hover:text-on-surface pl-5 hover:bg-surface-container-low'}`}
                            >
                                <span className="material-symbols-outlined" data-icon={item.icon}>{item.icon}</span>
                                <span>{item.name}</span>
                            </Link>
                        );
                    })}
                    
                    <div className="pt-8">
                        <Link to="/" className="flex items-center gap-4 py-3 text-on-surface-variant hover:text-on-surface pl-5 hover:bg-surface-container-low transition-colors duration-400 ease-out rounded-lg">
                            <span className="material-symbols-outlined" data-icon="storefront">storefront</span>
                            <span>Storefront</span>
                        </Link>
                        <button onClick={handleLogout} className="w-full flex items-center gap-4 py-3 text-error hover:text-error-dim pl-5 hover:bg-error-container/20 transition-colors duration-400 ease-out rounded-lg">
                            <span className="material-symbols-outlined" data-icon="logout">logout</span>
                            <span>Sign Out</span>
                        </button>
                    </div>
                </nav>

                <div className="px-8 mt-auto pt-6">
                    <div className="p-4 rounded-xl bg-surface-container-low flex items-center gap-3 cursor-pointer hover:bg-surface-container transition-colors" onClick={() => navigate('/account/profile')}>
                        <img 
                            className="w-8 h-8 rounded-full object-cover" 
                            src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name}`} 
                            alt={user?.name} 
                        />
                        <div className="overflow-hidden">
                            <p className="font-bold text-xs text-on-surface truncate">{user?.name || 'Admin User'}</p>
                            <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mt-0.5">Director</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden relative bg-background">
                {/* TopAppBar */}
                <header className="flex items-center justify-between px-6 lg:px-12 sticky top-0 z-30 h-20 bg-background/80 backdrop-blur-xl border-b border-surface-container-low text-sm ease-out duration-400 shrink-0">
                    <div className="flex items-center flex-1 max-w-xl gap-4">
                        <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden text-on-surface-variant hover:text-on-surface p-2 -ml-2">
                            <span className="material-symbols-outlined" data-icon="menu">menu</span>
                        </button>
                        <div className="relative w-full group hidden md:block">
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50 group-focus-within:text-primary transition-colors">search</span>
                            <input 
                                className="w-full bg-surface-container-low border-none rounded-full py-2.5 pl-12 pr-6 focus:ring-1 focus:ring-primary/20 focus:bg-surface-container-high transition-all duration-300 placeholder:text-on-surface-variant/40 outline-none text-on-surface" 
                                placeholder="Search orders, products or customers..." 
                                type="text"
                            />
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-4 lg:gap-6">
                        <button className="relative hover:opacity-70 transition-opacity hidden sm:block">
                            <span className="material-symbols-outlined text-primary" data-icon="notifications">notifications</span>
                            <span className="absolute top-0 right-0 w-1.5 h-1.5 bg-error rounded-full ring-2 ring-background"></span>
                        </button>
                        <button className="hover:opacity-70 transition-opacity hidden sm:block">
                            <span className="material-symbols-outlined text-primary" data-icon="chat_bubble">chat_bubble</span>
                        </button>
                        <div className="h-6 w-[1px] bg-outline-variant/30 hidden sm:block"></div>
                        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/account/profile')}>
                            <span className="font-semibold text-on-surface hidden lg:block">Admin Atelier</span>
                            <img 
                                className="w-9 h-9 rounded-full object-cover ring-2 ring-background shadow-xs" 
                                src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name}`} 
                                alt={user?.name}
                            />
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto w-full scroll-smooth">
                    <div className="p-6 lg:p-12 max-w-[1400px] mx-auto min-h-full">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
