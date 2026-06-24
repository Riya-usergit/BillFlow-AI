import axiosInstance from './axiosInstance';

export const invoiceApi = {
  getInvoices: async () => {
    const response = await axiosInstance.get('/api/invoices');
    return response.data;
  },

  getInvoice: async (id) => {
    const response = await axiosInstance.get(`/api/invoices/${id}`);
    return response.data;
  },

  createInvoice: async (invoiceData) => {
    const response = await axiosInstance.post('/api/invoices', invoiceData);
    return response.data;
  },

  sendInvoiceEmail: async (id) => {
    const response = await axiosInstance.post(`/api/invoices/${id}/send-email`);
    return response.data;
  },

  downloadInvoicePdf: async (id) => {
    const response = await axiosInstance.get(`/api/invoices/${id}/pdf`, {
      responseType: 'blob',
    });
    return response.data;
  },
};

export default invoiceApi;
