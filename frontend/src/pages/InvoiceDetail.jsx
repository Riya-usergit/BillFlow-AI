import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import invoiceApi from '../services/api/invoiceApi';
import paymentApi from '../services/api/paymentApi';
import aiApi from '../services/api/aiApi';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import Input from '../components/Input';
import Modal from '../components/Modal';
import Spinner from '../components/Spinner';
import StatusBadge from '../components/StatusBadge';
import {
  ArrowLeft,
  Download,
  Mail,
  Send,
  Cpu,
  ShieldAlert,
  Calendar,
  Layers,
  Clock,
  Plus,
  CreditCard,
  History,
  FileCheck2
} from 'lucide-react';

export const InvoiceDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { addToast } = useToast();
  const [invoice, setInvoice] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  // AI Predict states
  const [riskData, setRiskData] = useState(null);
  const [riskLoading, setRiskLoading] = useState(false);

  // Recording payment modal states
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('UPI');
  const [submittingPayment, setSubmittingPayment] = useState(false);

  // PDF action states
  const [pdfDownloading, setPdfDownloading] = useState(false);
  const [emailSending, setEmailSending] = useState(false);
  const [reminderSending, setReminderSending] = useState(false);

  const fetchInvoiceDetails = async () => {
    try {
      setLoading(true);
      const [invoiceData, paymentsData] = await Promise.all([
        invoiceApi.getInvoice(id),
        paymentApi.getPayments(),
      ]);

      setInvoice(invoiceData);
      
      const invoicePayments = (paymentsData || []).filter(
        (p) => p.invoice && p.invoice.id === Number(id)
      );
      setPayments(invoicePayments);
    } catch (err) {
      console.error('Failed to load invoice details:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAiRisk = async () => {
    try {
      setRiskLoading(true);
      const data = await aiApi.predictInvoiceRisk(id);
      setRiskData(data);
    } catch (err) {
      console.error('Failed to compute late risk:', err);
    } finally {
      setRiskLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoiceDetails();
    fetchAiRisk();
  }, [id]);

  // Calculate remaining balance
  const totalPaid = payments.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const totalAmount = invoice?.totalAmount || 0;
  const remainingBalance = Math.max(0, totalAmount - totalPaid);

  const handleDownloadPdf = async () => {
    try {
      setPdfDownloading(true);
      const blob = await invoiceApi.downloadInvoicePdf(id);
      
      // Create local file URL
      const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${invoice?.invoiceNumber || id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      addToast('PDF download started.', 'success');
    } catch (err) {
      console.error(err);
      addToast('Failed to generate PDF download.', 'error');
    } finally {
      setPdfDownloading(false);
    }
  };

  const handleSendEmail = async () => {
    try {
      setEmailSending(true);
      await invoiceApi.sendInvoiceEmail(id);
      addToast('Invoice email sent to client successfully!', 'success');
    } catch (err) {
      console.error(err);
      addToast('Failed to send invoice email.', 'error');
    } finally {
      setEmailSending(false);
    }
  };

  const handleSendAiReminder = async () => {
    try {
      setReminderSending(true);
      const data = await aiApi.sendReminder(id);
      addToast(data?.message || 'Smart AI payment reminder sent to client!', 'success');
    } catch (err) {
      console.error(err);
      addToast('Failed to send AI reminder.', 'error');
    } finally {
      setReminderSending(false);
    }
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    const amountNum = Number(payAmount);
    if (!payAmount || isNaN(amountNum) || amountNum <= 0) {
      addToast('Please enter a valid positive payment amount.', 'warning');
      return;
    }
    if (amountNum > remainingBalance) {
      addToast(`Payment amount cannot exceed outstanding balance of ₹${remainingBalance.toLocaleString()}`, 'warning');
      return;
    }

    try {
      setSubmittingPayment(true);
      await paymentApi.createPayment({
        invoiceId: Number(id),
        amount: amountNum,
        paymentMethod: payMethod,
      });

      addToast('Payment recorded successfully!', 'success');
      setPayModalOpen(false);
      setPayAmount('');
      fetchInvoiceDetails();
    } catch (err) {
      console.error(err);
      addToast('Failed to record payment.', 'error');
    } finally {
      setSubmittingPayment(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[70vh] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="text-center p-12 space-y-4">
        <h3 className="text-base font-bold text-slate-700 dark:text-slate-350">Invoice not found</h3>
        <Link to="/invoices">
          <Button variant="primary">Back to registry</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header navigations */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/invoices"
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Invoice #{invoice.invoiceNumber}</h2>
              <StatusBadge status={invoice.status} />
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Manage details, collections, and run prediction analysis.</p>
          </div>
        </div>

        {/* Action button bar */}
        <div className="flex flex-wrap gap-2">
          {remainingBalance > 0 && (user?.role === 'OWNER' || user?.role === 'ACCOUNTANT') && (
            <Button
              variant="primary"
              icon={Plus}
              onClick={() => setPayModalOpen(true)}
            >
              Record Payment
            </Button>
          )}
          <Button variant="outline" icon={Download} onClick={handleDownloadPdf} loading={pdfDownloading}>
            Download PDF
          </Button>
          {(user?.role === 'OWNER' || user?.role === 'ACCOUNTANT') && (
            <>
              <Button variant="outline" icon={Mail} onClick={handleSendEmail} loading={emailSending}>
                Email Client
              </Button>
              <Button variant="outline" icon={Send} onClick={handleSendAiReminder} loading={reminderSending}>
                AI Reminder
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Core Invoice Summary (Left 2 columns) */}
        <div className="xl:col-span-2 space-y-6">
          {/* Billing Slip Details */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 md:p-6 shadow-sm space-y-6">
            <div className="flex justify-between items-start pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <p className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Client Name</p>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">{invoice.clientName || 'Acme Buyer'}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Billed client registered in workspace</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Grand Total</p>
                <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1">₹{totalAmount.toLocaleString()}</h3>
              </div>
            </div>

            {/* Line items table */}
            <div className="space-y-3">
              <h4 className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1.5 pb-1 border-b border-slate-50 dark:border-slate-800">
                <Layers size={14} /> Itemized Breakdown
              </h4>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider py-2">
                      <th className="py-2 font-bold">Item / Description</th>
                      <th className="py-2 text-center">Quantity</th>
                      <th className="py-2 text-right">Unit Price</th>
                      <th className="py-2 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                    {(invoice.items || []).map((item, idx) => (
                      <tr key={idx} className="text-slate-700 dark:text-slate-300 font-semibold">
                        <td className="py-3 font-bold text-slate-900 dark:text-white">{item.productName}</td>
                        <td className="py-3 text-center">{item.quantity}</td>
                        <td className="py-3 text-right">₹{(item.unitPrice || 0).toLocaleString()}</td>
                        <td className="py-3 text-right font-bold text-slate-900 dark:text-white">₹{(item.amount || 0).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Totals Summary */}
            <div className="flex flex-col items-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs font-semibold">
              <div className="flex justify-between w-64 text-slate-500 dark:text-slate-400">
                <span>Subtotal Collected:</span>
                <span>₹{totalAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between w-64 text-slate-500 dark:text-slate-400">
                <span>Taxes Included:</span>
                <span>GST Configured</span>
              </div>
              <div className="flex justify-between w-64 text-sm font-bold text-slate-900 dark:text-white border-t border-dashed dark:border-slate-800 pt-2 mt-1">
                <span>Total Amount Due:</span>
                <span>₹{totalAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Payment Collection Logs */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 md:p-6 shadow-sm space-y-4">
            <h4 className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1.5 border-b pb-2">
              <History size={14} /> Payments History
            </h4>

            {payments.length === 0 ? (
              <div className="py-6 text-center">
                <CreditCard className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto mb-1.5" />
                <p className="text-xs text-slate-500 font-bold">No payments recorded for this invoice.</p>
                <p className="text-[10px] text-slate-400">Record a payment above to modify this log.</p>
              </div>
            ) : (
              <div className="overflow-x-auto text-xs font-semibold">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase">
                      <th className="pb-2">Date Recorded</th>
                      <th className="pb-2">Payment Method</th>
                      <th className="pb-2 text-right">Amount Paid</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {payments.map((p) => (
                      <tr key={p.id} className="text-slate-700 dark:text-slate-300">
                        <td className="py-2.5">
                          {p.paymentDate ? p.paymentDate.split('T')[0] : 'N/A'}
                        </td>
                        <td className="py-2.5">
                          <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-[10px] uppercase font-bold text-slate-600 dark:text-slate-400">
                            {p.paymentMethod}
                          </span>
                        </td>
                        <td className="py-2.5 text-right font-bold text-slate-900 dark:text-white">
                          ₹{p.amount.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* AI Analytics & Outstanding balance (Right column) */}
        <div className="space-y-6">
          {/* Outstanding Balance Tracking Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
            <h4 className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest border-b pb-2">
              Collections Progress
            </h4>
            
            <div className="space-y-3.5">
              <div className="flex justify-between items-baseline text-xs font-semibold">
                <span className="text-slate-400">Outstanding Balance</span>
                <span className="text-lg font-black text-rose-600 dark:text-rose-400">₹{remainingBalance.toLocaleString()}</span>
              </div>

              {/* Progress gauge */}
              <div className="space-y-1">
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-700"
                    style={{ width: `${(totalPaid / (totalAmount || 1)) * 100}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 font-bold">
                  <span>₹{totalPaid.toLocaleString()} paid</span>
                  <span>{Math.round((totalPaid / (totalAmount || 1)) * 100)}% settled</span>
                </div>
              </div>
            </div>
          </div>

          {/* AI Risk Gauge Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
            <h4 className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest border-b pb-2 flex items-center justify-between">
              AI Payment Late Prediction
              <span className="inline-flex items-center text-[10px] font-bold text-primary-500 uppercase bg-primary-50 dark:bg-primary-950/40 px-1.5 py-0.5 rounded">
                <Cpu size={10} className="mr-1" /> ML Engine
              </span>
            </h4>

            {riskLoading ? (
              <div className="h-32 flex flex-col items-center justify-center">
                <Spinner size="md" />
                <p className="text-[10px] text-slate-400 mt-2 animate-pulse font-medium">Predicting late payment risk...</p>
              </div>
            ) : riskData ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Late Settlement Risk</p>
                    <h3 className={`text-2xl font-black ${
                      riskData.riskScore >= 70 ? 'text-rose-600' : riskData.riskScore >= 40 ? 'text-amber-500' : 'text-emerald-500'
                    }`}>
                      {riskData.riskScore}%
                    </h3>
                  </div>
                  <div className={`p-2 rounded-xl ${
                    riskData.riskScore >= 50 
                      ? 'bg-rose-50 dark:bg-rose-950/20 text-rose-600' 
                      : 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600'
                  }`}>
                    <ShieldAlert size={20} />
                  </div>
                </div>

                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      riskData.riskScore >= 70 ? 'bg-rose-500' : riskData.riskScore >= 40 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${riskData.riskScore}%` }}
                  ></div>
                </div>

                <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-3">
                  <span className="font-extrabold text-slate-700 dark:text-slate-300">Insight:</span> {riskData.predictionMessage || 'The client credit health and outstanding invoices suggest a high probability of timely settlement.'}
                </p>
              </div>
            ) : (
              <div className="h-32 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center p-4 text-center">
                <FileCheck2 className="w-8 h-8 text-slate-300 dark:text-slate-700 mb-1" />
                <p className="text-[10px] text-slate-400 font-medium">Predictive model needs more payment logs to run client analysis.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Record Payment Modal */}
      <Modal isOpen={payModalOpen} onClose={() => setPayModalOpen(false)} title="Record Invoice Payment Slip">
        <form onSubmit={handleRecordPayment} className="space-y-4">
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 font-semibold">
              Outstanding invoice balance: <span className="font-bold text-slate-900 dark:text-white">₹{remainingBalance.toLocaleString()}</span>
            </p>
            <Input
              label="Amount Paid (₹)"
              type="text"
              placeholder={remainingBalance.toString()}
              value={payAmount}
              onChange={(e) => setPayAmount(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              Payment Method
            </label>
            <select
              value={payMethod}
              onChange={(e) => setPayMethod(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="UPI">UPI (GooglePay / PhonePe / Paytm)</option>
              <option value="CARD">Credit / Debit Card</option>
              <option value="NETBANKING">Net Banking</option>
              <option value="CASH">Cash / Bank Transfer</option>
            </select>
          </div>

          <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" onClick={() => setPayModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submittingPayment}>
              Record Payment
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default InvoiceDetail;
