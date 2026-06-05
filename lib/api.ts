import axios from "axios";
import { useAuthStore } from "../store/useAuthStore";
import { useTenantStore } from "../store/useTenantStore"; // ✅

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

    // ✅ Read from useTenantStore now
    const { activeTenantId } = useTenantStore.getState();
    if (activeTenantId) {
      config.headers.TenantId = activeTenantId;
    }

//     // AFTER
// const { activeIdentifier } = useTenantStore.getState();
// if (activeIdentifier) {
//   config.headers.TenantId = activeIdentifier;
// }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;