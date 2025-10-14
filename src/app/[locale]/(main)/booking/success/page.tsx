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
            toast.success("Thanh toán thành công!");

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
            toast.error("Thanh toán thất bại. Vui lòng thử lại.");
          }
        } catch (error) {
          console.error("Error verifying payment:", error);
          setPaymentStatus("failed");
          toast.error("Có lỗi xảy ra khi xác thực thanh toán.");
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
            {isVerifyingPayment ? "Đang xác thực thanh toán..." : "Đang tải..."}
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
              <h1 className="mt-6 text-4xl font-bold text-white">Thanh toán thất bại!</h1>
              <p className="mt-3 text-lg text-white/90">
                Đơn hàng của bạn chưa được thanh toán. Vui lòng thử lại.
              </p>
            </div>
            <div className="px-8 py-8">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => router.push("/payment")}
                  className="px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                >
                  Thử lại
                </button>
                <button
                  onClick={() => router.push("/")}
                  className="px-8 py-4 bg-white text-gray-700 font-bold rounded-xl shadow-lg hover:shadow-xl border-2 border-gray-200 hover:border-gray-300 transform hover:-translate-y-0.5 transition-all duration-200"
                >
                  Về trang chủ
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
              {orderType === "booking" ? "Đặt lịch thành công!" : "Đặt hàng thành công!"}
            </h1>
            <p className="mt-3 text-lg text-white/90">
              Cảm ơn bạn đã tin tưởng sử dụng dịch vụ của chúng tôi
            </p>
          </div>

          {/* Order Info */}
          <div className="px-8 py-8">
            <div className="bg-gradient-to-r from-blue-50 to-blue-50 rounded-xl p-6 mb-8">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FaBox className="text-blue-500" />
                Thông tin đơn hàng
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex justify-between items-center bg-white rounded-lg p-3">
                  <span className="text-gray-600 font-medium">Mã đơn hàng:</span>
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
                  <span className="text-gray-600 font-medium">Ngày đặt:</span>
                  <span className="text-gray-900 font-bold">
                    {dayjs().format("DD/MM/YYYY HH:mm")}
                  </span>
                </div>
                <div className="flex justify-between items-center bg-white rounded-lg p-3 md:col-span-2">
                  <span className="text-gray-600 font-medium">Loại đơn hàng:</span>
                  <span className="text-blue-600 font-bold">
                    {orderType === "booking" ? "Đặt lịch khám bệnh" : "Đặt mua thuốc"}
                  </span>
                </div>
              </div>
            </div>

            {/* Danh sách thuốc (chỉ hiển thị khi type = thuoc) */}
            {orderType === "thuoc" && orderItems.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <FaPills className="text-blue-500" />
                  Danh sách thuốc đã đặt
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
                          <span className="text-gray-600">Số lượng: {item.quantity}</span>
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
                        <div className="text-xs text-gray-500 mb-1">Tổng cộng</div>
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
                      Tổng giá trị đơn hàng:
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
                {orderType === "booking" ? "Các bước tiếp theo" : "Tiến trình đơn hàng"}
              </h2>

              <div className="space-y-4">
                {orderType === "booking" ? (
                  <>
                    <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                        1
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800">Xác nhận lịch hẹn</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Bệnh viện sẽ xác nhận lịch hẹn của bạn trong vòng 24h
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border-l-4 border-gray-300">
                      <div className="flex-shrink-0 w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-white font-bold">
                        2
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-700">Nhận thông báo</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Bạn sẽ nhận email/SMS khi lịch hẹn được xác nhận
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border-l-4 border-gray-300">
                      <div className="flex-shrink-0 w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-white font-bold">
                        3
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-700">Đến khám</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Đến bệnh viện đúng giờ hẹn để được khám
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
                        <h3 className="font-bold text-gray-800">Đơn hàng đã đặt</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Đơn hàng của bạn đã được tiếp nhận và đang xử lý
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border-l-4 border-gray-300">
                      <div className="flex-shrink-0 w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-white font-bold">
                        2
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-700">Chuẩn bị hàng</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Nhà thuốc sẽ chuẩn bị đơn hàng trong 1-2 giờ
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border-l-4 border-gray-300">
                      <div className="flex-shrink-0 w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-white font-bold">
                        3
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-700">Giao hàng</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Đơn hàng sẽ được giao trong 1-3 ngày làm việc
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
                Lưu ý quan trọng
              </h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Bạn sẽ nhận được email xác nhận chi tiết trong vài phút tới</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Vui lòng kiểm tra cả hộp thư spam nếu không thấy email</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Bạn có thể theo dõi trạng thái đơn hàng trong mục &quot;Hồ sơ&quot;</span>
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
                Xem đơn hàng của tôi
              </button>
              <button
                onClick={handleBackToHome}
                className="px-8 py-4 bg-white text-gray-700 font-bold rounded-xl shadow-lg hover:shadow-xl border-2 border-gray-200 hover:border-gray-300 transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <FaHome />
                Về trang chủ
              </button>
            </div>
          </div>
        </div>

        {/* Support Section */}
        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Cần hỗ trợ?{" "}
            <a
              href="mailto:support@deepeyex.com"
              className="text-blue-600 hover:underline font-semibold"
            >
              Liên hệ với chúng tôi
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
