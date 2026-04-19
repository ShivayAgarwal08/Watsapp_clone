import axios from 'axios';

const api = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api`,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) { // Fixed: using "token" key directly from localStorage
    config.headers.Authorization = `Bearer ${token}`; 
  }
  return config;
});

export default api;
