"use client";

import { useState } from "react";
import { Modal } from "antd";
import { toast } from "react-toastify";
import { SubscriptionApi, SubscribeRequest } from "@/app/shares/api/subscriptionApi";
import { useSelector } from "react-redux";
import { RootState } from "@/app/shares/stores";

interface SubscribeModalProps {
  open: boolean;
  onClose: () => void;
  planName: "FREE" | "VIP" | "ENTERPRISE";
  onSuccess?: () => void;
}

export default function SubscribeModal({
  open,
  onClose,
  planName,
  onSuccess,
}: SubscribeModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const userId = useSelector((state: RootState) => state.auth.userId);

  const handleSubscribe = async () => {
    if (!userId) {
      toast.error("Vui lòng đăng nhập để đăng ký gói");
      return;
    }

    setIsLoading(true);
    try {
      const duration = planName === "FREE" ? 30 : planName === "VIP" ? 30 : 365; // ENTERPRISE: 1 năm
      const payload: SubscribeRequest = {
        user_id: userId,
        plan_name: planName,
        duration,
      };

      const response = await SubscriptionApi.subscribe(payload);

      // Nếu là gói FREE, đăng ký trực tiếp
      if (planName === "FREE") {
        toast.success(`Đăng ký gói ${planName} thành công!`);
        onSuccess?.();
        onClose();
        return;
      }

      if (response.data?.payment_url && response.data?.subscription_id) {
        window.location.href = response.data.payment_url;
        return;
      }

      // Nếu không có payment_url, có thể đã đăng ký thành công (trường hợp đặc biệt)
      toast.success(`Đăng ký gói ${planName} thành công!`);
      onSuccess?.();
      onClose();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message || `Đăng ký gói ${planName} thất bại`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      onOk={handleSubscribe}
      okText="Xác nhận đăng ký"
      cancelText="Hủy"
      confirmLoading={isLoading}
      title={`Đăng ký gói ${planName}`}
    >
      <div className="py-4">
        <p className="text-gray-700 mb-4">
          Bạn có chắc chắn muốn đăng ký gói <strong>{planName}</strong>?
        </p>
        {planName === "FREE" && (
          <p className="text-sm text-gray-600">
            Gói FREE cho phép bạn sử dụng chẩn đoán AI 5 lần/tháng và tư vấn 1 lần/tháng.
          </p>
        )}
        {planName === "VIP" && (
          <p className="text-sm text-gray-600">
            Gói VIP cho phép bạn sử dụng không giới hạn chẩn đoán AI và tư vấn 10 lần/tháng. Giá:
            299.000đ/tháng.
          </p>
        )}
        {planName === "ENTERPRISE" && (
          <p className="text-sm text-gray-600">
            Vui lòng liên hệ với chúng tôi để được tư vấn về gói ENTERPRISE.
          </p>
        )}
      </div>
    </Modal>
  );
}
