"use client";
import { Typography, Button, Tag, Spin, Modal } from "antd";
import React, { useState } from "react";
import { Order, orderStatusLabels, deliveryMethodLabels } from "../../../shares/types/order";
import { FaFileInvoice, FaShoppingCart, FaTruck, FaBox } from "react-icons/fa";
import { useRouter } from "@/app/shares/locales/navigation";
import dayjs from "dayjs";
import { useUpdateOrderStatusMutation } from "@/app/shares/hooks/mutations/use-update-order-status.mutation";
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";
import { QueryKeyEnum } from "@/app/shares/enums/queryKey";
import { useTranslations } from "next-intl";

const { Title, Text } = Typography;

interface InvoiceProps {
  orders: Order[];
  loading?: boolean;
}

const statusColors: Record<Order["status"] | "PAID", string> = {
  PENDING: "orange",
  CONFIRMED: "blue",
  COMPLETED: "green",
  CANCELLED: "red",
  PAID: "green",
};

export default function InvoiceSection({ orders, loading }: InvoiceProps) {
  const t = useTranslations("home");
  const router = useRouter();
  const queryClient = useQueryClient();
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<{
    id: string;
    code: string;
  } | null>(null);

  const { mutate: updateStatus, isPending: isCancelling } = useUpdateOrderStatusMutation({
    onSuccess: () => {
      toast.success(t("profile.invoice.cancelSuccess"));
      // Refetch orders list
      queryClient.invalidateQueries({ queryKey: [QueryKeyEnum.Order, "patient-orders"] });
      setCancellingId(null);
      setShowCancelModal(false);
      setSelectedOrder(null);
    },
    onError: (err) => {
      toast.error(t("profile.invoice.cancelFailed") + " " + err.message);
      setCancellingId(null);
    },
  });

  const handleOpenCancelModal = (orderId: string) => {
    const orderCode = orderId.slice(0, 8).toUpperCase();
    setSelectedOrder({ id: orderId, code: orderCode });
    setShowCancelModal(true);
  };

  const handleConfirmCancel = () => {
    if (selectedOrder) {
      setCancellingId(selectedOrder.id);
      updateStatus({
        order_id: selectedOrder.id,
        status: "CANCELLED",
      });
    }
  };

  const handleCloseModal = () => {
    if (!isCancelling) {
      setShowCancelModal(false);
      setSelectedOrder(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spin size="large" tip={t("profile.invoiceSection.loading")} />
      </div>
    );
  }

  if (orders?.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] text-center px-4">
        {/* Icon animation */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-blue-100 rounded-full animate-pulse"></div>
          <div className="relative bg-gradient-to-br from-blue-50 to-blue-100 rounded-full p-12">
            <FaFileInvoice className="text-blue-400 text-7xl" />
          </div>
        </div>

        {/* Text content */}
        <Title level={3} className="!mb-3 text-gray-800">
          {t("profile.invoiceSection.empty.title")}
        </Title>
        <Text className="text-gray-500 text-lg mb-8 max-w-md">
          {t("profile.invoiceSection.empty.description")}
        </Text>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            type="primary"
            size="large"
            icon={<FaShoppingCart />}
            onClick={() => router.push("/shop")}
            className="!h-12 !px-8 !bg-gradient-to-r !from-blue-500 !to-blue-600 hover:!from-blue-600 hover:!to-blue-700"
          >
            {t("profile.invoiceSection.empty.buyDrugs")}
          </Button>
          <Button size="large" onClick={() => router.push("/booking")} className="!h-12 !px-8">
            {t("profile.invoiceSection.empty.bookAppointment")}
          </Button>
        </div>

        {/* Decorative elements */}
        <div className="mt-12 grid grid-cols-3 gap-4 max-w-md opacity-40">
          <div className="bg-gray-100 rounded-lg p-4 text-center">
            <div className="text-2xl mb-1">📋</div>
            <Text className="text-xs text-gray-500">
              {t("profile.invoiceSection.empty.features.electronicInvoice")}
            </Text>
          </div>
          <div className="bg-gray-100 rounded-lg p-4 text-center">
            <div className="text-2xl mb-1">💳</div>
            <Text className="text-xs text-gray-500">
              {t("profile.invoiceSection.empty.features.easyPayment")}
            </Text>
          </div>
          <div className="bg-gray-100 rounded-lg p-4 text-center">
            <div className="text-2xl mb-1">🔒</div>
            <Text className="text-xs text-gray-500">
              {t("profile.invoiceSection.empty.features.secure")}
            </Text>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <Title level={4} className="!mb-0">
          🧾 {t("profile.invoiceSection.title")}
        </Title>
        <Text className="text-gray-500">
          {t("profile.invoiceSection.total", { count: orders.length })}
        </Text>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {orders?.map((order) => {
          return (
            <div
              key={order.order_id}
              className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow duration-300 bg-white"
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-50 p-3 rounded-full">
                    <FaFileInvoice className="text-blue-500 text-xl" />
                  </div>
                  <div>
                    <Text strong className="text-base block">
                      {t("profile.invoiceSection.order.orderNumber", {
                        code: order.order_id.slice(0, 8).toUpperCase(),
                      })}
                    </Text>
                    <Text className="text-xs text-gray-500">
                      {dayjs(order.created_at).format("DD/MM/YYYY HH:mm")}
                    </Text>
                  </div>
                </div>

                <Tag color={statusColors[order.status] || "default"} className="text-sm px-3 py-1">
                  {t(`profile.invoiceSection.status.${order.status}`) ||
                    orderStatusLabels[order.status] ||
                    order.status}
                </Tag>
              </div>

              <div className="border-t border-gray-100 pt-4 space-y-4">
                {/* Danh sách items */}
                <div>
                  <Text strong className="text-gray-700 mb-2 block">
                    📦 {t("profile.invoiceSection.order.productList")}
                  </Text>
                  <div className="space-y-2">
                    {order.order_items.map((item) => (
                      <div
                        key={item.order_item_id}
                        className="flex justify-between items-center bg-gray-50 p-3 rounded-lg"
                      >
                        <div className="flex-1">
                          <Text strong className="text-gray-800 block">
                            {item.item_name}
                          </Text>
                          <Text className="text-sm text-gray-500">
                            {item.price.toLocaleString()}₫ x {item.quantity}
                          </Text>
                        </div>
                        <Text strong className="text-blue-600 text-base">
                          {(item.price * item.quantity).toLocaleString()}₫
                        </Text>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Thông tin giao hàng */}
                <div className="flex items-center gap-2 bg-blue-50 p-3 rounded-lg">
                  <FaTruck className="text-blue-500" />
                  <Text className="text-gray-700">
                    <strong>{t("profile.invoiceSection.order.deliveryMethod")}</strong>{" "}
                    {t(`profile.invoiceSection.deliveryMethod.${order.delivery_method}`) ||
                      deliveryMethodLabels[order.delivery_method] ||
                      order.delivery_method}
                  </Text>
                </div>

                {/* Tổng tiền */}
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between items-center mb-2">
                    <Text className="text-gray-600">
                      {t("profile.invoiceSection.order.subtotal")}
                    </Text>
                    <Text className="text-gray-800 font-semibold">
                      {order.total_amount.toLocaleString()}₫
                    </Text>
                  </div>
                  {order.delivery_fee > 0 && (
                    <div className="flex justify-between items-center mb-2">
                      <Text className="text-gray-600">
                        {t("profile.invoiceSection.order.deliveryFee")}
                      </Text>
                      <Text className="text-gray-800 font-semibold">
                        {order.delivery_fee.toLocaleString()}₫
                      </Text>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                    <Text strong className="text-lg">
                      {t("profile.invoiceSection.order.total")}
                    </Text>
                    <Text strong className="text-xl text-blue-600">
                      {(order.total_amount + order.delivery_fee).toLocaleString()}₫
                    </Text>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex gap-3">
                  <Button
                    type="primary"
                    icon={<FaBox />}
                    className="!flex-1/2"
                    onClick={() => window.print()}
                  >
                    {t("profile.invoiceSection.order.printInvoice")}
                  </Button>
                  {order.status === "PENDING" && (
                    <Button
                      danger
                      disabled={isCancelling && cancellingId === order.order_id}
                      loading={isCancelling && cancellingId === order.order_id}
                      onClick={() => handleOpenCancelModal(order.order_id)}
                      className="!flex-1/2 !bg-red-500 !text-white !hover:bg-red-600"
                    >
                      {isCancelling && cancellingId === order.order_id
                        ? t("profile.invoiceSection.order.cancelling")
                        : t("profile.invoiceSection.order.cancel")}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal xác nhận hủy đơn hàng */}
      <Modal
        title={t("profile.invoiceSection.modal.title")}
        open={showCancelModal}
        onOk={handleConfirmCancel}
        onCancel={handleCloseModal}
        okText={t("profile.invoiceSection.modal.confirm")}
        cancelText={t("profile.invoiceSection.modal.close")}
        okButtonProps={{ danger: true, loading: isCancelling }}
        cancelButtonProps={{ disabled: isCancelling }}
      >
        <p>
          {t("profile.invoiceSection.modal.message", {
            code: selectedOrder?.code || "",
          })}
        </p>
        <p className="text-gray-500 text-sm mt-2">{t("profile.invoiceSection.modal.warning")}</p>
      </Modal>
    </div>
  );
}
