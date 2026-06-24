import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { X } from 'lucide-react';

export const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      </div>

      {/* Mobile Sidebar overlay drawer */}
      {mobileSidebarOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          {/* Overlay backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setMobileSidebarOpen(false)}
          ></div>

          {/* Drawer panel */}
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 animate-slide-in-left">
            <div className="absolute top-3 right-3 z-50">
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-850"
              >
                <X size={20} />
              </button>
            </div>
            {/* Render full open view in drawer */}
            <Sidebar isOpen={true} toggleSidebar={() => {}} />
          </div>
        </div>
      )}

      {/* Main content viewport wrapper */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          sidebarOpen ? 'md:pl-64' : 'md:pl-20'
        }`}
      >
        <Navbar toggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)} />
        <main className="flex-1 p-4 md:p-6 overflow-y-auto max-w-[1600px] w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
