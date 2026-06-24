import axiosInstance from './axiosInstance';

export const clientApi = {
  getClients: async () => {
    const response = await axiosInstance.get('/api/clients');
    return response.data;
  },

  getClient: async (id) => {
    const response = await axiosInstance.get(`/api/clients/${id}`);
    return response.data;
  },

  createClient: async (clientData) => {
    const response = await axiosInstance.post('/api/clients', clientData);
    return response.data;
  },

  updateClient: async (id, clientData) => {
    const response = await axiosInstance.put(`/api/clients/${id}`, clientData);
    return response.data;
  },

  deleteClient: async (id) => {
    const response = await axiosInstance.delete(`/api/clients/${id}`);
    return response.data;
  },
};

export default clientApi;
