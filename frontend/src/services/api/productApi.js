import axiosInstance from './axiosInstance';

export const productApi = {
  getProducts: async () => {
    const response = await axiosInstance.get('/api/products');
    return response.data;
  },

  getProduct: async (id) => {
    const response = await axiosInstance.get(`/api/products/${id}`);
    return response.data;
  },

  createProduct: async (productData) => {
    const response = await axiosInstance.post('/api/products', productData);
    return response.data;
  },

  updateProduct: async (id, productData) => {
    const response = await axiosInstance.put(`/api/products/${id}`, productData);
    return response.data;
  },

  deleteProduct: async (id) => {
    const response = await axiosInstance.delete(`/api/products/${id}`);
    return response.data;
  },
};

export default productApi;
