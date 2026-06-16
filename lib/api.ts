import axios from "axios";
import { useAuthStore } from "../store/useAuthStore";
import { useTenantStore } from "../store/useTenantStore";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://localhost:7196/api/v1";

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use(
  (config) => {
    const { token } = useAuthStore.getState();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    const { activeTenantId } = useTenantStore.getState();
    if (activeTenantId) {
      config.headers.TenantId = activeTenantId;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Flag to prevent multiple redirects
let isRedirecting = false;

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !isRedirecting) {
      isRedirecting = true;
      useAuthStore.getState().logout();
      // ✅ Do NOT reload or redirect — just logout and let the UI handle it
      // Reset flag after a delay
      setTimeout(() => { isRedirecting = false; }, 3000);
    }
    return Promise.reject(error);
  }
);

export default api;