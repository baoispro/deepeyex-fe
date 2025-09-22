"use client";
import { Card, Typography, Spin } from "antd";
import { useState } from "react";

const { Title, Text } = Typography;

export type DiagnosisHistory = {
  id: string;
  diagnosis: string;
  doctor: string;
  date: string;
  note?: string;
};

const mockDiagnosisHistory: DiagnosisHistory[] = [
  {
    id: "1",
    date: "2025-3-20T08:20:00Z",
    diagnosis: "keratitiswithulcer",
    doctor: "Dr. Trần Thị F",
    note: "Điều trị bằng thuốc nhỏ mắt đặc trị",
  },
  {
    id: "2",
    date: "2024-09-16T14:00:00Z",
    diagnosis: "conjunctivitis",
    doctor: "Dr. Trần Thị B",
    note: "Rửa mắt bằng nước muối sinh lý",
  },
  {
    id: "3",
    date: "2023-06-17T09:15:00Z",
    diagnosis: "eyelidedema",
    doctor: "Dr. Lê Văn C",
    note: "Chườm lạnh, tránh dụi mắt",
  },
];

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

  return (
    <div>
      <Title level={4}>Lịch sử chẩn đoán</Title>

      {loading ? (
        <div className="flex justify-center py-10">
          <Spin size="large" />
        </div>
      ) : (
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
      )}
    </div>
  );
}
