import React from 'react';

export const Button = ({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  onClick,
  disabled = false,
  className = '',
  icon: Icon,
  loading = false,
  ...props
}) => {
  const baseStyle = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer';
  
  const variants = {
    primary: 'bg-primary-600 hover:bg-primary-700 text-white focus:ring-primary-500 shadow-md shadow-primary-500/10 hover:shadow-lg hover:shadow-primary-500/20',
    secondary: 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-350 focus:ring-slate-550',
    danger: 'bg-rose-600 hover:bg-rose-700 text-white focus:ring-rose-500 shadow-md shadow-rose-500/10',
    outline: 'border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 focus:ring-primary-500',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-5 py-3 text-base',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="w-4 h-4 mr-2 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
      ) : Icon ? (
        <Icon className="w-4 h-4 mr-2 shrink-0" />
      ) : null}
      {children}
    </button>
  );
};

export default Button;
