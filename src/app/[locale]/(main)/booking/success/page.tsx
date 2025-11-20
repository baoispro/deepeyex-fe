"use client";

import { useRouter } from "@/app/shares/locales/navigation";
import { useEffect, useState } from "react";
import {
  FaCheckCircle,
  FaBox,
  FaTruck,
  FaHome,
  FaCalendarCheck,
  FaPills,
  FaTimesCircle,
} from "react-icons/fa";
import dayjs from "dayjs";
import Image from "next/image";
import { VnpayApi } from "@/app/shares/api/vnpayApi";
import { OrderApi } from "@/app/shares/api/orderApi";
import { toast } from "react-toastify";
import { useCart } from "@/app/shares/hooks/carts/useCart";
import { SendEmailApi, SendOrderConfirmationRequest } from "@/app/shares/api/sendMail";
import { Doctor } from "@/app/modules/hospital/types/doctor";
import { Patient } from "@/app/modules/hospital/types/patient";
import { createOrGetConversation } from "@/app/shares/utils/createOrGetConversation";
import { useTranslations } from "next-intl";

interface OrderItem {
  key: string;
  drug_id?: string;
  name: string;
  price: number;
  sale_price?: number;
  quantity: number;
  image?: string;
}

export default function ConfirmOrderPage() {
  const t = useTranslations("booking");
  const router = useRouter();
  const { clearCart } = useCart();
  const [orderType, setOrderType] = useState<string | null>(null);
  const [showAnimation, setShowAnimation] = useState(false);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [orderTotal, setOrderTotal] = useState(0);
  const [paymentStatus, setPaymentStatus] = useState<"success" | "failed" | null>(null);
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const handleVnpayReturn = async () => {
      // Kiểm tra xem có phải từ VNPay return không
      const queryString = window.location.search;
      if (queryString.includes("vnp_ResponseCode")) {
        setIsVerifyingPayment(true);
        try {
          // Gọi API verify payment
          const result = await VnpayApi.verifyReturn(queryString);
          const { status, orderId } = result.data || {};

          if (status === "success") {
            setPaymentStatus("success");
            toast.success(t("successPage.messages.paymentSuccess"));

            if (orderType == "booking") {
              const doctorResponse = JSON.parse(localStorage.getItem("doctor") || "");
              const patientResponse = JSON.parse(localStorage.getItem("patient") || "");
              const appointment_id = localStorage.getItem("appointment");
              await createOrGetConversation(
                doctorResponse?.data || ({} as Doctor),
                patientResponse?.data || ({} as Patient),
                appointment_id || null,
              );
            }

            localStorage.removeItem("doctor");
            localStorage.removeItem("patient");
            localStorage.removeItem("appointment");

            // Cập nhật trạng thái đơn hàng thành PAID
            if (orderId) {
              try {
                await OrderApi.updateOrderStatus(orderId, "PAID");
              } catch (error) {
                console.error("Error updating order status:", error);
              }
            }

            // Gửi email xác nhận (nếu có thông tin)
            const pendingEmailData = localStorage.getItem("pendingEmailData");
            if (pendingEmailData && orderId) {
              try {
                const emailData: SendOrderConfirmationRequest = {
                  ...JSON.parse(pendingEmailData),
                  order_code: orderId,
                };
                await SendEmailApi.sendOrderConfirmation(emailData);
                localStorage.removeItem("pendingEmailData");
              } catch (error) {
                console.error("Error sending email:", error);
              }
            }

            // Clear cart
            clearCart();
          } else {
            setPaymentStatus("failed");
            toast.error(t("successPage.messages.paymentFailed"));
          }
        } catch (error) {
          console.error("Error verifying payment:", error);
          setPaymentStatus("failed");
          toast.error(t("successPage.messages.verificationError"));
        } finally {
          setIsVerifyingPayment(false);
          setIsInitializing(false);
        }
      } else {
        // Không phải từ VNPay, hiển thị success bình thường
        setPaymentStatus("success");
        setIsInitializing(false);
      }
    };

    const type = localStorage.getItem("type");
    setOrderType(type);

    // Load cart items nếu là đặt thuốc
    if (type === "thuoc") {
      const cartItems = localStorage.getItem("cartItems");
      if (cartItems) {
        const items = JSON.parse(cartItems);
        setOrderItems(items);

        // Tính tổng tiền
        const total = items.reduce((sum: number, item: OrderItem) => {
          const price = item.sale_price || item.price;
          return sum + price * item.quantity;
        }, 0);
        setOrderTotal(total);
      }
    }

    // Xử lý VNPay return
    handleVnpayReturn();

    // Trigger animation after mount
    setTimeout(() => setShowAnimation(true), 100);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clearCart]);

  const handleBackToHome = () => {
    localStorage.removeItem("type");
    localStorage.removeItem("cartItems");
    router.push("/");
  };

  const handleViewOrders = () => {
    router.push("/profile");
  };

  // Hiển thị loading khi đang khởi tạo hoặc verify payment
  if (isInitializing || isVerifyingPayment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">
            {isVerifyingPayment
              ? t("successPage.loading.verifying")
              : t("successPage.loading.loading")}
          </p>
        </div>
      </div>
    );
  }

  // Hiển thị trang thất bại nếu thanh toán thất bại
  if (paymentStatus === "failed") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div
            className={`bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-700 transform ${
              showAnimation ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
            }`}
          >
            <div className="bg-gradient-to-r from-red-400 to-red-500 px-8 py-12 text-center">
              <div className="inline-block">
                <div className="relative">
                  <FaTimesCircle className="relative text-white text-8xl" />
                </div>
              </div>
              <h1 className="mt-6 text-4xl font-bold text-white">
                {t("successPage.failed.title")}
              </h1>
              <p className="mt-3 text-lg text-white/90">{t("successPage.failed.message")}</p>
            </div>
            <div className="px-8 py-8">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => router.push("/payment")}
                  className="px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                >
                  {t("successPage.failed.tryAgain")}
                </button>
                <button
                  onClick={() => router.push("/")}
                  className="px-8 py-4 bg-white text-gray-700 font-bold rounded-xl shadow-lg hover:shadow-xl border-2 border-gray-200 hover:border-gray-300 transform hover:-translate-y-0.5 transition-all duration-200"
                >
                  {t("successPage.failed.backToHome")}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Success Animation Card */}
        <div
          className={`bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-700 transform ${
            showAnimation ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
        >
          {/* Header with Icon */}
          <div className="bg-gradient-to-r from-blue-400 to-blue-500 px-8 py-12 text-center">
            <div className="inline-block">
              <div className="relative">
                <div className="absolute inset-0 bg-white rounded-full animate-ping opacity-20"></div>
                <FaCheckCircle className="relative text-white text-8xl animate-bounce" />
              </div>
            </div>
            <h1 className="mt-6 text-4xl font-bold text-white">
              {orderType === "booking"
                ? t("successPage.success.bookingTitle")
                : t("successPage.success.orderTitle")}
            </h1>
            <p className="mt-3 text-lg text-white/90">{t("successPage.success.thankYou")}</p>
          </div>

          {/* Order Info */}
          <div className="px-8 py-8">
            <div className="bg-gradient-to-r from-blue-50 to-blue-50 rounded-xl p-6 mb-8">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FaBox className="text-blue-500" />
                {t("successPage.orderInfo.title")}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex justify-between items-center bg-white rounded-lg p-3">
                  <span className="text-gray-600 font-medium">
                    {t("successPage.orderInfo.orderCode")}
                  </span>
                  {orderType === "booking" ? (
                    <span className="text-gray-900 font-bold">
                      #{Date.now().toString().slice(-8)}
                    </span>
                  ) : (
                    <span className="text-gray-900 font-bold">
                      #{localStorage.getItem("orderId")}
                    </span>
                  )}
                </div>
                <div className="flex justify-between items-center bg-white rounded-lg p-3">
                  <span className="text-gray-600 font-medium">
                    {t("successPage.orderInfo.orderDate")}
                  </span>
                  <span className="text-gray-900 font-bold">
                    {dayjs().format("DD/MM/YYYY HH:mm")}
                  </span>
                </div>
                <div className="flex justify-between items-center bg-white rounded-lg p-3 md:col-span-2">
                  <span className="text-gray-600 font-medium">
                    {t("successPage.orderInfo.orderType")}
                  </span>
                  <span className="text-blue-600 font-bold">
                    {orderType === "booking"
                      ? t("successPage.orderInfo.bookingType")
                      : t("successPage.orderInfo.drugType")}
                  </span>
                </div>
              </div>
            </div>

            {/* Danh sách thuốc (chỉ hiển thị khi type = thuoc) */}
            {orderType === "thuoc" && orderItems.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <FaPills className="text-blue-500" />
                  {t("successPage.drugList.title")}
                </h2>
                <div className="space-y-4">
                  {orderItems.map((item, index) => (
                    <div
                      key={item.key || index}
                      className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      {/* Ảnh sản phẩm */}
                      <div className="relative w-20 h-20 flex-shrink-0 bg-white rounded-lg border border-gray-200 overflow-hidden">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-contain p-2"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-100">
                            <FaPills className="text-gray-400 text-2xl" />
                          </div>
                        )}
                      </div>

                      {/* Thông tin sản phẩm */}
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800 mb-1">{item.name}</h3>
                        <div className="flex items-center gap-3 text-sm">
                          <span className="text-gray-600">
                            {t("successPage.drugList.quantity")} {item.quantity}
                          </span>
                          <span className="text-gray-300">|</span>
                          <div className="flex items-center gap-2">
                            {item.sale_price && item.sale_price < item.price ? (
                              <>
                                <span className="line-through text-gray-400">
                                  {item.price.toLocaleString()}₫
                                </span>
                                <span className="text-red-500 font-semibold">
                                  {item.sale_price.toLocaleString()}₫
                                </span>
                              </>
                            ) : (
                              <span className="text-gray-800 font-semibold">
                                {item.price.toLocaleString()}₫
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Tổng tiền cho item */}
                      <div className="text-right">
                        <div className="text-xs text-gray-500 mb-1">
                          {t("successPage.drugList.total")}
                        </div>
                        <div className="text-lg font-bold text-blue-600">
                          {((item.sale_price || item.price) * item.quantity).toLocaleString()}₫
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Tổng tiền đơn hàng */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-700">
                      {t("successPage.drugList.orderTotal")}
                    </span>
                    <span className="text-2xl font-bold text-blue-600">
                      {orderTotal.toLocaleString()}₫
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Timeline/Next Steps */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                {orderType === "booking" ? (
                  <FaCalendarCheck className="text-blue-500" />
                ) : (
                  <FaTruck className="text-blue-500" />
                )}
                {orderType === "booking"
                  ? t("successPage.timeline.booking.title")
                  : t("successPage.timeline.order.title")}
              </h2>

              <div className="space-y-4">
                {orderType === "booking" ? (
                  <>
                    <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                        1
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800">
                          {t("successPage.timeline.booking.step1.title")}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {t("successPage.timeline.booking.step1.description")}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border-l-4 border-gray-300">
                      <div className="flex-shrink-0 w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-white font-bold">
                        2
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-700">
                          {t("successPage.timeline.booking.step2.title")}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {t("successPage.timeline.booking.step2.description")}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border-l-4 border-gray-300">
                      <div className="flex-shrink-0 w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-white font-bold">
                        3
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-700">
                          {t("successPage.timeline.booking.step3.title")}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {t("successPage.timeline.booking.step3.description")}
                        </p>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                        1
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800">
                          {t("successPage.timeline.order.step1.title")}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {t("successPage.timeline.order.step1.description")}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border-l-4 border-gray-300">
                      <div className="flex-shrink-0 w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-white font-bold">
                        2
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-700">
                          {t("successPage.timeline.order.step2.title")}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {t("successPage.timeline.order.step2.description")}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border-l-4 border-gray-300">
                      <div className="flex-shrink-0 w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-white font-bold">
                        3
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-700">
                          {t("successPage.timeline.order.step3.title")}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {t("successPage.timeline.order.step3.description")}
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Important Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
              <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                <FaHome className="text-blue-600" />
                {t("successPage.importantNotes.title")}
              </h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>{t("successPage.importantNotes.note1")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>{t("successPage.importantNotes.note2")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>{t("successPage.importantNotes.note3")}</span>
                </li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleViewOrders}
                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <FaBox />
                {t("successPage.actions.viewOrders")}
              </button>
              <button
                onClick={handleBackToHome}
                className="px-8 py-4 bg-white text-gray-700 font-bold rounded-xl shadow-lg hover:shadow-xl border-2 border-gray-200 hover:border-gray-300 transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <FaHome />
                {t("successPage.actions.backToHome")}
              </button>
            </div>
          </div>
        </div>

        {/* Support Section */}
        <div className="mt-8 text-center">
          <p className="text-gray-600">
            {t("successPage.support.needHelp")}{" "}
            <a
              href="mailto:support@deepeyex.com"
              className="text-blue-600 hover:underline font-semibold"
            >
              {t("successPage.support.contactUs")}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
