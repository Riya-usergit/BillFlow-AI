import axiosInstance from './axiosInstance';

export const paymentApi = {
  getPayments: async () => {
    const response = await axiosInstance.get('/api/payments');
    return response.data;
  },

  createPayment: async (paymentData) => {
    const response = await axiosInstance.post('/api/payments', paymentData);
    return response.data;
  },
};

export default paymentApi;
