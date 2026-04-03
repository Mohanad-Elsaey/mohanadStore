import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Loader2 } from 'lucide-react';
import { login } from '../services/authService';
import useAuthStore from '../store/authStore';

const LoginPage = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const navigate = useNavigate();
    const setAuth = useAuthStore((state) => state.setUser);
    const setToken = useAuthStore((state) => state.setToken);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const data = await login(formData);
            setAuth(data.user);
            setToken(data.token);
            toast.success(`Welcome back, ${data.user.name}`);
            if (data.user?.role === 'admin') navigate('/admin');
            else navigate('/');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Invalid email or password.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="font-manrope min-h-screen w-full flex-grow flex items-center justify-center px-6 py-24 md:py-32 relative bg-surface text-on-surface overflow-hidden">
            {/* Background Atmospheric Element */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-[10%] -left-[5%] w-[40%] h-[40%] bg-surface-container-highest rounded-full blur-[120px] opacity-40"></div>
                <div className="absolute -bottom-[10%] -right-[5%] w-[30%] h-[50%] bg-secondary-container rounded-full blur-[120px] opacity-30"></div>
            </div>

            {/* Login Card */}
            <div className="relative z-10 w-full max-w-md bg-surface-container-lowest rounded-xl shadow-[0_20px_40px_rgba(45,52,53,0.06)] p-8 md:p-12 border border-outline-variant/10">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-extrabold tracking-tight text-on-surface mb-2 font-headline uppercase italic">Welcome Back</h1>
                    <p className="text-on-surface-variant font-body text-sm leading-relaxed">Enter your credentials to access your atelier.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Email Field */}
                    <div>
                        <label className="block text-[10px] tracking-[0.1em] uppercase font-bold text-secondary mb-2 ml-1" htmlFor="email">Email Address</label>
                        <input
                            className="w-full px-6 py-4 bg-surface-container-low border-none rounded-full focus:ring-2 focus:ring-primary/20 transition-all duration-300 text-on-surface placeholder:text-on-surface-variant/40 outline-none"
                            id="email"
                            type="email"
                            required
                            placeholder="atelier@mohanad.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>

                    {/* Password Field */}
                    <div className="relative">
                        <div className="flex justify-between items-center mb-2 px-1">
                            <label className="text-[10px] tracking-[0.1em] uppercase font-bold text-secondary" htmlFor="password">Password</label>
                            <Link to="/forgot-password" className="text-[10px] tracking-[0.05em] text-on-surface-variant hover:text-primary transition-colors uppercase font-medium">Forgot Password?</Link>
                        </div>
                        <div className="relative">
                            <input
                                className="w-full pl-6 pr-12 py-4 bg-surface-container-low border-none rounded-full focus:ring-2 focus:ring-primary/20 transition-all duration-300 text-on-surface placeholder:text-on-surface-variant/40 outline-none"
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                required
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center p-2 rounded-full outline-none"
                            >
                                <span className="material-symbols-outlined text-[20px]">{showPassword ? 'visibility' : 'visibility_off'}</span>
                            </button>
                        </div>
                    </div>

                    {/* Remember Me */}
                    <div className="flex items-center space-x-3 px-1">
                        <input
                            className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary/20 bg-surface-container-low transition-all cursor-pointer"
                            id="remember"
                            type="checkbox"
                        />
                        <label className="text-xs text-on-surface-variant font-medium cursor-pointer" htmlFor="remember">Remember Me</label>
                    </div>

                    {/* Sign In Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex justify-center items-center py-4 bg-primary text-on-primary font-bold rounded-full shadow-lg shadow-primary/10 hover:bg-primary-dim active:scale-95 transition-all duration-400 uppercase tracking-widest text-[11px] disabled:opacity-70"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign In'}
                    </button>
                </form>

                {/* Footer Link */}
                <div className="mt-10 text-center">
                    <p className="text-sm text-on-surface-variant font-medium">
                        Don't have an account?
                        <Link className="text-primary font-bold hover:underline underline-offset-4 ml-1 transition-all duration-300 tracking-wide" to="/register">Create one.</Link>
                    </p>
                </div>
            </div>
        </main>
    );
};

export default LoginPage;