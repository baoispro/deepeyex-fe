"use client";
import { Card, Typography, Button } from "antd";
import React from "react";
import { Order, OrderStatus } from "../types/order";

const { Title, Text } = Typography;

interface InvoiceProps {
  orders: Order[];
}

export default function InvoiceSection({ orders }: InvoiceProps) {
  if (orders?.length === 0) {
    return <Text>Không có đơn hàng nào.</Text>;
  }

  return (
    <div className="flex flex-col gap-5">
      {orders?.map((order) => {
        const totalAmount = order.order_items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0,
        );

        return (
          <Card
            key={order.order_id}
            title={<Title level={4}>🧾 Hóa đơn #{order.order_id}</Title>}
            extra={
              <Button type="primary" onClick={() => window.print()}>
                In hóa đơn
              </Button>
            }
            className="shadow-md rounded-lg"
          >
            {/* Thông tin bệnh nhân */}
            <div className="mb-6">
              <Title level={5}>👤 Thông tin bệnh nhân</Title>
              <Text>
                <strong>Tên:</strong> {order.patient.full_name}
              </Text>
              <br />
              <Text>
                <strong>SĐT:</strong> {order.patient.phone}
              </Text>
              <br />
              <Text>
                <strong>Địa chỉ:</strong> {order.patient.address}
              </Text>
            </div>

            {/* Danh sách thuốc */}
            <div className="mb-6">
              <Title level={5}>💊 Danh sách thuốc</Title>
              <div className="space-y-4">
                {order.order_items.map((item) => (
                  <div
                    key={item.order_item_id}
                    className="flex justify-between items-center border-b pb-2"
                  >
                    <div>
                      <Text strong>{item.drug.name}</Text>
                      <div className="text-gray-500 text-sm">
                        Đơn giá: {item.price.toLocaleString("vi-VN")}đ x {item.quantity}
                      </div>
                    </div>
                    <Text strong className="text-blue-600">
                      {(item.price * item.quantity).toLocaleString("vi-VN")}đ
                    </Text>
                  </div>
                ))}
              </div>
            </div>

            {/* Tổng tiền */}
            <div className="flex justify-between mt-6 text-lg pt-4">
              <Text strong>Tổng tiền:</Text>
              <Text strong className="text-red-600">
                {totalAmount.toLocaleString("vi-VN")}đ
              </Text>
            </div>

            {/* Trạng thái đơn hàng */}
            <div className="mt-4">
              <Text>
                <strong>Trạng thái:</strong>{" "}
                <span className="text-green-600">{OrderStatus[order.status] || order.status}</span>
              </Text>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
