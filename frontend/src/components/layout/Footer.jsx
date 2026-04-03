import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="w-full bg-surface-dim dark:bg-zinc-900 py-20 px-10 font-manrope text-sm tracking-tight leading-relaxed">
            <div className="max-w-screen-2xl mx-auto px-8 md:px-16 grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-12">
                <div className="lg:col-span-2">
                    <Link to="/" className="text-2xl font-bold tracking-tighter text-on-surface dark:text-zinc-100 mb-6 block uppercase">
                        MOHANAD
                    </Link>
                    <p className="text-on-surface-variant dark:text-zinc-500 max-w-sm mb-8">
                        High-end fashion atelier focusing on minimalist luxury and artisanal craftsmanship. Designed for the Digital Atelier.
                    </p>
                    <div className="space-y-4">
                        <h4 className="text-[10px] tracking-[0.1em] font-semibold uppercase text-on-surface dark:text-white">Join the Atelier</h4>
                        <form className="flex max-w-sm" onSubmit={e => e.preventDefault()}>
                            <input 
                                className="flex-grow bg-transparent border-b border-outline-variant py-2 focus:outline-none focus:border-on-surface dark:focus:border-white transition-colors text-on-surface dark:text-zinc-100" 
                                placeholder="Email Address" 
                                type="email"
                            />
                            <button className="px-4 py-2 text-[10px] tracking-[0.1em] font-semibold uppercase hover:text-primary dark:hover:text-zinc-300 transition-colors duration-400 ease-out cursor-pointer" type="submit">
                                Subscribe
                            </button>
                        </form>
                    </div>
                </div>
                
                <div>
                    <h4 className="text-[10px] tracking-[0.1em] font-semibold uppercase text-on-surface dark:text-white mb-6">Shop</h4>
                    <ul className="space-y-4">
                        <li><Link to="/products?sort=newest" className="text-on-surface-variant dark:text-zinc-500 hover:text-primary dark:hover:text-zinc-300 transition-colors duration-400 ease-out cursor-pointer">New Arrivals</Link></li>
                        <li><Link to="/categories" className="text-on-surface-variant dark:text-zinc-500 hover:text-primary dark:hover:text-zinc-300 transition-colors duration-400 ease-out cursor-pointer">Collections</Link></li>
                        <li><Link to="/products?sort=popular" className="text-on-surface-variant dark:text-zinc-500 hover:text-primary dark:hover:text-zinc-300 transition-colors duration-400 ease-out cursor-pointer">Best Sellers</Link></li>
                        <li><Link to="/products" className="text-on-surface-variant dark:text-zinc-500 hover:text-primary dark:hover:text-zinc-300 transition-colors duration-400 ease-out cursor-pointer">Archive</Link></li>
                    </ul>
                </div>
                
                <div>
                    <h4 className="text-[10px] tracking-[0.1em] font-semibold uppercase text-on-surface dark:text-white mb-6">Atelier</h4>
                    <ul className="space-y-4">
                        <li><Link to="/about" className="text-on-surface-variant dark:text-zinc-500 hover:text-primary dark:hover:text-zinc-300 transition-colors duration-400 ease-out cursor-pointer">Our Story</Link></li>
                        <li><Link to="/sustainability" className="text-on-surface-variant dark:text-zinc-500 hover:text-primary dark:hover:text-zinc-300 transition-colors duration-400 ease-out cursor-pointer">Sustainability</Link></li>
                        <li><Link to="/careers" className="text-on-surface-variant dark:text-zinc-500 hover:text-primary dark:hover:text-zinc-300 transition-colors duration-400 ease-out cursor-pointer">Careers</Link></li>
                    </ul>
                </div>
                
                <div>
                    <h4 className="text-[10px] tracking-[0.1em] font-semibold uppercase text-on-surface dark:text-white mb-6">Support</h4>
                    <ul className="space-y-4">
                        <li><Link to="/shipping" className="text-on-surface-variant dark:text-zinc-500 hover:text-primary dark:hover:text-zinc-300 transition-colors duration-400 ease-out cursor-pointer">Shipping & Returns</Link></li>
                        <li><Link to="/faq" className="text-on-surface-variant dark:text-zinc-500 hover:text-primary dark:hover:text-zinc-300 transition-colors duration-400 ease-out cursor-pointer">FAQ</Link></li>
                        <li><Link to="/contact" className="text-on-surface-variant dark:text-zinc-500 hover:text-primary dark:hover:text-zinc-300 transition-colors duration-400 ease-out cursor-pointer">Contact Us</Link></li>
                    </ul>
                </div>
            </div>
            
            <div className="max-w-screen-2xl mx-auto px-8 md:px-16 mt-20 pt-10 border-t border-outline-variant/20 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="text-primary dark:text-zinc-400 text-[10px] tracking-[0.1em] font-semibold uppercase">
                    © 2026 MOHANAD ATELIER. ALL RIGHTS RESERVED.
                </div>
                <div className="flex gap-8">
                    <Link to="/privacy" className="text-on-surface-variant dark:text-zinc-500 hover:text-primary dark:hover:text-zinc-300 transition-colors duration-400 ease-out cursor-pointer text-[10px] tracking-[0.1em] font-semibold uppercase">Privacy Policy</Link>
                    <Link to="/terms" className="text-on-surface-variant dark:text-zinc-500 hover:text-primary dark:hover:text-zinc-300 transition-colors duration-400 ease-out cursor-pointer text-[10px] tracking-[0.1em] font-semibold uppercase">Terms</Link>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
