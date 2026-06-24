const initialClients = [
  { id: 1, name: 'Sundar Pichai', companyName: 'Google Cloud Corp', email: 'sundar@google.com', phone: '+91 9988112233', gstNumber: '07AAAAA1111A1Z1', address: 'Google Signature Towers, Gurgaon, India' },
  { id: 2, name: 'Patrick Collison', companyName: 'Stripe Payments', email: 'patrick@stripe.com', phone: '+1 415 887 2341', gstNumber: '27BBBBB2222B2Z2', address: '100 Townsend St, San Francisco, CA, USA' },
  { id: 3, name: 'Mark Zuckerberg', companyName: 'Meta Platform Inc', email: 'zuck@meta.com', phone: '+1 650 334 9901', gstNumber: '19CCCCC3333C3Z3', address: '1 Hacker Way, Menlo Park, CA, USA' },
  { id: 4, name: 'Reed Hastings', companyName: 'Netflix India', email: 'reed@netflix.com', phone: '+91 22 6677 8899', gstNumber: '29DDDDD4444D4Z4', address: 'Bandra Kurla Complex, Mumbai, India' },
];

const initialProducts = [
  { id: 1, name: 'SaaS Software Consultation', description: 'Enterprise architectural review and cloud roadmap designing.', price: 15000, taxRate: 18 },
  { id: 2, name: 'BillFlow Enterprise License', description: 'Multi-tenant invoice automation core system license.', price: 120000, taxRate: 18 },
  { id: 3, name: 'Database Optimization SLA', description: 'Monthly DBA review, profiling, index optimization support.', price: 25000, taxRate: 18 },
  { id: 4, name: 'AI Credit Scoring API (10k requests)', description: 'Access token for automated credit reliability analysis.', price: 8000, taxRate: 12 },
];

const initialInvoices = [
  { id: 5, invoiceNumber: 'INV-2026-9812', clientId: 1, clientName: 'Google Cloud Corp', issueDate: '2026-06-15', dueDate: '2026-07-15', totalAmount: 45000, status: 'UNPAID', items: [{ productId: 1, productName: 'SaaS Software Consultation', quantity: 3, unitPrice: 15000, amount: 45000 }] },
  { id: 4, invoiceNumber: 'INV-2026-4432', clientId: 2, clientName: 'Stripe Payments', issueDate: '2026-05-30', dueDate: '2026-06-30', totalAmount: 125000, status: 'PAID', items: [{ productId: 2, productName: 'BillFlow Enterprise License', quantity: 1, unitPrice: 120000, amount: 120000 }] },
  { id: 3, invoiceNumber: 'INV-2026-1029', clientId: 3, clientName: 'Meta Platform Inc', issueDate: '2026-05-25', dueDate: '2026-06-25', totalAmount: 35000, status: 'PARTIAL', items: [{ productId: 1, productName: 'SaaS Software Consultation', quantity: 2, unitPrice: 15000, amount: 30000 }, { productId: 4, productName: 'AI Credit Scoring API (10k requests)', quantity: 1, unitPrice: 5000, amount: 5000 }] },
  { id: 2, invoiceNumber: 'INV-2026-8876', clientId: 4, clientName: 'Netflix India', issueDate: '2026-05-10', dueDate: '2026-06-10', totalAmount: 20000, status: 'OVERDUE', items: [{ productId: 3, productName: 'Database Optimization SLA', quantity: 1, unitPrice: 20000, amount: 20000 }] },
  { id: 1, invoiceNumber: 'INV-2026-2311', clientId: 1, clientName: 'Google Cloud Corp', issueDate: '2026-04-20', dueDate: '2026-05-20', totalAmount: 20000, status: 'PAID', items: [{ productId: 3, productName: 'Database Optimization SLA', quantity: 1, unitPrice: 20000, amount: 20000 }] },
];

const initialPayments = [
  { id: 101, invoiceId: 3, amount: 15000, paymentMethod: 'UPI', paymentDate: '2026-06-01T10:00:00' },
  { id: 102, invoiceId: 4, amount: 125000, paymentMethod: 'NETBANKING', paymentDate: '2026-06-05T14:30:00' },
  { id: 103, invoiceId: 1, amount: 20000, paymentMethod: 'CARD', paymentDate: '2026-05-02T11:15:00' },
];

export const initStorage = () => {
  if (!localStorage.getItem('bf_clients')) {
    localStorage.setItem('bf_clients', JSON.stringify(initialClients));
  }
  if (!localStorage.getItem('bf_products')) {
    localStorage.setItem('bf_products', JSON.stringify(initialProducts));
  }
  if (!localStorage.getItem('bf_invoices')) {
    localStorage.setItem('bf_invoices', JSON.stringify(initialInvoices));
  }
  if (!localStorage.getItem('bf_payments')) {
    localStorage.setItem('bf_payments', JSON.stringify(initialPayments));
  }
};

export const getClients = () => {
  initStorage();
  return JSON.parse(localStorage.getItem('bf_clients'));
};

export const saveClients = (clients) => {
  localStorage.setItem('bf_clients', JSON.stringify(clients));
};

export const getProducts = () => {
  initStorage();
  return JSON.parse(localStorage.getItem('bf_products'));
};

export const saveProducts = (products) => {
  localStorage.setItem('bf_products', JSON.stringify(products));
};

export const getInvoices = () => {
  initStorage();
  return JSON.parse(localStorage.getItem('bf_invoices'));
};

export const saveInvoices = (invoices) => {
  localStorage.setItem('bf_invoices', JSON.stringify(invoices));
};

export const getPayments = () => {
  initStorage();
  return JSON.parse(localStorage.getItem('bf_payments'));
};

export const savePayments = (payments) => {
  localStorage.setItem('bf_payments', JSON.stringify(payments));
};
