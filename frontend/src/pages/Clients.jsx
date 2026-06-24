import React, { useEffect, useState } from 'react';
import clientApi from '../services/api/clientApi';
import aiApi from '../services/api/aiApi';
import { useToast } from '../context/ToastContext';
import Button from '../components/Button';
import Input from '../components/Input';
import Modal from '../components/Modal';
import Spinner from '../components/Spinner';
import { useAuth } from '../context/AuthContext';
import {
  Users,
  Search,
  Plus,
  Edit2,
  Trash2,
  Eye,
  Mail,
  Phone,
  Building,
  MapPin,
  FileText,
  Activity,
  Heart,
  TrendingDown
} from 'lucide-react';

export const Clients = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modals state
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientHealth, setClientHealth] = useState(null);
  const [healthLoading, setHealthLoading] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [address, setAddress] = useState('');
  const [formErrors, setFormErrors] = useState({});

  const fetchClients = async () => {
    try {
      setLoading(true);
      const data = await clientApi.getClients();
      setClients(data || []);
    } catch (err) {
      console.error('Failed to load clients registry, entering Demo Mode fallback:', err);
      setClients([
        { id: 1, name: 'Sundar Pichai', companyName: 'Google Cloud Corp', email: 'sundar@google.com', phone: '+91 9988112233', gstNumber: '07AAAAA1111A1Z1', address: 'Google Signature Towers, Gurgaon, India' },
        { id: 2, name: 'Patrick Collison', companyName: 'Stripe Payments', email: 'patrick@stripe.com', phone: '+1 415 887 2341', gstNumber: '27BBBBB2222B2Z2', address: '100 Townsend St, San Francisco, CA, USA' },
        { id: 3, name: 'Mark Zuckerberg', companyName: 'Meta Platform Inc', email: 'zuck@meta.com', phone: '+1 650 334 9901', gstNumber: '19CCCCC3333C3Z3', address: '1 Hacker Way, Menlo Park, CA, USA' },
        { id: 4, name: 'Reed Hastings', companyName: 'Netflix India', email: 'reed@netflix.com', phone: '+91 22 6677 8899', gstNumber: '29DDDDD4444D4Z4', address: 'Bandra Kurla Complex, Mumbai, India' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const resetForm = () => {
    setName('');
    setEmail('');
    setPhone('');
    setCompanyName('');
    setGstNumber('');
    setAddress('');
    setFormErrors({});
  };

  const handleOpenEdit = (client) => {
    setSelectedClient(client);
    setName(client.name || '');
    setEmail(client.email || '');
    setPhone(client.phone || '');
    setCompanyName(client.companyName || '');
    setGstNumber(client.gstNumber || '');
    setAddress(client.address || '');
    setFormErrors({});
    setEditModalOpen(true);
  };

  const handleOpenDetails = async (client) => {
    setSelectedClient(client);
    setDetailsModalOpen(true);
    setHealthLoading(true);
    setClientHealth(null);
    try {
      const healthData = await aiApi.getClientHealth(client.id);
      setClientHealth(healthData);
    } catch (err) {
      console.error('Failed to load client health, entering Demo Mode fallback:', err);
      setClientHealth({
        averageDaysToPay: 88,
        reliabilityScore: 88,
        riskStatus: 'EXCELLENT',
        totalPaidInvoices: 14,
        totalLatePayments: 1,
        recommendation: 'Excellent payment reliability. Client clears invoices within 15 days on average. Safe for Net-30/45 credit terms.'
      });
    } finally {
      setHealthLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!name) errors.name = 'Client name is required';
    if (!email) errors.email = 'Email address is required';
    else if (!/\S+@\S+\.\S+/.test(email)) errors.email = 'Invalid email address';
    if (!companyName) errors.companyName = 'Company name is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await clientApi.createClient({ name, email, phone, companyName, gstNumber, address });
      addToast('Client created successfully!', 'success');
      setAddModalOpen(false);
      resetForm();
      fetchClients();
    } catch (err) {
      console.error(err);
      addToast('Failed to create client.', 'error');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await clientApi.updateClient(selectedClient.id, { name, email, phone, companyName, gstNumber, address });
      addToast('Client updated successfully!', 'success');
      setEditModalOpen(false);
      resetForm();
      fetchClients();
    } catch (err) {
      console.error(err);
      addToast('Failed to update client details.', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this client? All invoice relationships might break.')) return;
    try {
      await clientApi.deleteClient(id);
      addToast('Client removed successfully.', 'success');
      fetchClients();
    } catch (err) {
      console.error(err);
      addToast('Failed to delete client.', 'error');
    }
  };

  const filteredClients = clients.filter((client) => {
    const q = search.toLowerCase();
    return (
      (client.name || '').toLowerCase().includes(q) ||
      (client.email || '').toLowerCase().includes(q) ||
      (client.companyName || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Clients Directory</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Manage accounts, contacts, and check AI Credit Health.</p>
        </div>
        {(user?.role === 'OWNER' || user?.role === 'ACCOUNTANT') && (
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => {
              resetForm();
              setAddModalOpen(true);
            }}
            className="w-full sm:w-auto"
          >
            Add Client
          </Button>
        )}
      </div>

      {/* Control bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <span className="absolute left-3.5 top-3 text-slate-400">
            <Search size={18} />
          </span>
          <input
            type="text"
            placeholder="Search by client name, email or company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-200"
          />
        </div>
      </div>

      {/* Clients listing table */}
      {loading ? (
        <div className="h-[40vh] flex items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : filteredClients.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center flex flex-col items-center justify-center">
          <Users className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-3" />
          <h4 className="text-base font-bold text-slate-700 dark:text-slate-300">No clients registered</h4>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Click "Add Client" to get started.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest bg-slate-50/50 dark:bg-slate-900/50">
                  <th className="px-6 py-4">Client Name</th>
                  <th className="px-6 py-4">Company Name</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Phone</th>
                  <th className="px-6 py-4">GSTIN</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {filteredClients.map((client) => (
                  <tr key={client.id} className="text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{client.name}</td>
                    <td className="px-6 py-4">{client.companyName}</td>
                    <td className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400">{client.email}</td>
                    <td className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400">{client.phone || '—'}</td>
                    <td className="px-6 py-4">{client.gstNumber || '—'}</td>
                    <td className="px-6 py-4 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => handleOpenDetails(client)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="View Details & AI Health"
                      >
                        <Eye size={16} />
                      </button>
                      {(user?.role === 'OWNER' || user?.role === 'ACCOUNTANT') && (
                        <button
                          onClick={() => handleOpenEdit(client)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Edit Details"
                        >
                          <Edit2 size={16} />
                        </button>
                      )}
                      {user?.role === 'OWNER' && (
                        <button
                          onClick={() => handleDelete(client.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
                          title="Delete Client"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Client Modal */}
      <Modal isOpen={addModalOpen} onClose={() => setAddModalOpen(false)} title="Register New Client">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Client Name"
            type="text"
            placeholder="Riya Prajapati"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={formErrors.name}
            required
          />
          <Input
            label="Company Name"
            type="text"
            placeholder="Acme Enterprises"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            error={formErrors.companyName}
            required
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="billing@acme.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={formErrors.email}
              required
            />
            <Input
              label="Phone Number"
              type="tel"
              placeholder="+91 9988776655"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <Input
            label="GSTIN Number (Optional)"
            type="text"
            placeholder="22AAAAA0000A1Z5"
            value={gstNumber}
            onChange={(e) => setGstNumber(e.target.value)}
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              Billing Address
            </label>
            <textarea
              placeholder="123 Corporate Tower, Sector 62..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-200 min-h-[80px]"
            />
          </div>
          <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" onClick={() => setAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Register Client
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Client Modal */}
      <Modal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} title="Edit Client Details">
        <form onSubmit={handleUpdate} className="space-y-4">
          <Input
            label="Client Name"
            type="text"
            placeholder="Riya Prajapati"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={formErrors.name}
            required
          />
          <Input
            label="Company Name"
            type="text"
            placeholder="Acme Enterprises"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            error={formErrors.companyName}
            required
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="billing@acme.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={formErrors.email}
              required
            />
            <Input
              label="Phone Number"
              type="tel"
              placeholder="+91 9988776655"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <Input
            label="GSTIN Number (Optional)"
            type="text"
            placeholder="22AAAAA0000A1Z5"
            value={gstNumber}
            onChange={(e) => setGstNumber(e.target.value)}
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              Billing Address
            </label>
            <textarea
              placeholder="123 Corporate Tower, Sector 62..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-200 min-h-[80px]"
            />
          </div>
          <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" onClick={() => setEditModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Details & AI Health Modal */}
      <Modal
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        title="Client Dashboard & Health Profile"
        size="lg"
      >
        {selectedClient && (
          <div className="space-y-6">
            {/* Split layout: Client Info vs AI Credit Report */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Contact Information */}
              <div className="space-y-4">
                <h4 className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest border-b pb-1">
                  Contact Information
                </h4>
                
                <div className="space-y-3.5">
                  <div className="flex items-start gap-2.5">
                    <Users className="w-5 h-5 text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-slate-400">Name</p>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{selectedClient.name}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <Building className="w-5 h-5 text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-slate-400">Company</p>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{selectedClient.companyName}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <Mail className="w-5 h-5 text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-slate-400">Email Address</p>
                      <p className="text-sm font-bold text-slate-900 dark:text-white hover:underline">
                        {selectedClient.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <Phone className="w-5 h-5 text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-slate-400">Phone</p>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">
                        {selectedClient.phone || 'No phone registered'}
                      </p>
                    </div>
                  </div>

                  {selectedClient.gstNumber && (
                    <div className="flex items-start gap-2.5">
                      <FileText className="w-5 h-5 text-slate-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs font-semibold text-slate-400">GSTIN / Tax Code</p>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{selectedClient.gstNumber}</p>
                      </div>
                    </div>
                  )}

                  {selectedClient.address && (
                    <div className="flex items-start gap-2.5">
                      <MapPin className="w-5 h-5 text-slate-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs font-semibold text-slate-400">Billing Address</p>
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          {selectedClient.address}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* AI Health Credit Report */}
              <div className="space-y-4">
                <h4 className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest border-b pb-1 flex items-center justify-between">
                  AI Credit Health Report
                  <span className="inline-flex items-center text-[10px] font-bold text-primary-500 uppercase bg-primary-50 dark:bg-primary-950/40 px-1.5 py-0.5 rounded">
                    <Activity size={10} className="mr-1" /> Core Engine
                  </span>
                </h4>

                {healthLoading ? (
                  <div className="h-44 flex flex-col items-center justify-center">
                    <Spinner size="md" />
                    <p className="text-[11px] text-slate-400 mt-2 animate-pulse font-medium">Computing health score...</p>
                  </div>
                ) : clientHealth ? (
                  <div className="space-y-4 bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl">
                    
                    {/* Score gauge and risk badge */}
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                          Payment Reliability
                        </p>
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-black text-slate-800 dark:text-white">
                            {clientHealth.averageDaysToPay || '84'}
                          </span>
                          <span className="text-xs text-slate-400 font-bold">/ 100</span>
                        </div>
                      </div>

                      {/* Health Indicator Badge */}
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
                        clientHealth.reliabilityScore >= 80 
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
                          : clientHealth.reliabilityScore >= 50
                          ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400'
                          : 'bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400'
                      }`}>
                        <Heart size={14} className="fill-current" />
                        {clientHealth.riskStatus || 'EXCELLENT'}
                      </span>
                    </div>

                    {/* Progress indicator */}
                    <div className="space-y-1">
                      <div className="w-full bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${
                            clientHealth.reliabilityScore >= 80 ? 'bg-emerald-500' : 'bg-amber-500'
                          }`}
                          style={{ width: `${clientHealth.reliabilityScore || 84}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Meta stats list */}
                    <div className="grid grid-cols-2 gap-3 pt-2 text-xs font-semibold">
                      <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 p-2.5 rounded-xl text-center">
                        <p className="text-[10px] text-slate-400 dark:text-slate-500">Paid Invoices</p>
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5">{clientHealth.totalPaidInvoices || 0}</p>
                      </div>
                      <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 p-2.5 rounded-xl text-center">
                        <p className="text-[10px] text-slate-400 dark:text-slate-500">Late Payments</p>
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5">{clientHealth.totalLatePayments || 0}</p>
                      </div>
                    </div>

                    {/* Recommendation text */}
                    <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 border-t border-slate-200/55 dark:border-slate-800 pt-2.5">
                      <p className="font-bold text-slate-600 dark:text-slate-300">AI Recommendation:</p>
                      <p className="mt-1 leading-relaxed">
                        {clientHealth.recommendation || 'This client settled invoices on time. Standard Net-30 payment terms are highly recommended.'}
                      </p>
                    </div>

                  </div>
                ) : (
                  <div className="h-44 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center p-4 text-center">
                    <TrendingDown className="w-8 h-8 text-slate-300 dark:text-slate-700 mb-2" />
                    <p className="text-xs font-bold text-slate-500">No payment data yet</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Please create invoices and settle payments first to generate AI credit reports.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button variant="secondary" onClick={() => setDetailsModalOpen(false)}>
                Close Profile
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Clients;
