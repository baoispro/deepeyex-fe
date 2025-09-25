import { Patient } from "./patient";

export type Drug = {
  drug_id: string;
  name: string;
};

export type OrderItem = {
  order_item_id: string;
  drug: Drug;
  quantity: number;
  price: number;
};

export enum OrderStatus {
  Pending = "Chờ xử lý",
  Completed = "Đã hoàn tất",
  Cancelled = "Đã hủy",
  Delivered = "Đã giao hàng",
}

export type Order = {
  order_id: string;
  patient: Patient;
  order_items: OrderItem[];
  status: keyof typeof OrderStatus;
};
