import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import axiosInstance from '../services/axiosInstance';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [isSent, setIsSent] = useState(false);

    const navigate = useNavigate();

    const forgotPasswordMutation = useMutation({
        mutationFn: (data) => axiosInstance.post('/auth/forgot-password', data),
        onSuccess: () => {
            toast.success('Recovery protocol dispatched.');
            navigate('/verify-otp', { state: { email } });
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Transmission failure.')
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        forgotPasswordMutation.mutate({ email });
    };

    return (
        <main className="min-h-screen flex items-center justify-center p-4 md:p-8 font-body bg-surface text-on-surface antialiased">
            <div className="w-full max-w-5xl bg-surface-container-lowest editorial-shadow rounded-lg overflow-hidden flex min-h-[600px]">
                
                {/* Left Panel - Image */}
                <div className="hidden md:flex md:w-1/2 relative bg-surface-container-highest overflow-hidden">
                    <img
                        alt="High-end fashion editorial"
                        className="absolute inset-0 w-full h-full object-cover opacity-90 transition-transform duration-700 hover:scale-105"
                        src="https://images.unsplash.com/photo-1549439602-43ebca2327af?q=80&w=1200"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-on-background/60 to-transparent flex flex-col justify-end p-12">
                        <h1 className="font-headline text-5xl font-extrabold text-surface-container-lowest tracking-tighter mb-4">
                            MOHANED
                        </h1>
                        <p className="font-label text-surface-container-lowest/80 text-sm uppercase tracking-[0.2em]">
                            Security Protocols • Identity Recovery
                        </p>
                    </div>
                </div>

                {/* Right Panel - Form */}
                <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
                    <div className="md:hidden mb-8">
                        <span className="font-headline text-2xl font-extrabold tracking-tighter text-on-background">
                            MOHANED
                        </span>
                    </div>

                    <div className="max-w-md mx-auto w-full">
                        {!isSent ? (
                            <form onSubmit={handleSubmit} className="space-y-10">
                                <header className="space-y-4">
                                    <h2 className="font-headline text-4xl font-black text-on-background tracking-tighter uppercase italic leading-none">
                                        Recover Access.
                                    </h2>
                                    <p className="text-secondary text-sm font-medium">
                                        Input your digital address to receive an authentication packet.
                                    </p>
                                </header>

                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-secondary/50 mb-1">
                                        Email Address
                                    </label>
                                    <input 
                                        type="email" 
                                        className="w-full bg-transparent py-4 font-body text-on-background border-b-2 border-slate-100 focus:border-slate-900 outline-none transition-all px-0" 
                                        placeholder="DESIGNATE EMAIL"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>

                                <div className="space-y-6">
                                    <button
                                        type="submit"
                                        disabled={forgotPasswordMutation.isLoading}
                                        className="w-full py-5 bg-on-background text-white font-headline text-xs font-black uppercase tracking-[0.3em] rounded-sm shadow-2xl hover:bg-primary-vibrant active:scale-[0.98] transition-all"
                                    >
                                        {forgotPasswordMutation.isLoading ? 'Processing...' : 'Dispatch Packet'}
                                    </button>

                                    <Link to="/login" className="block text-center text-[10px] font-black uppercase tracking-widest text-secondary hover:text-on-background transition-colors italic">
                                        Return to Core Protocols
                                    </Link>
                                </div>
                            </form>
                        ) : (
                            <div className="text-center space-y-10 animate-fade-in">
                                <div className="w-24 h-24 bg-primary-vibrant/10 rounded-full flex items-center justify-center mx-auto">
                                    <span className="material-symbols-outlined text-4xl text-primary-vibrant">mark_email_read</span>
                                </div>
                                <div className="space-y-4">
                                    <h2 className="text-3xl font-black text-on-background tracking-tighter uppercase italic">PACKET DISPATCHED</h2>
                                    <p className="text-sm font-medium text-secondary leading-relaxed">System has transmitted a recovery packet. Verify your inbox to authenticate.</p>
                                </div>
                                <Link to="/login" className="inline-block px-12 py-4 bg-on-background text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-sm hover:bg-primary-vibrant transition-all">
                                    Login Interface
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
};

export default ForgotPasswordPage;
