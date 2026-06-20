import axios from "axios";

const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// Public API instance (no auth interceptors)
export const publicApi = axios.create({
  baseURL,
  withCredentials: true,
});

// Authenticated API instance
export const api = axios.create({
  baseURL,
  withCredentials: true,
});

// Request Interceptor
api.interceptors.request.use((config) => {
  // Access token is dynamically attached in useAuth context logic, 
  // but we can also set the CSRF token globally if needed.
  return config;
});

// Error handling helper (Toast replacement - to be implemented in UI layer usually, 
// but we'll return rejected promises to let TanStack Query handle it)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // 401 handling is primarily done in useAuth.tsx where we have the refresh loop
    return Promise.reject(error);
  }
);
