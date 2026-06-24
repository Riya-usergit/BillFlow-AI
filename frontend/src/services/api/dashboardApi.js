import axiosInstance from './axiosInstance';

export const dashboardApi = {
  getDashboard: async () => {
    const response = await axiosInstance.get('/api/dashboard');
    return response.data;
  },
};

export default dashboardApi;
