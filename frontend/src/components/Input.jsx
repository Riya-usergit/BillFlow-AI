import React from 'react';

export const Input = ({
  label,
  type = 'text',
  error,
  placeholder = '',
  value,
  onChange,
  className = '',
  ...props
}) => {
  return (
    <div className={`w-full flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
          {label}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-405 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-200 ${
          error ? 'border-rose-550 focus:border-rose-550 focus:ring-rose-500/20' : ''
        }`}
        {...props}
      />
      {error && <span className="text-xs font-semibold text-rose-550 dark:text-rose-450">{error}</span>}
    </div>
  );
};

export default Input;
