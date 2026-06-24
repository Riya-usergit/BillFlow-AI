import React from 'react';

export const StatusBadge = ({ status }) => {
  const statusStr = (status || '').toUpperCase();

  const config = {
    PAID: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-250/20',
    UNPAID: 'bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 border border-rose-250/20',
    PARTIAL: 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-250/20',
    OVERDUE: 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border border-red-250/20',
    DRAFT: 'bg-slate-100 dark:bg-slate-850 text-slate-600 dark:text-slate-400 border border-slate-200/50 dark:border-slate-800/50',
  };

  const currentStyles = config[statusStr] || config.DRAFT;

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${currentStyles}`}>
      {statusStr}
    </span>
  );
};

export default StatusBadge;
