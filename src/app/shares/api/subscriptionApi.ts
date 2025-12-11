import { AxiosInstance } from "axios";
import api from "../configs/axios";
import { ApiResponse } from "../types/response";

export interface CheckLimitResponse {
  can_use: boolean;
  remaining: number;
  used: number;
  limit: number;
  is_unlimited: boolean;
  plan_name?: string | null; // Tên gói đã đăng ký (nếu có)
}

export interface SubscribeRequest {
  user_id: string;
  plan_name: "FREE" | "VIP" | "ENTERPRISE";
  duration: number; // số ngày
}

export interface SubscribeResponse {
  subscription_id: string;
  plan_name: string;
  expires_at: string;
  payment_url?: string | null; // URL thanh toán (nếu có)
}

export interface CheckPlanResponse {
  plan_name: string | null;
  is_valid: boolean;
  has_plan: boolean;
}

class SubscriptionClient {
  private readonly client: AxiosInstance;

  constructor() {
    this.client = api;
  }

  /**
   * Kiểm tra limit chẩn đoán AI
   */
  async checkAILimit(userId: string): Promise<ApiResponse<CheckLimitResponse>> {
    const response = await this.client.get<ApiResponse<CheckLimitResponse>>(
      `/hospital/subscriptions/check-ai?userId=${userId}`,
    );
    return response.data;
  }

  /**
   * Kiểm tra limit tư vấn
   */
  async checkConsultLimit(userId: string): Promise<ApiResponse<CheckLimitResponse>> {
    const response = await this.client.get<ApiResponse<CheckLimitResponse>>(
      `/hospital/subscriptions/check-consult?userId=${userId}`,
    );
    return response.data;
  }

  /**
   * Đăng ký gói subscription
   */
  async subscribe(data: SubscribeRequest): Promise<ApiResponse<SubscribeResponse>> {
    const response = await this.client.post<ApiResponse<SubscribeResponse>>(
      "/hospital/subscriptions/subscribe",
      data,
    );
    return response.data;
  }

  /**
   * Kiểm tra gói subscription của user
   */
  async checkPlan(userId: string): Promise<ApiResponse<CheckPlanResponse>> {
    const response = await this.client.get<ApiResponse<CheckPlanResponse>>(
      `/hospital/subscriptions/check-plan?userId=${userId}`,
    );
    return response.data;
  }
}

const SubscriptionApi = new SubscriptionClient();
export { SubscriptionApi };
