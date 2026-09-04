import axios from 'axios';

const formatApiBase = () => {
  let url = (import.meta.env.VITE_API_URL || '').trim();

  // If unset, default to local development backend
  if (!url) {
    return 'http://127.0.0.1:8000/api';
  }

  // Remove trailing slashes
  url = url.replace(/\/+$/, '');

  // If protocol is missing (e.g. Render property: host returns just "host.onrender.com")
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    if (url.startsWith('localhost') || url.startsWith('127.0.0.1')) {
      url = `http://${url}`;
    } else {
      url = `https://${url}`;
    }
  }

  // Ensure /api is at the end
  return url.endsWith('/api') ? url : `${url}/api`;
};

const api = axios.create({
  baseURL: formatApiBase(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Interceptor to handle 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const url = error.config?.url || '';
      // Don't auto-logout on failed login/register attempts
      if (!url.includes('/auth/login') && !url.includes('/auth/register')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.dispatchEvent(new Event('auth-unauthorized'));
      }
    }
    return Promise.reject(error);
  }
);

export default api;
