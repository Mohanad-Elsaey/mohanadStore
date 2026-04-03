import React from 'react';
import { Loader2 } from 'lucide-react';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  loading = false, 
  type = 'button', 
  className = '', 
  disabled = false, 
  onClick 
}) => {
  const base = "inline-flex items-center justify-center font-black tracking-widest uppercase italic transition-all duration-200 select-none cursor-pointer disabled:grayscale disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "btn-stitch-primary",
    secondary: "btn-stitch-secondary",
    danger: "bg-error text-white px-8 py-5 rounded-default",
    ghost: "bg-transparent text-secondary hover:bg-surface-container-low px-8 py-5 rounded-default",
  };

  const sizes = {
    sm: "text-[9px] px-6 py-3",
    md: "text-[10px] px-10 py-5",
    lg: "text-[12px] px-14 py-6",
  };

  return (
    <button
      type={type}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      onClick={onClick}
    >
      {loading && <Loader2 className="w-4 h-4 mr-3 animate-spin text-inherit opacity-70" />}
      {children}
    </button>
  );
};

export default Button;
