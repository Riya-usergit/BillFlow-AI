import axiosInstance from './axiosInstance';

export const authApi = {
  login: async (email, password) => {
    const response = await axiosInstance.post('/api/auth/login', { email, password });
    return response.data; // Returns { token }
  },
  
  register: async (name, email, password, companyName, role = 'OWNER') => {
    const response = await axiosInstance.post('/api/auth/register', {
      name,
      email,
      password,
      companyName,
      role,
    });
    return response.data; // Returns registration success string
  },

  getProfile: async () => {
    const response = await axiosInstance.get('/api/users/me');
    return response.data; // Returns User + Tenant details
  },
};

export default authApi;
