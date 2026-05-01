import React, { memo, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, User, LogOut, Heart, Shield, Package, Menu, X, ArrowRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import useAuthStore from '../../store/authStore';
import { getCart } from '../../services/cartService';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const user = useAuthStore((state) => state.user);
  const location = useLocation();
  
  const { data: cartResp } = useQuery({
    queryKey: ['cart'],
    queryFn: getCart,
    enabled: !!user
  });

  const cartCount = cartResp?.items?.length || 0;

  // Close menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  // Disable scroll when menu is open
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
  }, [isOpen]);

  const navLinks = [
    { name: 'HOME', path: '/' },
    { name: 'SHOP', path: '/shop' },
    { name: 'CATEGORIES', path: '/categories' },
  ];

  return (
    <nav className="fixed top-0 left-0 w-full z-[100] bg-white transition-all duration-500 border-b border-slate-50">
      <div className="max-w-[1440px] mx-auto px-6 h-20 md:h-24 flex items-center justify-between font-manrope">
        
        {/* Mobile Menu Toggle */}
        <button onClick={() => setIsOpen(true)} className="lg:hidden p-2 -ml-2 text-slate-900">
          <Menu className="w-6 h-6" />
        </button>

        {/* Logo */}
        <Link to="/" className="text-2xl font-black tracking-tighter text-slate-950 select-none italic">
          AsmaStore
        </Link>

        {/* Desktop Links */}
        <div className="hidden lg:flex items-center gap-12 absolute left-1/2 -translate-x-1/2">
          {navLinks.map((link) => (
            <Link 
              key={link.path}
              to={link.path} 
              className={`text-[11px] font-black tracking-[0.2em] uppercase transition-all hover:text-slate-900 ${
                location.pathname === link.path ? 'text-slate-950' : 'text-slate-400'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Action Icons */}
        <div className="flex items-center gap-4 md:gap-7">
          <Link to="/wishlist" className="text-slate-400 hover:text-slate-950 transition-colors">
            <Heart className="w-5 h-5" />
          </Link>

          <Link to="/cart" className="text-slate-400 hover:text-slate-950 transition-colors relative group">
            <ShoppingBag className="w-5 h-5 md:w-6 md:h-6 group-hover:scale-110 transition-transform" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-slate-900 text-[8px] font-black text-white rounded-full flex items-center justify-center animate-bounce">
                {cartCount}
              </span>
            )}
          </Link>

          <div className="hidden md:block h-6 w-[1px] bg-slate-100" />

          {user ? (
            <div className="flex items-center gap-6">
               {user.role === 'admin' && (
                <Link to="/admin" className="hidden lg:flex items-center gap-2 group transition-all">
                  <Shield className="w-5 h-5 text-slate-400 group-hover:text-slate-900 transition-colors" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-900 transition-all">Staff</span>
                </Link>
              )}
              <Link to="/profile" className="flex items-center gap-2 group transition-all">
                <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:border-slate-900 transition-all overflow-hidden shadow-inner">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              </Link>
            </div>
          ) : (
            <Link to="/login" className="flex items-center gap-2 group transition-all">
              <User className="w-5 h-5 md:w-6 md:h-6 text-slate-400 group-hover:text-slate-900 transition-colors" />
              <span className="hidden lg:block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 group-hover:text-slate-950">ID</span>
            </Link>
          )}
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      <div className={`fixed inset-0 z-[200] lg:hidden transition-all duration-500 ${isOpen ? 'visible' : 'invisible'}`}>
        {/* Backdrop */}
        <div 
          className={`absolute inset-0 bg-slate-950/20 backdrop-blur-md transition-opacity duration-500 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setIsOpen(false)}
        />
        
        {/* Drawer */}
        <div className={`absolute left-0 top-0 h-full w-[85%] max-w-sm bg-white shadow-2xl transition-transform duration-500 ease-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="p-8 h-full flex flex-col">
            <div className="flex justify-between items-center mb-16">
              <span className="text-xl font-black italic">MENU</span>
              <button onClick={() => setIsOpen(false)} className="p-2 -mr-2 text-slate-900 bg-slate-50 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 space-y-8">
              {navLinks.map((link) => (
                <Link 
                  key={link.path}
                  to={link.path}
                  className="block group"
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-4xl font-black italic tracking-tighter ${location.pathname === link.path ? 'text-slate-950' : 'text-slate-300 group-hover:text-slate-950'} transition-colors`}>
                      {link.name}
                    </span>
                    <ArrowRight className={`w-6 h-6 ${location.pathname === link.path ? 'text-slate-950' : 'text-slate-100 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0'} transition-all`} />
                  </div>
                </Link>
              ))}
            </div>

            <div className="pt-8 border-t border-slate-50 space-y-6">
              {user?.role === 'admin' && (
                <Link to="/admin" className="flex items-center gap-4 group">
                  <div className="w-12 h-12 rounded-xl bg-amber-400 flex items-center justify-center">
                    <Shield className="w-6 h-6 text-slate-950" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Management</p>
                    <p className="font-black text-slate-900 uppercase italic">Admin Panel</p>
                  </div>
                </Link>
              )}
              
              <Link to="/profile" className="flex items-center gap-4 group">
                <div className="w-12 h-12 rounded-xl bg-slate-950 flex items-center justify-center overflow-hidden">
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-6 h-6 text-white" />
                  )}
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">My Identity</p>
                  <p className="font-black text-slate-900 uppercase italic">{user ? user.name : 'Sign In'}</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default memo(Navbar);
