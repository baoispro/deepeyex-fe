"use client";

import { useState } from "react";
import { FaCheck, FaCrown, FaRocket, FaStar } from "react-icons/fa";
import SubscribeModal from "./SubscribeModal";
import ContactModal from "./ContactModal";

interface PricingPlan {
  name: string;
  price: string;
  description: string;
  features: string[];
  icon: React.ReactNode;
  popular?: boolean;
  gradient: string;
}

const pricingPlans: PricingPlan[] = [
  {
    name: "FREE",
    price: "Miễn phí",
    description: "Gói cơ bản cho người dùng mới bắt đầu",
    features: [
      "Chẩn đoán AI miễn phí (5 lần/tháng)",
      "Xem kết quả cơ bản",
      "Tư vấn trực tuyến với bác sĩ (1 lần/tháng)",
      "Hỗ trợ qua email",
      //   "Truy cập cộng đồng",
    ],
    icon: <FaStar className="text-yellow-500" size={40} />,
    gradient: "from-gray-400 to-gray-600",
  },
  {
    name: "VIP",
    price: "299.000đ",
    description: "Gói phổ biến nhất cho người dùng thường xuyên",
    features: [
      "Chẩn đoán AI không giới hạn",
      //   "Xem kết quả chi tiết và báo cáo",
      "Tư vấn trực tuyến với bác sĩ (10 lần/tháng)",
      "Ưu tiên hỗ trợ 24/7",
      "Nhắc nhở uống thuốc mắt định kỳ",
      //   "Nhận thông báo sức khỏe định kỳ",
      //   "Giảm giá 10% khi mua thuốc",
    ],
    icon: <FaCrown className="text-yellow-500" size={40} />,
    popular: true,
    gradient: "from-yellow-400 to-orange-500",
  },
  {
    name: "ENTERPRISE",
    price: "Liên hệ",
    description: "Gói doanh nghiệp với đầy đủ tính năng cao cấp",
    features: [
      "Tất cả tính năng VIP",
      "Chẩn đoán AI không giới hạn cho toàn bộ nhân viên",
      "Tư vấn trực tuyến không giới hạn",
      "Hỗ trợ chuyên dụng 24/7",
      //   "Báo cáo quản lý và phân tích",
      "Tích hợp API cho hệ thống nội bộ",
      //   "Đào tạo và hỗ trợ triển khai",
      //   "Giảm giá 20% khi mua thuốc",
    ],
    icon: <FaRocket className="text-purple-500" size={40} />,
    gradient: "from-purple-500 to-pink-500",
  },
];

export default function PricingSection() {
  const [subscribeModalOpen, setSubscribeModalOpen] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<"FREE" | "VIP" | "ENTERPRISE">("FREE");

  const handleSubscribeClick = (planName: "FREE" | "VIP" | "ENTERPRISE") => {
    if (planName === "ENTERPRISE") {
      setContactModalOpen(true);
    } else {
      setSelectedPlan(planName);
      setSubscribeModalOpen(true);
    }
  };

  return (
    <section id="pricing" className="relative py-16 bg-gradient-to-b from-gray-50 to-white">
      <div className="py-4 px-6 md:px-12">
        <div className="flex flex-col justify-between gap-20">
          <div className="flex flex-col items-center text-center">
            <div className="mb-6 relative">
              <span
                className="relative inline-block text-8xl font-jost font-extrabold text-transparent"
                style={{
                  background: "-webkit-linear-gradient(0deg, #f4e5da, #def4f1 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Pricing
              </span>

              <h2 className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-3xl font-semibold text-gray-800 whitespace-nowrap">
                Chọn gói phù hợp với bạn
              </h2>
            </div>

            <div className="flex flex-col md:flex-row justify-center items-stretch gap-8 md:gap-6 mt-20 md:mt-16 max-w-7xl mx-auto">
              {pricingPlans.map((plan, index) => (
                <div
                  key={index}
                  className={`relative flex flex-col w-full md:w-1/3 p-8 rounded-2xl shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 ${
                    plan.popular
                      ? "bg-gradient-to-br from-yellow-50 to-orange-50 border-4 border-yellow-400 scale-105 z-10"
                      : "bg-white border-2 border-gray-200"
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                      Phổ biến nhất
                    </div>
                  )}

                  <div className="flex flex-col items-center mb-6">
                    <div
                      className={`p-5 rounded-full bg-gradient-to-r ${plan.gradient} mb-4 shadow-2xl ${
                        plan.popular || plan.name === "ENTERPRISE"
                          ? "scale-110 ring-4 ring-opacity-50"
                          : ""
                      } ${
                        plan.popular
                          ? "ring-yellow-400"
                          : plan.name === "ENTERPRISE"
                            ? "ring-purple-400"
                            : ""
                      }`}
                    >
                      <div className="text-white">
                        {plan.name === "VIP" ? (
                          <FaCrown className="text-yellow-100" size={55} />
                        ) : plan.name === "ENTERPRISE" ? (
                          <FaRocket className="text-purple-100" size={55} />
                        ) : (
                          plan.icon
                        )}
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">{plan.name}</h3>
                    <div className="text-3xl font-extrabold text-gray-900 mb-2">
                      {plan.price}
                      {plan.price !== "Miễn phí" && plan.price !== "Liên hệ" && (
                        <span className="text-lg font-normal text-gray-600">/tháng</span>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm text-center">{plan.description}</p>
                  </div>

                  <ul className="flex-1 space-y-4 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start">
                        <FaCheck className="text-green-500 mt-1 mr-3 flex-shrink-0" size={18} />
                        <span className="text-gray-700 text-sm text-left">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handleSubscribeClick(plan.name as "FREE" | "VIP" | "ENTERPRISE")}
                    className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-300 ${
                      plan.popular
                        ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-white hover:from-yellow-500 hover:to-orange-600 shadow-lg"
                        : plan.name === "ENTERPRISE"
                          ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600"
                          : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                    }`}
                  >
                    {plan.name === "ENTERPRISE" ? "Liên hệ tư vấn" : "Chọn gói"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <SubscribeModal
        open={subscribeModalOpen}
        onClose={() => setSubscribeModalOpen(false)}
        planName={selectedPlan}
        onSuccess={() => {
          // Có thể refresh lại data hoặc hiển thị thông báo
        }}
      />

      <ContactModal open={contactModalOpen} onClose={() => setContactModalOpen(false)} />
    </section>
  );
}
