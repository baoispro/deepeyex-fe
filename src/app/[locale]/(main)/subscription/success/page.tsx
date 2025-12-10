"use client";

import { useRouter } from "@/app/shares/locales/navigation";
import { useEffect, useState, useRef } from "react";
import { FaCheckCircle, FaCrown, FaRocket, FaHome, FaUser } from "react-icons/fa";
import { VnpayApi } from "@/app/shares/api/vnpayApi";
import { toast } from "react-toastify";
import { SubscriptionApi } from "@/app/shares/api/subscriptionApi";

export default function SubscriptionSuccessPage() {
  const router = useRouter();
  const [paymentStatus, setPaymentStatus] = useState<"success" | "failed" | null>(null);
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [planName, setPlanName] = useState<string>("");
  const paymentCompletedRef = useRef(false);

  useEffect(() => {
    const handleVnpayReturn = async () => {
      // Debug: Log thông tin hiện tại
      console.log("=== Subscription Success Page Debug ===");
      console.log("Current URL:", window.location.href);
      console.log("Query string:", window.location.search);
      console.log("Pending subscription:", localStorage.getItem("pendingSubscription"));
      console.log("Subscription type:", localStorage.getItem("subscriptionType"));

      // Kiểm tra xem có phải từ VNPay return không
      const queryString = window.location.search;
      if (queryString.includes("vnp_ResponseCode")) {
        console.log("Detected VNPay return with query:", queryString);
        setIsVerifyingPayment(true);
        try {
          // Gọi API verify payment
          const result = await VnpayApi.verifyReturn(queryString);
          console.log("VNPay verify result:", result);
          const { status } = result.data || {};

          if (status === "success") {
            setPaymentStatus("success");
            toast.success("Thanh toán thành công!");

            // Lấy thông tin subscription từ localStorage
            const pendingSubscription = localStorage.getItem("pendingSubscription");
            console.log("Pending subscription data:", pendingSubscription);
            if (pendingSubscription) {
              const subscriptionData = JSON.parse(pendingSubscription);
              console.log("Parsed subscription data:", subscriptionData);
              setPlanName(subscriptionData.planName || "");

              // Gọi API complete-payment để backend tạo subscription
              if (
                !paymentCompletedRef.current &&
                subscriptionData.subscriptionId &&
                subscriptionData.userId &&
                subscriptionData.planName
              ) {
                paymentCompletedRef.current = true;
                console.log("Calling completePayment with:", {
                  subscription_id: subscriptionData.subscriptionId,
                  user_id: subscriptionData.userId,
                  plan_name: subscriptionData.planName,
                  duration: subscriptionData.duration || 30,
                });
                try {
                  const completeResult = await SubscriptionApi.completePayment({
                    subscription_id: subscriptionData.subscriptionId,
                    user_id: subscriptionData.userId,
                    plan_name: subscriptionData.planName,
                    duration: subscriptionData.duration || 30,
                  });
                  console.log("Complete payment thành công:", completeResult);
                  toast.success("Đăng ký gói thành công!");
                  // Xóa thông tin pending sau khi complete thành công
                  localStorage.removeItem("pendingSubscription");
                  localStorage.removeItem("subscriptionType");
                } catch (error) {
                  console.error("Error completing payment:", error);
                  toast.error("Có lỗi xảy ra khi hoàn tất thanh toán. Vui lòng liên hệ hỗ trợ.");
                }
              } else {
                console.warn("Cannot call completePayment:", {
                  paymentCompletedRef: paymentCompletedRef.current,
                  subscriptionId: subscriptionData.subscriptionId,
                  userId: subscriptionData.userId,
                  planName: subscriptionData.planName,
                });
              }
            } else {
              console.warn("No pending subscription found in localStorage");
            }
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
        console.log("Not from VNPay return, checking localStorage...");
        // Không phải từ VNPay, hiển thị success bình thường (nếu có thông tin từ localStorage)
        const pendingSubscription = localStorage.getItem("pendingSubscription");
        console.log("Pending subscription (no VNPay):", pendingSubscription);
        if (pendingSubscription) {
          const subscriptionData = JSON.parse(pendingSubscription);
          console.log("Parsed subscription data (no VNPay):", subscriptionData);
          setPlanName(subscriptionData.planName || "");
          setPaymentStatus("success");

          // Nếu có subscription_id, gọi complete-payment
          // Nếu không có subscription_id, vẫn gọi complete-payment với user_id và plan_name
          // Backend có thể tự tạo subscription_id mới
          if (
            !paymentCompletedRef.current &&
            subscriptionData.userId &&
            subscriptionData.planName
          ) {
            paymentCompletedRef.current = true;
            // Nếu không có subscription_id, tạo một ID tạm hoặc để backend tự tạo
            const subscriptionIdToUse =
              subscriptionData.subscriptionId || `temp_${Date.now()}_${subscriptionData.userId}`;

            console.log("Calling completePayment (no VNPay) with:", {
              subscription_id: subscriptionIdToUse,
              user_id: subscriptionData.userId,
              plan_name: subscriptionData.planName,
              duration: subscriptionData.duration || 30,
            });
            SubscriptionApi.completePayment({
              subscription_id: subscriptionIdToUse,
              user_id: subscriptionData.userId,
              plan_name: subscriptionData.planName,
              duration: subscriptionData.duration || 30,
            })
              .then((result) => {
                console.log("Complete payment thành công (no VNPay):", result);
                toast.success("Đăng ký gói thành công!");
                localStorage.removeItem("pendingSubscription");
                localStorage.removeItem("subscriptionType");
              })
              .catch((error) => {
                console.error("Error completing payment (no VNPay):", error);
                toast.error("Có lỗi xảy ra khi hoàn tất thanh toán.");
              });
          } else {
            console.warn("Cannot call completePayment (no VNPay):", {
              paymentCompletedRef: paymentCompletedRef.current,
              subscriptionId: subscriptionData.subscriptionId,
              userId: subscriptionData.userId,
              planName: subscriptionData.planName,
            });
          }
        } else {
          console.warn("No pending subscription found (no VNPay)");
          setPaymentStatus("success");
        }
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
