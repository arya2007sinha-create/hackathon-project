import axios from 'axios';

const PROD_API_URL = 'https://hackathon-project-dux3.onrender.com/api';

const getBaseUrl = (): string => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  if (
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ) {
    return '/api';
  }
  return PROD_API_URL;
};

export const apiClient = axios.create({
  baseURL: getBaseUrl(),
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
