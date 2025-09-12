import axios, { AxiosInstance } from "axios";
import { store } from "../stores";
import { AuthApi } from "@/app/modules/auth/apis/authApi";
import { setTokens, clearTokens } from "../stores/authSlice";
import { redirect } from "../locales/navigation";

const api: AxiosInstance = axios.create({
  baseURL: "http://localhost:8000",
  timeout: 5000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// ---------------- Request Interceptor ----------------
// Thêm token nếu có
api.interceptors.request.use((config) => {
  const token = store.getState().auth.accessToken;
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ---------------- Response Interceptor ----------------
// Xử lý lỗi chung hoặc logout nếu 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const res = await AuthApi.refresh();
        if (res.data?.access_token) {
          store.dispatch(setTokens({ accessToken: res.data.access_token, refreshToken: "" }));
          originalRequest.headers.Authorization = `Bearer ${res.data.access_token}`;
          return api(originalRequest);
        }
      } catch (refreshErr) {
        store.dispatch(clearTokens());
        const pathname = window.location.pathname; // "/vi/private/users"
        const locale = pathname.startsWith("/en") ? "en" : "vi";
        redirect({ href: "/login", locale }); // redirect nếu refresh fail
      }
    }

    return Promise.reject(error);
  },
);

export default api;
