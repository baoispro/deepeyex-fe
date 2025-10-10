import { AxiosInstance } from "axios";
import api from "../configs/axios";

const endpoint = "/hospital/orders";
// ---------------- ENUM ----------------
export type OrderStatus = "PENDING" | "PAID" | "CANCELED" | "DELIVERED";

// ---------------- SUB TYPES ----------------
export interface OrderItem {
  id: string; // ID item trong order
  order_id: string; // ID order chứa item
  item_id: string; // ID sản phẩm hoặc dịch vụ
  item_name: string; // Tên sản phẩm/dịch vụ
  quantity: number; // Số lượng
  price: number; // Đơn giá
  total_price: number; // Tổng giá (quantity * price)
  created_at: string; // ISO datetime
  updated_at: string; // ISO datetime
}

export interface DeliveryInfo {
  address?: string; // Địa chỉ giao hàng (nếu có)
  phone?: string; // SĐT người nhận
  note?: string; // Ghi chú giao hàng
  method?: "PICKUP" | "HOME_DELIVERY"; // Hình thức nhận hàng
}

// ---------------- MAIN ORDER ----------------
export interface Order {
  id: string;
  patient_id: string;
  appointment_id?: string | null;
  book_user_id: string;
  status: OrderStatus;
  total_amount: number;
  items: OrderItem[];
  delivery_info?: DeliveryInfo | null;
  created_at: string;
  updated_at: string;
}

// ---------------- REQUEST TYPES ----------------
export interface OrderItemRequest {
  item_id: string;
  quantity: number;
  price: number;
}

export interface CreateOrderRequest {
  patient_id: string;
  appointment_id?: string;
  book_user_id: string;
  items: OrderItemRequest[];
  delivery_info?: DeliveryInfo;
}

class OrderClient {
  private readonly client: AxiosInstance;

  constructor() {
    this.client = api;
  }

  /**
   * Tạo đơn hàng mới
   * @param data - Thông tin đơn hàng
   * @returns Order object
   */
  async createOrder(data: CreateOrderRequest): Promise<Order> {
    const response = await this.client.post<Order>(endpoint, data);
    return response.data;
  }
}

const OrderApi = new OrderClient();
export { OrderApi };
