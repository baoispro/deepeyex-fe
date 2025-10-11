"use client";

import { useRouter } from "@/app/shares/locales/navigation";
import { useEffect, useState } from "react";
import { FaCheckCircle, FaBox, FaTruck, FaHome, FaCalendarCheck } from "react-icons/fa";
import dayjs from "dayjs";

export default function ConfirmOrderPage() {
  const router = useRouter();
  const [orderType, setOrderType] = useState<string | null>(null);
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    const type = localStorage.getItem("type");
    setOrderType(type);

    // Trigger animation after mount
    setTimeout(() => setShowAnimation(true), 100);
  }, []);

  const handleBackToHome = () => {
    localStorage.removeItem("type");
    localStorage.removeItem("cartItems");
    router.push("/");
  };

  const handleViewOrders = () => {
    router.push("/profile");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Success Animation Card */}
        <div
          className={`bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-700 transform ${
            showAnimation ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
        >
          {/* Header with Icon */}
          <div className="bg-gradient-to-r from-green-400 to-blue-500 px-8 py-12 text-center">
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
            <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6 mb-8">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FaBox className="text-blue-500" />
                Thông tin đơn hàng
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex justify-between items-center bg-white rounded-lg p-3">
                  <span className="text-gray-600 font-medium">Mã đơn hàng:</span>
                  <span className="text-gray-900 font-bold">
                    #{Date.now().toString().slice(-8)}
                  </span>
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

            {/* Timeline/Next Steps */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                {orderType === "booking" ? (
                  <FaCalendarCheck className="text-green-500" />
                ) : (
                  <FaTruck className="text-green-500" />
                )}
                {orderType === "booking" ? "Các bước tiếp theo" : "Tiến trình đơn hàng"}
              </h2>

              <div className="space-y-4">
                {orderType === "booking" ? (
                  <>
                    <div className="flex items-start gap-4 p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                      <div className="flex-shrink-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
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
                    <div className="flex items-start gap-4 p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                      <div className="flex-shrink-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
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
