// src/shares/apis/refreshToken.ts
import axios from "axios";
import type { SuccessResponse, TokenResponse } from "@/app/modules/auth/apis/authApi";

// tạo 1 axios instance "raw" (không interceptor) để tránh loop
const rawAxios = axios.create({
  baseURL: "http://localhost:8000",
  timeout: 5000,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

export async function refreshToken() {
  const res = await rawAxios.post<SuccessResponse<TokenResponse>>("/public/refresh");
  return res.data;
}
