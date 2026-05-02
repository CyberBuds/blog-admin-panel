import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';

// Assuming base URL is configured via environment variables
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:7196/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  // headers: {
  //   'Content-Type': 'application/json',
  //},
});

// Request interceptor to add token and tenantId
api.interceptors.request.use(
  (config) => {
    const { token, activeTenantId } = useAuthStore.getState();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (activeTenantId) {
      config.headers.TenantId = activeTenantId;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle unauthenticated responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth on 401
      useAuthStore.getState().logout();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
