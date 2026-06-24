import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Building2,
  Database,
  Mail,
  Shield,
  Key,
  Server,
  Activity,
  Cpu
} from 'lucide-react';

export const CompanyProfile = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="p-6 text-center text-slate-500">
        Loading profile...
      </div>
    );
  }

  const tenant = user.tenant || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white font-sans">Company Settings</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Review your multi-tenant workspace credentials and server integrations.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tenant Information Card */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 md:p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest border-b pb-2 flex items-center gap-2">
              <Building2 size={16} /> Tenant Space Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs font-semibold">
              <div className="space-y-1">
                <p className="text-slate-400">Company Name</p>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{tenant.companyName || 'BillFlow AI Tenant'}</p>
              </div>

              <div className="space-y-1">
                <p className="text-slate-400">Tenant Identifier ID</p>
                <p className="text-sm font-mono font-bold text-primary-500">
                  TENANT-00{tenant.id || '9'}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-slate-400">Account Owner</p>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{user.name}</p>
              </div>

              <div className="space-y-1">
                <p className="text-slate-400">Billing Support Email</p>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{user.email}</p>
              </div>
            </div>
          </div>

          {/* Infrastructure status card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 md:p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest border-b pb-2 flex items-center gap-2">
              <Server size={16} /> SMTP Mail Gateway Integration
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
              <div className="space-y-1 bg-slate-50 dark:bg-slate-950/20 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                <p className="text-slate-400">Mail Gateway Host</p>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">smtp.gmail.com</p>
              </div>

              <div className="space-y-1 bg-slate-50 dark:bg-slate-950/20 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                <p className="text-slate-400">SMTP Port</p>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">587 (TLS Enabled)</p>
              </div>

              <div className="space-y-1 bg-slate-50 dark:bg-slate-950/20 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                <p className="text-slate-400">System Sender Address</p>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">riyamprajapati@gmail.com</p>
              </div>

              <div className="space-y-1 bg-slate-50 dark:bg-slate-950/20 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                <p className="text-slate-400">Email Dispatch Status</p>
                <span className="inline-flex items-center text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-lg mt-1">
                  <Activity size={10} className="mr-1" /> GATEWAY CONNECTED
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Security Keys & Multi-Tenant Cards */}
        <div className="space-y-6">
          {user?.role !== 'CLIENT' && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
              <h3 className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest border-b pb-2 flex items-center gap-2">
                <Shield size={16} /> API Security Credentials
              </h3>

              <div className="space-y-3.5 text-xs font-semibold">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Key size={14} />
                    <span>Developer Token Key</span>
                  </div>
                  {user?.role === 'OWNER' ? (
                    <div className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl font-mono text-[10px] text-slate-500 truncate select-all">
                      eyJhbGciOiJIUzI1NiJ9.YmlsbEZsb3dfY2xpZW50.c2VjdXJlX211bHRpX3RlbmFudF9hdXRoX3Rva2VuXzIwMjY
                    </div>
                  ) : (
                    <div className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl font-mono text-[10px] text-slate-400 italic">
                      •••••••••••••••••••• (Restricted to Owner)
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <p className="text-slate-400">Tenant DB Mode</p>
                  <div className="flex items-center gap-2 text-slate-900 dark:text-white mt-1">
                    <Database size={15} className="text-primary-500" />
                    <span className="font-bold">MySQL Tenant Partitioning</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* AI Services active card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest border-b pb-2 flex items-center gap-2">
              <Cpu size={16} /> Predictive AI Service status
            </h3>

            <div className="space-y-2.5 text-xs font-semibold">
              <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                <span>Credit Scoring Engine</span>
                <span className="text-[10px] text-emerald-500 font-bold uppercase">Online</span>
              </div>
              <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                <span>Smart Reminders Engine</span>
                <span className="text-[10px] text-emerald-500 font-bold uppercase">Online</span>
              </div>
              <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                <span>Late Payment Predictor</span>
                <span className="text-[10px] text-emerald-500 font-bold uppercase">Online</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyProfile;
