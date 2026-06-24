import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import clientApi from '../services/api/clientApi';
import productApi from '../services/api/productApi';
import invoiceApi from '../services/api/invoiceApi';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import Input from '../components/Input';
import Spinner from '../components/Spinner';
import {
  ArrowLeft,
  Plus,
  Trash2,
  FileText,
  Calendar,
  Layers,
  Calculator
} from 'lucide-react';

export const CreateInvoice = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  // Master lists
  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);
  const [loadingLists, setLoadingLists] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form states
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [clientId, setClientId] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [items, setItems] = useState([{ productId: '', quantity: 1 }]);

  useEffect(() => {
    const loadMasterData = async () => {
      try {
        setLoadingLists(true);
        const [clientsData, productsData] = await Promise.all([
          clientApi.getClients(),
          productApi.getProducts(),
        ]);
        setClients(clientsData || []);
        setProducts(productsData || []);

        // Prepopulate dates
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        const formattedToday = `${yyyy}-${mm}-${dd}`;
        setIssueDate(formattedToday);

        // Due date: +30 days
        const thirtyDaysLater = new Date();
        thirtyDaysLater.setDate(today.getDate() + 30);
        const tyyyy = thirtyDaysLater.getFullYear();
        const tmm = String(thirtyDaysLater.getMonth() + 1).padStart(2, '0');
        const tdd = String(thirtyDaysLater.getDate()).padStart(2, '0');
        setDueDate(`${tyyyy}-${tmm}-${tdd}`);

        // Auto-generate invoice number
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        setInvoiceNumber(`INV-${yyyy}-${randomNum}`);
      } catch (err) {
        console.error(err);
        addToast('Failed to load clients or products registries.', 'error');
      } finally {
        setLoadingLists(false);
      }
    };
    loadMasterData();
  }, []);

  const handleAddItemRow = () => {
    setItems([...items, { productId: '', quantity: 1 }]);
  };

  const handleRemoveItemRow = (index) => {
    if (items.length === 1) {
      addToast('Invoice must contain at least 1 item.', 'warning');
      return;
    }
    setItems(items.filter((_, idx) => idx !== index));
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  };

  // Calculations
  const calculateTotals = () => {
    let subtotal = 0;
    let taxAmount = 0;

    items.forEach((item) => {
      const product = products.find((p) => p.id === Number(item.productId));
      if (product) {
        const linePrice = product.price || 0;
        const lineQty = Number(item.quantity) || 0;
        const lineTaxRate = product.taxRate || 0;

        const base = linePrice * lineQty;
        const tax = base * (lineTaxRate / 100);

        subtotal += base;
        taxAmount += tax;
      }
    });

    return {
      subtotal,
      taxAmount,
      total: subtotal + taxAmount,
    };
  };

  const totals = calculateTotals();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!clientId) {
      addToast('Please select a client.', 'warning');
      return;
    }

    const invalidItems = items.some((item) => !item.productId || Number(item.quantity) <= 0);
    if (invalidItems) {
      addToast('Please select a product and positive quantity for all rows.', 'warning');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        clientId: Number(clientId),
        invoiceNumber,
        issueDate,
        dueDate,
        items: items.map((item) => ({
          productId: Number(item.productId),
          quantity: Number(item.quantity),
        })),
      };

      await invoiceApi.createInvoice(payload);
      addToast('Invoice generated successfully!', 'success');
      navigate('/invoices');
    } catch (err) {
      console.error(err);
      addToast(err.response?.data?.message || 'Failed to create invoice.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loadingLists) {
    return (
      <div className="h-[70vh] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const selectedClientObject = clients.find((c) => c.id === Number(clientId));

  return (
    <div className="space-y-6">
      {/* Header breadcrumb */}
      <div className="flex items-center gap-3">
        <Link
          to="/invoices"
          className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800"
        >
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Create New Invoice</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Generate detailed client billing slips.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* Dynamic Builder Side */}
        <div className="xl:col-span-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 md:p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Master Details: Client and Invoice Code */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  Bill To (Client)
                </label>
                <select
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-200 cursor-pointer font-semibold"
                  required
                >
                  <option value="">Select a Client</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.companyName} ({c.name})
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="Invoice Number"
                type="text"
                placeholder="INV-XXXX"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                required
              />
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Issue Date"
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                required
              />
              <Input
                label="Due Date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
              />
            </div>

            {/* Product items rows */}
            <div className="space-y-3.5">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <h4 className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                  <Layers size={14} /> Line Items
                </h4>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  icon={Plus}
                  onClick={handleAddItemRow}
                >
                  Add Row
                </Button>
              </div>

              <div className="space-y-3">
                {items.map((item, idx) => {
                  const selectedProd = products.find((p) => p.id === Number(item.productId));
                  const rate = selectedProd ? selectedProd.price : 0;
                  const tax = selectedProd ? selectedProd.taxRate : 0;
                  return (
                    <div key={idx} className="flex flex-col md:flex-row gap-3 items-end bg-slate-50/50 dark:bg-slate-950/20 p-3 rounded-2xl border border-slate-200/40 dark:border-slate-800/50 relative">
                      {/* Product Selector */}
                      <div className="flex-1 w-full flex flex-col gap-1.5">
                        <label className="text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                          Select Product
                        </label>
                        <select
                          value={item.productId}
                          onChange={(e) => handleItemChange(idx, 'productId', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
                          required
                        >
                          <option value="">Choose item</option>
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} (₹{p.price})
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Quantity */}
                      <div className="w-full md:w-24">
                        <Input
                          label="Qty"
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                          className="px-2"
                          required
                        />
                      </div>

                      {/* Rate summary */}
                      <div className="w-full md:w-28 text-left md:text-center text-xs font-semibold pb-3">
                        <p className="text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Rate</p>
                        <p className="text-slate-800 dark:text-slate-300 mt-1">₹{rate.toLocaleString()} <span className="text-[10px] text-slate-400">+{tax}%</span></p>
                      </div>

                      {/* Line total amount */}
                      <div className="w-full md:w-28 text-left md:text-right text-xs font-semibold pb-3">
                        <p className="text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Amount</p>
                        <p className="text-slate-900 dark:text-white font-bold mt-1">₹{(rate * item.quantity).toLocaleString()}</p>
                      </div>

                      {/* Delete Action */}
                      <button
                        type="button"
                        onClick={() => handleRemoveItemRow(idx)}
                        className="p-2 mb-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 cursor-pointer self-center md:self-auto"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Calculations Summary */}
            <div className="flex flex-col items-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs font-semibold">
              <div className="flex justify-between w-64 text-slate-500 dark:text-slate-400">
                <span>Subtotal:</span>
                <span>₹{totals.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between w-64 text-slate-500 dark:text-slate-400">
                <span>GST Tax:</span>
                <span>₹{totals.taxAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between w-64 text-sm font-bold text-slate-800 dark:text-white border-t border-dashed dark:border-slate-800 pt-2 mt-1">
                <span>Total Amount:</span>
                <span>₹{totals.total.toLocaleString()}</span>
              </div>
            </div>

            {/* Form actions */}
            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <Link to="/invoices">
                <Button variant="outline">Cancel</Button>
              </Link>
              <Button type="submit" variant="primary" loading={saving}>
                Create & Save Invoice
              </Button>
            </div>
          </form>
        </div>

        {/* Live Preview Side */}
        <div className="xl:col-span-2 space-y-4">
          <h4 className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
            <Calculator size={14} /> Live Invoice Preview
          </h4>

          {/* Preview Panel (Invoice Design) */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-lg relative overflow-hidden text-xs">
            {/* Decorative banner */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-600 to-indigo-500"></div>

            {/* Header company */}
            <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase">
                  {user?.tenant?.companyName || 'BILLFLOW CLIENT'}
                </h3>
                <p className="text-[10px] text-slate-400 font-semibold">{user?.email || 'billing@billflow.ai'}</p>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center text-[10px] font-bold text-primary-500 uppercase bg-primary-50 dark:bg-primary-950/45 px-1.5 py-0.5 rounded">
                  {invoiceNumber || 'INV-TEMP'}
                </span>
                <p className="text-[10px] text-slate-400 mt-1 font-semibold">DRAFT STATUS</p>
              </div>
            </div>

            {/* Billing addresses */}
            <div className="grid grid-cols-2 gap-4 py-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-extrabold">Bill To</p>
                {selectedClientObject ? (
                  <div className="mt-1 font-semibold space-y-0.5">
                    <p className="text-slate-800 dark:text-slate-200 font-bold">{selectedClientObject.companyName}</p>
                    <p className="text-slate-500 dark:text-slate-400">{selectedClientObject.name}</p>
                    <p className="text-slate-500 dark:text-slate-400">{selectedClientObject.email}</p>
                    {selectedClientObject.gstNumber && <p className="text-[10px] text-slate-400 font-bold">GSTIN: {selectedClientObject.gstNumber}</p>}
                  </div>
                ) : (
                  <p className="text-slate-400 mt-1 italic">No client selected.</p>
                )}
              </div>
              <div className="text-right space-y-1">
                <div>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-extrabold">Date Issued</p>
                  <p className="font-semibold text-slate-800 dark:text-slate-300">{issueDate || '—'}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-extrabold">Due Date</p>
                  <p className="font-semibold text-slate-800 dark:text-slate-300">{dueDate || '—'}</p>
                </div>
              </div>
            </div>

            {/* Items summary */}
            <div className="py-4 space-y-2 border-b border-slate-100 dark:border-slate-800">
              <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-extrabold">Line Items</p>
              
              <div className="space-y-1">
                {items.map((item, idx) => {
                  const product = products.find((p) => p.id === Number(item.productId));
                  if (!product) return null;
                  return (
                    <div key={idx} className="flex justify-between items-center text-slate-700 dark:text-slate-300 py-1 font-semibold">
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">{product.name}</p>
                        <p className="text-[10px] text-slate-400 font-medium">{item.quantity} Qty • ₹{product.price} each</p>
                      </div>
                      <span className="font-bold text-slate-900 dark:text-white">₹{(product.price * item.quantity).toLocaleString()}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Calculation summary */}
            <div className="flex flex-col items-end gap-1.5 pt-4 text-xs font-semibold">
              <div className="flex justify-between w-full text-slate-400 dark:text-slate-400">
                <span>Subtotal:</span>
                <span>₹{totals.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between w-full text-slate-400 dark:text-slate-400">
                <span>GST Tax (calculated):</span>
                <span>₹{totals.taxAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between w-full text-sm font-bold text-slate-900 dark:text-white border-t border-dashed dark:border-slate-800 pt-2 mt-1">
                <span>Total Amount:</span>
                <span>₹{totals.total.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateInvoice;
