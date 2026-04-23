import axios from "axios";

// ============================================
// Centralized Axios Instance — 100% Cookie Base
// ============================================

const api = axios.create({
  baseURL: "/api",
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Crucial for sending/receiving HttpOnly cookies
});

// Variables to handle silent refresh logic
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

// ── Response Interceptor ────────────────────
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized errors (Access Token expired)
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => api(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Simple cookie-only refresh via the existing proxy
        await api.post("/user/refresh", {}, { _retry: true });
        
        // Add a tiny delay to ensure browser cookie synchronization
        await new Promise(resolve => setTimeout(resolve, 300));
        
        processQueue(null);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        // If refresh fails, the session is dead
        if (typeof window !== "undefined") {
          window.location.href = "/";
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;

// ============================================
// API Service Functions
// ============================================

export const authAPI = {
  login: (email, password) =>
    api.post("/user/login", { email, password }),
  refresh: () => 
    api.post("/user/refresh"),
  logout: () =>
    api.post("/user/logout").finally(() => {
      if (typeof window !== "undefined") {
        // Full cleanup of legacy keys
        localStorage.removeItem("token");
        document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        window.location.href = "/";
      }
    }),
};

export const userAPI = {
  getProfile: () => api.get("/user/profile"),
  register: (data) => api.post("/user/register", data),
  getEmployees: () => api.get("/user/employees"),
  deleteEmployee: (id) => api.delete(`/user/employees/${id}`),
  updateProfile: (data) => api.put("/user/profile", data),
  updateShopProducts: (products) => api.put("/user/shop/products", { products }),
  updateUserRole: (id, role) => api.put(`/user/employees/${id}/role`, { role }),
};

export const leadsAPI = {
  getMyLeads: () => api.get("/employee/myLeads"),
  createLead: (data) => api.post("/employee/createNewLead", data),
};
