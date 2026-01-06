import axios from 'axios';

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_BASE44_API || 'https://api.base44.io',
});

let authToken: string | null = null;

export const base44 = {
  setToken: (token: string | null) => {
    authToken = token;
  },
  auth: {
    login: async (email: string, password: string) => {
      const { data } = await api.post('/auth/login', { email, password });
      return data;
    },
    me: async () => {
      const { data } = await api.get('/auth/me', { headers: authToken ? { Authorization: `Bearer ${authToken}` } : {} });
      return data;
    },
  },
  entities: {
    Product: {
      list: async () => {
        const { data } = await api.get('/products', { headers: authToken ? { Authorization: `Bearer ${authToken}` } : {} });
        return data;
      },
    },
    Order: {
      list: async () => {
        const { data } = await api.get('/orders', { headers: authToken ? { Authorization: `Bearer ${authToken}` } : {} });
        return data;
      },
    },
  },
};

api.interceptors.request.use((config) => {
  if (authToken) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  return config;
});

export default api;
