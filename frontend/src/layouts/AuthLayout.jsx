import React from 'react';

export const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background radial gradient glow */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-850/80 rounded-3xl shadow-2xl p-6 md:p-8 relative z-10 glass">
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary-600 to-primary-400 flex items-center justify-center text-white font-extrabold text-2xl shadow-lg shadow-primary-500/20 mb-3 animate-pulse">
            BF
          </div>
          <h2 className="text-2xl font-black tracking-tight text-slate-850 dark:text-white">
            BillFlow <span className="text-primary-500 font-extrabold">AI</span>
          </h2>
          <p className="text-xs text-slate-450 dark:text-slate-400 font-semibold mt-1">
            Enterprise Invoicing & Payment Analytics
          </p>
        </div>

        {children}
      </div>
    </div>
  );
};

export default AuthLayout;
