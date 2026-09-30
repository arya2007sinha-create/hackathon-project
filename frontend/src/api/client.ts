import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to inject JWT from localStorage
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('priora_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor to catch 401s
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Don't auto-redirect if checking me
      if (!error.config.url.includes('/auth/me')) {
        localStorage.removeItem('priora_token');
        localStorage.removeItem('priora_user');
      }
    }
    return Promise.reject(error);
  }
);
