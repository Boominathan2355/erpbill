/* src/utils/api.ts */
import axios from 'axios';
import { readStringStorage } from './browserStorage';

const api = axios.create({
  baseURL: import.meta.env.DEV ? 'http://localhost:5000/api' : 'https://erpbill.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Token
api.interceptors.request.use(
  (config) => {
    const token = readStringStorage('auth_token', '');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle Global Errors (like 401)
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid
      // We could trigger a logout here if we had access to the store, 
      // but we'll handle it in the components/stores for now to avoid circular deps.
      console.error('Session expired. Please login again.');
    }
    return Promise.reject(error);
  }
);

export default api;
