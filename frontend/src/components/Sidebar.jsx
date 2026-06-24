import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Package,
  FileSpreadsheet,
  Building2,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { logout, user } = useAuth();
  const userRole = user?.role || 'OWNER';

  const links = userRole === 'CLIENT'
    ? [
        { to: '/dashboard', label: 'My Dashboard', icon: LayoutDashboard },
        { to: '/invoices', label: 'My Invoices', icon: FileSpreadsheet },
        { to: '/profile', label: 'Billing Space', icon: Building2 },
      ]
    : userRole === 'OWNER'
    ? [
        { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { to: '/invoices', label: 'Invoices Registry', icon: FileSpreadsheet },
        { to: '/clients', label: 'Clients Registry', icon: Users },
        { to: '/products', label: 'Product Catalog', icon: Package },
        { to: '/profile', label: 'Company Settings', icon: Building2 },
      ]
    : [
        { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { to: '/invoices', label: 'Invoices Registry', icon: FileSpreadsheet },
        { to: '/clients', label: 'Clients Registry', icon: Users },
        { to: '/products', label: 'Product Catalog', icon: Package },
      ];

  return (
    <aside
      className={`fixed top-0 left-0 z-30 h-screen border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-all duration-300 flex flex-col justify-between ${
        isOpen ? 'w-64' : 'w-20'
      }`}
    >
      <div>
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary-600 to-primary-400 flex items-center justify-center text-white font-extrabold text-lg shadow-lg shadow-primary-500/20 shrink-0">
              BF
            </div>
            {isOpen && (
              <span className="font-bold text-base bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent tracking-tight whitespace-nowrap">
                BillFlow <span className="text-primary-500 text-xs font-semibold uppercase bg-primary-100 dark:bg-primary-950/50 px-1.5 py-0.5 rounded ml-1">AI</span>
              </span>
            )}
          </div>
          <button
            onClick={toggleSidebar}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 hidden md:block"
          >
            {isOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 group ${
                    isActive
                      ? 'bg-primary-50 dark:bg-primary-950/30 text-primary-600 dark:text-primary-400'
                      : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-800 dark:hover:text-slate-200'
                  }`
                }
              >
                <Icon size={18} className="shrink-0" />
                {isOpen && <span className="whitespace-nowrap">{link.label}</span>}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* User Actions footer */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
        {isOpen && user && (
          <div className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center text-primary-700 dark:text-primary-300 font-semibold text-xs uppercase shrink-0">
              {user.name ? user.name[0] : 'U'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{user.name}</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">{user.tenant?.companyName || 'BillFlow Tenant'}</p>
            </div>
          </div>
        )}
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all duration-200"
        >
          <LogOut size={18} className="shrink-0" />
          {isOpen && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
