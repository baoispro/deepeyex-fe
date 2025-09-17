"use client";
import React from "react";
import { FaHeartbeat, FaPills, FaAppleAlt, FaCheckCircle, FaCalendarAlt } from "react-icons/fa";
import { EyeDiseaseLabel } from "../../../shares/types/predict";
import { useRouter } from "@/app/shares/locales/navigation";

type Props = {
  disease: EyeDiseaseLabel;
};

const planData: Record<
  EyeDiseaseLabel,
  { diagnosis: string; medicines: string[]; lifestyle: string[]; followUp: string }
> = {
  conjunctivitis: {
    diagnosis: "Viêm kết mạc (Đau mắt đỏ)",
    medicines: [
      "Thuốc nhỏ mắt kháng sinh (ví dụ: Chloramphenicol)",
      "Giữ vệ sinh tay và mắt, tránh dụi mắt",
    ],
    lifestyle: [
      "Không dùng chung khăn mặt, chậu rửa",
      "Rửa tay thường xuyên",
      "Tránh tiếp xúc nơi đông người khi bệnh đang lây",
    ],
    followUp: "Tái khám sau 1 tuần nếu không đỡ.",
  },
  eyelidedema: {
    diagnosis: "Phù nề mí mắt",
    medicines: [
      "Chườm lạnh giảm sưng",
      "Nếu kèm nhiễm trùng: dùng kháng sinh theo chỉ định bác sĩ",
    ],
    lifestyle: ["Ngủ đủ giấc", "Hạn chế muối trong khẩu phần", "Không dụi mắt"],
    followUp: "Khám lại sau 5-7 ngày.",
  },
  healthy_eye: {
    diagnosis: "Mắt bình thường",
    medicines: [],
    lifestyle: [
      "Ăn nhiều rau xanh, cá giàu Omega-3",
      "Hạn chế dùng thiết bị điện tử liên tục",
      "Khám mắt định kỳ",
    ],
    followUp: "Khám định kỳ mỗi 6 - 12 tháng.",
  },
  hordeolum: {
    diagnosis: "Chắp / Lẹo",
    medicines: ["Chườm ấm 3-4 lần/ngày", "Thuốc mỡ kháng sinh (nếu có chỉ định)"],
    lifestyle: [
      "Giữ vệ sinh mí mắt sạch sẽ",
      "Không nặn lẹo",
      "Rửa tay trước khi chạm vào vùng mắt",
    ],
    followUp: "Khám lại nếu sau 1 tuần không cải thiện.",
  },
  keratitiswithulcer: {
    diagnosis: "Viêm giác mạc có loét",
    medicines: ["Thuốc nhỏ mắt kháng sinh phổ rộng", "Có thể cần corticoid theo chỉ định bác sĩ"],
    lifestyle: [
      "Tránh dùng kính áp tròng cho đến khi khỏi",
      "Đeo kính râm khi ra ngoài",
      "Bổ sung vitamin A trong khẩu phần",
    ],
    followUp: "Tái khám sau 2-3 ngày để đánh giá.",
  },
  subconjunctival_hemorrhage: {
    diagnosis: "Xuất huyết dưới kết mạc",
    medicines: ["Không cần điều trị đặc hiệu", "Theo dõi huyết áp, tránh gắng sức"],
    lifestyle: ["Kiểm soát huyết áp", "Không dụi mắt mạnh", "Ăn nhạt, tập thể dục đều đặn"],
    followUp: "Tự khỏi trong 1-2 tuần, khám lại nếu tái phát nhiều lần.",
  },
};

const TreatmentPlanUI: React.FC<Props> = ({ disease }) => {
  const plan = planData[disease];
  const router = useRouter();

  return (
    <div className="p-4 bg-gray-50 rounded-lg shadow space-y-4">
      {/* Diagnosis */}
      <div className="flex items-center space-x-2">
        <FaHeartbeat className="text-red-500" size={24} />
        <h2 className="text-lg font-bold">Chẩn đoán: {plan.diagnosis}</h2>
      </div>

      {/* Medicines */}
      {plan.medicines.length > 0 ? (
        <div>
          <h3 className="font-semibold flex items-center space-x-2">
            <FaPills className="text-blue-500" /> <span>Thuốc & Điều trị:</span>
          </h3>
          <ul className="list-disc list-inside text-gray-700">
            {plan.medicines.map((m, i) => (
              <li key={i}>{m}</li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="text-gray-600">Không cần thuốc điều trị.</p>
      )}

      {/* Lifestyle */}
      {plan.lifestyle.length > 0 && (
        <div>
          <h3 className="font-semibold flex items-center space-x-2">
            <FaAppleAlt className="text-green-600" /> <span>Lời khuyên sinh hoạt:</span>
          </h3>
          <ul className="list-disc list-inside text-gray-700">
            {plan.lifestyle.map((tip, i) => (
              <li key={i}>{tip}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Follow-up */}
      <div className="flex items-center space-x-2">
        <FaCheckCircle className="text-green-500" />
        <span className="text-gray-700">{plan.followUp}</span>
      </div>

      {/* Booking button (hide if healthy_eye) */}
      {disease !== "healthy_eye" && (
        <div className="pt-4">
          <button
            onClick={() => router.push("/booking")}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg shadow cursor-pointer"
          >
            <FaCalendarAlt /> <span>Đặt lịch khám với bác sĩ</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default TreatmentPlanUI;
