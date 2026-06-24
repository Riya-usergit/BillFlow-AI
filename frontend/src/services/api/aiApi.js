import axiosInstance from './axiosInstance';

export const aiApi = {
  getClientHealth: async (clientId) => {
    const response = await axiosInstance.get(`/api/ai/client-health/${clientId}`);
    const data = response.data;

    // Normalize for UI consumption
    return {
      averageDaysToPay: data.averageDelayDays || 0,
      reliabilityScore: data.healthScore !== undefined ? data.healthScore : (data.healthScore || 100),
      riskStatus: data.riskLevel || 'LOW',
      totalRevenue: data.totalRevenue || 0,
      outstandingAmount: data.outstandingAmount || 0,
      totalPaidInvoices: data.totalPaidInvoices || 0,
      totalLatePayments: data.totalLatePayments || 0,
      recommendation: data.recommendation || 'Safe payment history. Standard term terms are approved.',
    };
  },

  predictLatePayment: async (invoiceAmount, daysToPay) => {
    const response = await axiosInstance.post('/api/ai/predict', { invoiceAmount, daysToPay });
    return response.data;
  },

  sendReminder: async (invoiceId) => {
    const response = await axiosInstance.post(`/api/ai/send-reminder/${invoiceId}`);
    return response.data;
  },

  predictInvoiceRisk: async (invoiceId) => {
    const response = await axiosInstance.get(`/api/ai/predict-invoice/${invoiceId}`);
    const data = response.data;

    // Normalize response keys for the details screen
    const probPercent = Math.round((data.latePaymentProbability || 0) * 100);
    return {
      riskScore: probPercent,
      predictionMessage: `Risk Level: ${data.riskLevel || 'LOW'}. Recommended Action: ${data.recommendedAction || 'Monitor Payment'}. Late payment chance is estimated at ${probPercent}%.`,
    };
  },

  exportTrainingData: async () => {
    const response = await axiosInstance.get('/api/ai/export-training-data');
    return response.data;
  },
};

export default aiApi;
