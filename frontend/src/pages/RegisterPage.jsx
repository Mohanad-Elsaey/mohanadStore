import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Loader2 } from 'lucide-react';
import { register } from '../services/authService';

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        password_confirmation: ''
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await register(formData);
            toast.success(`Verification protocol dispatched to ${formData.email}`);
            navigate('/verify-otp', { state: { email: formData.email } });
        } catch (err) {
            const errors = err.response?.data?.errors;
            if (errors) {
                Object.values(errors).forEach(e => toast.error(e[0]));
            } else {
                toast.error(err.response?.data?.message || 'Registration failed');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="font-manrope min-h-screen w-full flex-grow flex items-center justify-center px-6 py-12 md:py-24 bg-surface text-on-surface">
            {/* Center Registration Card */}
            <div className="w-full mx-auto max-w-[480px] bg-surface-container-lowest rounded-xl p-8 md:p-12 shadow-[0_20px_40px_rgba(45,52,53,0.06)] border border-outline-variant/10">
                {/* Brand Identity */}
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold tracking-tighter text-on-background mb-2 uppercase">Mohanad</h1>
                    <p className="text-on-surface-variant text-sm tracking-wide">Join our curated digital atelier.</p>
                </div>

                {/* Registration Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Full Name */}
                    <div className="space-y-2">
                        <label className="block text-[10px] uppercase tracking-[0.15em] font-semibold text-secondary ml-1">Full Name</label>
                        <input
                            className="w-full h-14 px-5 bg-surface-container-low border-none rounded-xl text-on-surface placeholder:text-outline-variant focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-high transition-all outline-none"
                            placeholder="Ahmed Mohamed"
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                        <label className="block text-[10px] uppercase tracking-[0.15em] font-semibold text-secondary ml-1">Email Address</label>
                        <input
                            className="w-full h-14 px-5 bg-surface-container-low border-none rounded-xl text-on-surface placeholder:text-outline-variant focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-high transition-all outline-none"
                            placeholder="hello@atelier.com"
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>

                    {/* Password Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 col">
                        <div className="space-y-2">
                            <label className="block text-[10px] uppercase tracking-[0.15em] font-semibold text-secondary ml-1">Password</label>
                            <input
                                className="w-full h-14 px-5 bg-surface-container-low border-none rounded-xl text-on-surface placeholder:text-outline-variant focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-high transition-all outline-none"
                                placeholder="••••••••"
                                type="password"
                                required
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-[10px] uppercase tracking-[0.15em] font-semibold text-secondary ml-1">Confirm</label>
                            <input
                                className="w-full h-14 px-5 bg-surface-container-low border-none rounded-xl text-on-surface placeholder:text-outline-variant focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-high transition-all outline-none"
                                placeholder="••••••••"
                                type="password"
                                required
                                value={formData.password_confirmation}
                                onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Primary CTA */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center h-14 bg-primary text-on-primary rounded-full font-semibold text-sm tracking-wider uppercase shadow-lg shadow-primary/10 hover:bg-primary-dim transition-all active:scale-[0.98] duration-300 mt-4 disabled:opacity-70"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Create Account'}
                    </button>
                </form>

                {/* Footer Link */}
                <div className="mt-10 text-center">
                    <p className="text-sm text-on-surface-variant font-medium">
                        Already have an account?
                        <Link className="text-primary font-bold hover:underline ml-1" to="/login">Sign In</Link>
                    </p>
                </div>
            </div>
        </main>
    );
};

export default RegisterPage;