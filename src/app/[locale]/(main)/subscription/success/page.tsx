"use client";

import { useRouter } from "@/app/shares/locales/navigation";
import { useEffect, useState } from "react";
import { FaCheckCircle, FaCrown, FaRocket, FaHome, FaUser } from "react-icons/fa";
import { VnpayApi } from "@/app/shares/api/vnpayApi";
import { toast } from "react-toastify";

export default function SubscriptionSuccessPage() {
  const router = useRouter();
  const [paymentStatus, setPaymentStatus] = useState<"success" | "failed" | null>(null);
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [planName, setPlanName] = useState<string>("");

  useEffect(() => {
    const handleVnpayReturn = async () => {
      // Debug: Log thông tin hiện tại
      console.log("=== Subscription Success Page Debug ===");
      console.log("Current URL:", window.location.href);
      console.log("Query string:", window.location.search);

      // Đọc params từ URL: type=subscription&subscriptionId=...&userId=...&planName=...&duration=...
      const urlParams = new URLSearchParams(window.location.search);
      const type = urlParams.get("type");
      const subscriptionId = urlParams.get("subscriptionId");
      const userId = urlParams.get("userId");
      const planNameFromUrl = urlParams.get("planName");
      const durationFromUrl = urlParams.get("duration");

      console.log("URL Params:", {
        type,
        subscriptionId,
        userId,
        planNameFromUrl,
        durationFromUrl,
      });

      // Kiểm tra xem có phải từ VNPay return cho subscription không
      const queryString = window.location.search;
      if (queryString.includes("vnp_ResponseCode") && type === "subscription") {
        console.log("Detected VNPay return with query:", queryString);
        setIsVerifyingPayment(true);
        try {
          // Gọi API verify payment
          const result = await VnpayApi.verifyReturn(queryString);
          console.log("VNPay verify result:", result);
          const { status } = result.data || {};

          if (status === "success") {
            setPaymentStatus("success");
            setPlanName(planNameFromUrl || "");
            toast.success("Thanh toán thành công! Đăng ký gói thành công!");

            // Backend đã tự động gọi CompleteSubscription() và tạo subscription trong database
            // Không cần gọi completePayment nữa
            console.log("Backend đã tự động tạo subscription với:", {
              subscriptionId,
              userId,
              planName: planNameFromUrl,
              duration: durationFromUrl,
            });
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
      } else if (type === "subscription" && subscriptionId && userId && planNameFromUrl) {
        // Có params từ URL nhưng không có vnp_ResponseCode (trường hợp đặc biệt)
        console.log("Subscription params from URL (no VNPay return)");
        setPlanName(planNameFromUrl || "");
        setPaymentStatus("success");
        setIsInitializing(false);
      } else {
        // Không có params từ URL, hiển thị success bình thường
        console.log("No subscription params in URL");
        setPaymentStatus("success");
        setIsInitializing(false);
      }
    };

    handleVnpayReturn();
  }, []);

  const handleBackToHome = () => {
    localStorage.removeItem("pendingSubscription");
    localStorage.removeItem("subscriptionType");
    router.push("/");
  };

  const handleViewProfile = () => {
    localStorage.removeItem("pendingSubscription");
    localStorage.removeItem("subscriptionType");
    router.push("/profile");
  };

  const getPlanIcon = () => {
    if (planName === "VIP") {
      return <FaCrown className="text-yellow-500" size={80} />;
    }
    if (planName === "ENTERPRISE") {
      return <FaRocket className="text-purple-500" size={80} />;
    }
    return <FaCheckCircle className="text-green-500" size={80} />;
  };

  const getPlanColor = () => {
    if (planName === "VIP") {
      return "from-yellow-400 to-orange-500";
    }
    if (planName === "ENTERPRISE") {
      return "from-purple-500 to-pink-500";
    }
    return "from-green-400 to-blue-500";
  };

  if (isInitializing || isVerifyingPayment) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Đang xử lý thanh toán...</p>
        </div>
      </div>
    );
  }

  if (paymentStatus === "failed") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <FaCheckCircle className="text-red-500 mx-auto mb-4" size={80} />
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Thanh toán thất bại</h1>
          <p className="text-gray-600 mb-6">
            Rất tiếc, thanh toán của bạn không thành công. Vui lòng thử lại.
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={handleBackToHome}
              className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Về trang chủ
            </button>
            <button
              onClick={() => router.push("/")}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full">
        {/* Success Icon */}
        <div className="text-center mb-6">
          <div
            className={`inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-r ${getPlanColor()} mb-4 shadow-lg`}
          >
            <div className="text-white">{getPlanIcon()}</div>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Đăng ký gói thành công!</h1>
          <p className="text-gray-600 text-lg">
            Cảm ơn bạn đã đăng ký gói{" "}
            <strong className="text-blue-600">{planName || "Premium"}</strong>
          </p>
        </div>

        {/* Success Message */}
        <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6 rounded">
          <div className="flex items-start">
            <FaCheckCircle className="text-green-500 mt-1 mr-3 flex-shrink-0" size={20} />
            <div>
              <p className="text-green-800 font-semibold mb-1">Thanh toán đã được xác nhận</p>
              <p className="text-green-700 text-sm">
                Gói của bạn đã được kích hoạt và sẵn sàng sử dụng ngay bây giờ.
              </p>
            </div>
          </div>
        </div>

        {/* Plan Benefits */}
        {planName && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Quyền lợi của gói {planName}:
            </h2>
            <ul className="space-y-2">
              {planName === "VIP" && (
                <>
                  <li className="flex items-center text-gray-700">
                    <FaCheckCircle className="text-green-500 mr-2" size={16} />
                    Chẩn đoán AI không giới hạn
                  </li>
                  <li className="flex items-center text-gray-700">
                    <FaCheckCircle className="text-green-500 mr-2" size={16} />
                    Tư vấn trực tuyến với bác sĩ (10 lần/tháng)
                  </li>
                  <li className="flex items-center text-gray-700">
                    <FaCheckCircle className="text-green-500 mr-2" size={16} />
                    Ưu tiên hỗ trợ 24/7
                  </li>
                  <li className="flex items-center text-gray-700">
                    <FaCheckCircle className="text-green-500 mr-2" size={16} />
                    Nhắc nhở uống thuốc mắt định kỳ
                  </li>
                </>
              )}
              {planName === "ENTERPRISE" && (
                <>
                  <li className="flex items-center text-gray-700">
                    <FaCheckCircle className="text-green-500 mr-2" size={16} />
                    Tất cả tính năng VIP
                  </li>
                  <li className="flex items-center text-gray-700">
                    <FaCheckCircle className="text-green-500 mr-2" size={16} />
                    Chẩn đoán AI không giới hạn cho toàn bộ nhân viên
                  </li>
                  <li className="flex items-center text-gray-700">
                    <FaCheckCircle className="text-green-500 mr-2" size={16} />
                    Tư vấn trực tuyến không giới hạn
                  </li>
                  <li className="flex items-center text-gray-700">
                    <FaCheckCircle className="text-green-500 mr-2" size={16} />
                    Hỗ trợ chuyên dụng 24/7
                  </li>
                  <li className="flex items-center text-gray-700">
                    <FaCheckCircle className="text-green-500 mr-2" size={16} />
                    Tích hợp API cho hệ thống nội bộ
                  </li>
                </>
              )}
            </ul>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <button
            onClick={handleViewProfile}
            className="flex-1 flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg"
          >
            <FaUser className="mr-2" />
            Xem hồ sơ
          </button>
          <button
            onClick={handleBackToHome}
            className="flex-1 flex items-center justify-center px-6 py-3 bg-gray-100 text-gray-800 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
          >
            <FaHome className="mr-2" />
            Về trang chủ
          </button>
        </div>

        {/* Additional Info */}
        <div className="mt-6 pt-6 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-500">
            Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ với chúng tôi qua email hoặc hotline.
          </p>
        </div>
      </div>
    </div>
  );
}
