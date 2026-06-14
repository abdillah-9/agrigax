import axios from "axios";
import { AUTH } from "./endpoints";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

const PUBLIC_AUTH_PATHS = [
  AUTH.LOGIN,
  AUTH.REGISTER,
  AUTH.FORGOT_PASSWORD,
  AUTH.RESEND_OTP,
  AUTH.VERIFY_OTP,
  AUTH.RESET_PASSWORD,
  AUTH.REFRESH,
];

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

const isPublicAuthRequest = (url?: string) => {
  if (!url) return false;
  return PUBLIC_AUTH_PATHS.some((path) => url.includes(path));
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isPublicAuthRequest(originalRequest.url)
    ) {
      originalRequest._retry = true;

      try {
        await api.post(AUTH.REFRESH);
        return api(originalRequest);
      } catch {
        if (!window.location.pathname.startsWith("/login")) {
          window.location.href = "/login";
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;
