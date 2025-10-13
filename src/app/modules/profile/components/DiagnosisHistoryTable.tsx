"use client";
import { Card, Typography, Spin, Button } from "antd";
import { useState } from "react";
import { FaStethoscope, FaEye } from "react-icons/fa";
import { useRouter } from "@/app/shares/locales/navigation";

const { Title, Text } = Typography;

export type DiagnosisHistory = {
  id: string;
  diagnosis: string;
  doctor: string;
  date: string;
  note?: string;
};

const mockDiagnosisHistory: DiagnosisHistory[] = [];
// [
//   {
//     id: "1",
//     date: "2025-3-20T08:20:00Z",
//     diagnosis: "keratitiswithulcer",
//     doctor: "Dr. Trần Thị F",
//     note: "Điều trị bằng thuốc nhỏ mắt đặc trị",
//   },
//   {
//     id: "2",
//     date: "2024-09-16T14:00:00Z",
//     diagnosis: "conjunctivitis",
//     doctor: "Dr. Trần Thị B",
//     note: "Rửa mắt bằng nước muối sinh lý",
//   },
//   {
//     id: "3",
//     date: "2023-06-17T09:15:00Z",
//     diagnosis: "eyelidedema",
//     doctor: "Dr. Lê Văn C",
//     note: "Chườm lạnh, tránh dụi mắt",
//   },
// ];

const diagnosisMap: Record<string, string> = {
  conjunctivitis: "Viêm kết mạc (Đau mắt đỏ)",
  eyelidedema: "Phù nề mí mắt",
  healthy_eye: "Mắt bình thường",
  hordeolum: "Chắp / Lẹo",
  keratitiswithulcer: "Viêm giác mạc có loét",
  subconjunctival_hemorrhage: "Xuất huyết dưới kết mạc",
};

export default function DiagnosisHistoryList() {
  const [data] = useState<DiagnosisHistory[]>(mockDiagnosisHistory);
  const [loading] = useState(false);
  const router = useRouter();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spin size="large" tip="Đang tải lịch sử chẩn đoán..." />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] text-center px-4">
        {/* Icon animation */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-blue-100 rounded-full animate-pulse"></div>
          <div className="relative bg-gradient-to-br from-blue-50 to-blue-100 rounded-full p-12">
            <FaStethoscope className="text-blue-400 text-7xl" />
          </div>
        </div>

        {/* Text content */}
        <Title level={3} className="!mb-3 text-gray-800">
          Chưa có lịch sử chẩn đoán
        </Title>
        <Text className="text-gray-500 text-lg mb-8 max-w-md">
          Bạn chưa có lịch sử khám bệnh nào. Hãy đặt lịch khám hoặc sử dụng tính năng chẩn đoán AI
          để kiểm tra sức khỏe mắt.
        </Text>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            type="primary"
            size="large"
            icon={<FaEye />}
            onClick={() => router.push("/predict")}
            className="!h-12 !px-8 !bg-gradient-to-r !from-blue-500 !to-blue-600 hover:!from-blue-600 hover:!to-blue-700"
          >
            Chẩn đoán AI
          </Button>
          <Button size="large" onClick={() => router.push("/booking")} className="!h-12 !px-8">
            Đặt lịch khám
          </Button>
        </div>

        {/* Decorative elements */}
        <div className="mt-12 grid grid-cols-3 gap-4 max-w-md opacity-40">
          <div className="bg-gray-100 rounded-lg p-4 text-center">
            <div className="text-2xl mb-1">🤖</div>
            <Text className="text-xs text-gray-500">AI thông minh</Text>
          </div>
          <div className="bg-gray-100 rounded-lg p-4 text-center">
            <div className="text-2xl mb-1">👁️</div>
            <Text className="text-xs text-gray-500">Chính xác cao</Text>
          </div>
          <div className="bg-gray-100 rounded-lg p-4 text-center">
            <div className="text-2xl mb-1">⚡</div>
            <Text className="text-xs text-gray-500">Nhanh chóng</Text>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Title level={4}>Lịch sử chẩn đoán</Title>

      <div className="grid gap-4 md:grid-cols-2">
        {data.map((item) => (
          <Card key={item.id} hoverable>
            <div className="mb-2">
              <Text strong>Ngày: </Text>
              <Text>
                {new Date(item.date).toLocaleDateString("vi-VN", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
              </Text>
            </div>

            <div className="mb-2">
              <Text strong>Chẩn đoán: </Text>
              <Text>{diagnosisMap[item.diagnosis] || item.diagnosis}</Text>
            </div>

            <div className="mb-2">
              <Text strong>Bác sĩ: </Text>
              <Text>{item.doctor}</Text>
            </div>

            {item.note && (
              <div>
                <Text strong>Ghi chú: </Text>
                <Text>{item.note}</Text>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
