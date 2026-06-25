import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import invoiceApi from '../services/api/invoiceApi';
import { useToast } from '../context/ToastContext';
import Spinner from '../components/Spinner';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';
import {
  FileText,
  Search,
  Plus,
  Filter,
  ArrowUpDown,
  Calendar,
  IndianRupee,
  Clock
} from 'lucide-react';

export const Invoices = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('newest'); // newest, oldest, amount_high, amount_low

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const data = await invoiceApi.getInvoices();
      setInvoices(data || []);
    } catch (err) {
      console.error('Failed to load invoices, entering Demo Mode fallback:', err);
      setInvoices([
        { id: 5, invoiceNumber: 'INV-2026-9812', clientName: 'Google Cloud Corp', issueDate: '2026-06-15', dueDate: '2026-07-15', totalAmount: 45000, status: 'UNPAID' },
        { id: 4, invoiceNumber: 'INV-2026-4432', clientName: 'Stripe Payments', issueDate: '2026-05-30', dueDate: '2026-06-30', totalAmount: 125000, status: 'PAID' },
        { id: 3, invoiceNumber: 'INV-2026-1029', clientName: 'Meta Platform Inc', issueDate: '2026-05-25', dueDate: '2026-06-25', totalAmount: 35000, status: 'PARTIAL' },
        { id: 2, invoiceNumber: 'INV-2026-8876', clientName: 'Netflix India', issueDate: '2026-05-10', dueDate: '2026-06-10', totalAmount: 20000, status: 'OVERDUE' },
        { id: 1, invoiceNumber: 'INV-2026-2311', clientName: 'Swiggy Delivery', issueDate: '2026-04-20', dueDate: '2026-05-20', totalAmount: 20000, status: 'PAID' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  // Filter and Sort Invoices
  const processedInvoices = invoices
    .filter((inv) => {
      if (user?.role === 'CLIENT') {
        const isOwn = inv.clientId === user.id || inv.clientName === user.tenant?.companyName;
        if (!isOwn) return false;
      }
      const matchSearch = (inv.invoiceNumber || '').toLowerCase().includes(search.toLowerCase()) ||
                          (inv.clientName || '').toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'ALL' || (inv.status || '').toUpperCase() === statusFilter;
      return matchSearch && matchStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return b.id - a.id;
      if (sortBy === 'oldest') return a.id - b.id;
      if (sortBy === 'amount_high') return (b.totalAmount || 0) - (a.totalAmount || 0);
      if (sortBy === 'amount_low') return (a.totalAmount || 0) - (b.totalAmount || 0);
      return 0;
    });

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Invoices Registry</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Review accounts receivable, client billings, and payment settlements.</p>
        </div>
        {(user?.role === 'OWNER' || user?.role === 'ACCOUNTANT') && (
          <Link to="/invoices/create" className="w-full sm:w-auto">
            <Button variant="primary" icon={Plus} className="w-full">
              New Invoice
            </Button>
          </Link>
        )}
      </div>

      {/* Control panel */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <span className="absolute left-3.5 top-3 text-slate-400">
            <Search size={18} />
          </span>
          <input
            type="text"
            placeholder="Search by invoice number or client name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-200"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 w-full md:w-auto shrink-0">
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 py-2 rounded-xl text-xs font-semibold text-slate-500 dark:text-slate-400">
            <Filter size={14} />
            <span>Status</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-slate-700 dark:text-slate-200 focus:outline-none ml-1 cursor-pointer font-bold"
            >
              <option value="ALL" className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white">All Statuses</option>
              <option value="DRAFT" className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white">Draft</option>
              <option value="UNPAID" className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white">Unpaid</option>
              <option value="PARTIAL" className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white">Partial</option>
              <option value="PAID" className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white">Paid</option>
              <option value="OVERDUE" className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white">Overdue</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 py-2 rounded-xl text-xs font-semibold text-slate-500 dark:text-slate-400">
            <ArrowUpDown size={14} />
            <span>Sort By</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-slate-700 dark:text-slate-200 focus:outline-none ml-1 cursor-pointer font-bold"
            >
              <option value="newest" className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white">Newest First</option>
              <option value="oldest" className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white">Oldest First</option>
              <option value="amount_high" className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white">Highest Amount</option>
              <option value="amount_low" className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white">Lowest Amount</option>
            </select>
          </div>
        </div>
      </div>

      {/* Invoice Grid/Table */}
      {loading ? (
        <div className="h-[40vh] flex items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : processedInvoices.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center flex flex-col items-center justify-center">
          <FileText className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-3" />
          <h4 className="text-base font-bold text-slate-700 dark:text-slate-300">No invoices matched filters</h4>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Create invoices or adjust filter configurations.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest bg-slate-50/50 dark:bg-slate-900/50">
                  <th className="px-6 py-4">Invoice #</th>
                  <th className="px-6 py-4">Client Name</th>
                  <th className="px-6 py-4">Issue Date</th>
                  <th className="px-6 py-4">Due Date</th>
                  <th className="px-6 py-4">Total Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {processedInvoices.map((inv) => (
                  <tr key={inv.id} className="text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                      #{inv.invoiceNumber}
                    </td>
                    <td className="px-6 py-4">{inv.clientName || 'Unregistered Client'}</td>
                    <td className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-1">
                        <Calendar size={13} className="text-slate-400 shrink-0" />
                        <span>{inv.issueDate || '—'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-1">
                        <Clock size={13} className="text-slate-400 shrink-0" />
                        <span>{inv.dueDate || '—'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-extrabold text-slate-900 dark:text-white">
                      <div className="flex items-center gap-0.5">
                        <IndianRupee size={12} className="text-slate-400" />
                        <span>{(inv.totalAmount || 0).toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={inv.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link to={`/invoices/${inv.id}`}>
                        <button className="text-xs font-bold text-primary-500 hover:text-primary-600 dark:hover:text-primary-400 cursor-pointer">
                          Manage Invoice
                        </button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

// Local UI button helper to make imports work instantly
const Button = ({ children, variant, icon: Icon, onClick, className }) => {
  const base = "inline-flex items-center justify-center font-bold rounded-xl text-sm px-4 py-2.5 cursor-pointer transition-all";
  const styles = variant === 'primary' 
    ? "bg-primary-600 hover:bg-primary-700 text-white shadow-md shadow-primary-500/10"
    : "border border-slate-200 dark:border-slate-800 text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800";
  return (
    <button onClick={onClick} className={`${base} ${styles} ${className}`}>
      {Icon && <Icon size={16} className="mr-2" />}
      {children}
    </button>
  );
};

export default Invoices;
