import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { ShieldCheck, ArrowRight, RefreshCw, Mail } from 'lucide-react';
import { verifyOTP, resendOTP } from '../services/authService';

const VerifyOTPPage = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [timer, setTimer] = useState(60);
  
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';
  
  const inputRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];

  useEffect(() => {
    if (!email) {
      toast.error('Identity context missing. Redirecting...');
      navigate('/login');
    }
  }, [email, navigate]);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer(t => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleChange = (e, index) => {
    const value = e.target.value;
    if (isNaN(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Auto-focus next
    if (value && index < 5) {
      inputRefs[index + 1].current.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs[index - 1].current.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length < 6) {
      toast.error('Please complete the verification protocol.');
      return;
    }

    setLoading(true);
    try {
      await verifyOTP({ email, otp: code });
      toast.success('Identity validated successfully.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Verification protocol failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0) return;
    setResending(true);
    try {
      await resendOTP(email);
      toast.success('New verification protocol dispatched.');
      setTimer(60);
    } catch (err) {
      toast.error('Dispatch failed. Please try again later.');
    } finally {
      setResending(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4 md:p-8 font-body bg-slate-50 text-slate-900 antialiased">
      <div className="w-full max-w-[480px] bg-white rounded-3xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] p-8 md:p-12 text-center space-y-8 border border-slate-100">
        
        {/* Header Icon */}
        <div className="mx-auto w-20 h-20 bg-slate-900 rounded-3xl flex items-center justify-center shadow-2xl rotate-3 mb-4">
          <ShieldCheck className="w-10 h-10 text-white" />
        </div>

        <div className="space-y-2">
          <h1 className="font-headline text-3xl font-black tracking-tight uppercase">Verify Access</h1>
          <p className="text-slate-400 text-sm font-medium flex items-center justify-center gap-2">
            <Mail className="w-4 h-4 opacity-50" />
            Code sent to <span className="text-slate-900 font-bold">{email}</span>
          </p>
        </div>

        {/* OTP Inputs */}
        <form onSubmit={handleSubmit} className="space-y-10">
          <div className="flex justify-between gap-2 md:gap-4">
            {otp.map((data, index) => (
              <input
                key={index}
                ref={inputRefs[index]}
                type="text"
                maxLength="1"
                value={data}
                onChange={e => handleChange(e, index)}
                onKeyDown={e => handleKeyDown(e, index)}
                className="w-12 h-16 md:w-14 md:h-20 text-center text-2xl font-black bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-slate-900 focus:bg-white outline-none transition-all"
              />
            ))}
          </div>

          <div className="space-y-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-on-background text-white font-headline text-[11px] font-black uppercase tracking-[0.3em] rounded-xl shadow-xl hover:bg-primary transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {loading ? 'Validating...' : 'Verify Identity'}
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleResend}
              disabled={resending || timer > 0}
              className="group flex items-center justify-center gap-2 mx-auto text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-on-background transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${resending ? 'animate-spin' : ''}`} />
              {timer > 0 ? `Retry in ${timer}s` : 'Request New Code'}
            </button>
          </div>
        </form>

        <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest leading-relaxed">
          Secure Multi-Factor Authentication Protocol • Mohaned store Corp
        </p>
      </div>
    </main>
  );
};

export default VerifyOTPPage;
