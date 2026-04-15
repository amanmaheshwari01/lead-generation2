import axios from "axios";

// ============================================
// Centralized Axios Instance — Production Grade
// ============================================
// All API calls go through this single instance.
// Token injection, error handling, and base URL
// are configured once here.

const api = axios.create({
  baseURL: "/api",
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ── Request Interceptor ─────────────────────
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor ────────────────────
// Handles 401 (expired/invalid token) globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid — clear and redirect to login
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        window.location.href = "/";
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// ============================================
// API Service Functions
// ============================================

// ── Auth ────────────────────────────────────
export const authAPI = {
  login: (email, password) =>
    api.post("/user/login", { email, password }),
};

// ── User Profile ────────────────────────────
export const userAPI = {
  getProfile: () => api.get("/user/profile"),
  updateProfile: (data) => api.put("/user/profile", data),
};

// ── Leads (Employee & Admin) ────────────────
export const leadsAPI = {
  getMyLeads: () => api.get("/employee/myLeads"),
  createLead: (data) => api.post("/employee/createNewLead", data),
  updateStatus: (leadId, status) =>
    api.patch(`/employee/leads/${leadId}/status`, { status }),
};
