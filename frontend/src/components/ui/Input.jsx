import React from 'react';

const Input = ({ 
  label, 
  error, 
  helperText, 
  type = 'text', 
  className = '', 
  id, 
  ...props 
}) => {
  return (
    <div className={`space-y-4 mb-10 ${className}`}>
      {label && (
        <label 
          htmlFor={id} 
          className="block text-[10px] font-black uppercase tracking-[0.3em] text-on-background italic"
        >
          {label}
        </label>
      )}
      <input
        id={id}
        type={type}
        className={`input-editorial ${error ? 'border-error bg-error/5' : ''}`}
        {...props}
      />
      {error && (
        <p className="text-[9px] font-black italic uppercase tracking-widest text-error mt-2">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p className="text-[9px] font-black italic uppercase tracking-widest text-secondary/30 mt-2">
          {helperText}
        </p>
      )}
    </div>
  );
};

export default Input;
