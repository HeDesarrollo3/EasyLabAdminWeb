import axios from 'axios';

export const API_BASE_URL = 'http://localhost:3000';

const api = axios.create({ baseURL: API_BASE_URL });

// Attach JWT token to every request if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('easylab_admin_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('easylab_admin_token');
      localStorage.removeItem('easylab_admin_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
