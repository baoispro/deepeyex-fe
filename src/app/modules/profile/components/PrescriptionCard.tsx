"use client";

import React, { useRef, useEffect, useState } from "react";
import { Typography, Tag, Button, Card, Collapse } from "antd";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import { FaPills, FaClock, FaCalendarDay, FaUserMd, FaRobot, FaPrint } from "react-icons/fa";
import { useReactToPrint } from "react-to-print";
import {
  Prescription,
  prescriptionStatusLabels,
  prescriptionSourceLabels,
} from "../../hospital/types/prescription";
import PrintablePrescription from "./PrintablePrescription";

dayjs.locale("vi");

const { Text } = Typography;

interface PrescriptionCardProps {
  prescription: Prescription;
}

export default function PrescriptionCard({ prescription }: PrescriptionCardProps) {
  const createdDate = dayjs(prescription.CreatedAt);
  const sourceIcon = prescription.source === "DOCTOR" ? <FaUserMd /> : <FaRobot />;
  const printRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Đợi component mount xong
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Don_thuoc_${prescription.prescription_id}`,
    pageStyle: `
      @page {
        size: A4;
        margin: 20mm;
      }
      @media print {
        body {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
      }
    `,
  });

  const handlePrintClick = () => {
    // Kiểm tra ref và ready state trước khi in
    if (!printRef.current || !isReady) {
      console.error("Print content is not ready");
      return;
    }
    handlePrint();
  };

  return (
    <div>
      {/* Hidden printable content - sử dụng visibility để ẩn nhưng vẫn trong DOM */}
      <div style={{ visibility: "hidden", position: "absolute", left: "-9999px" }}>
        <div ref={printRef}>
          <PrintablePrescription prescription={prescription} />
        </div>
      </div>

      <Card className="hover:shadow-lg transition-shadow duration-300 border-2 border-gray-200">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div
              className={`${
                prescription.source === "DOCTOR" ? "bg-blue-50" : "bg-purple-50"
              } p-3 rounded-full`}
            >
              <div
                className={`${
                  prescription.source === "DOCTOR" ? "text-blue-500" : "text-purple-500"
                } text-xl`}
              >
                {sourceIcon}
              </div>
            </div>
            <div>
              <Text strong className="!text-base block">
                {prescriptionSourceLabels[prescription.source]}
              </Text>
              <Text className="text-sm text-gray-500">
                {createdDate.format("DD/MM/YYYY HH:mm")}
              </Text>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="primary"
              icon={<FaPrint />}
              onClick={handlePrintClick}
              className="w-full md:w-auto"
            >
              In đơn thuốc
            </Button>
            <Tag
              color={prescriptionStatusLabels[prescription.status].color}
              className="text-sm px-3 py-1"
            >
              {prescriptionStatusLabels[prescription.status].label}
            </Tag>
          </div>
        </div>

        {/* Description */}
        {prescription.description && (
          <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded mb-4">
            <Text className="text-sm">
              <strong>📝 Ghi chú:</strong> {prescription.description}
            </Text>
          </div>
        )}

        {/* Prescription Items */}
        <Collapse
          defaultActiveKey={[]}
          className="bg-gray-50"
          expandIconPosition="end"
          items={[
            {
              key: "1",
              label: (
                <div className="flex items-center gap-2">
                  <FaPills className="text-green-600" />
                  <Text strong className="text-gray-800">
                    Chi tiết đơn thuốc ({prescription.items.length} loại thuốc)
                  </Text>
                </div>
              ),
              children: (
                <div className="space-y-3">
                  {prescription.items.map((item, index) => (
                    <div
                      key={item.prescription_item_id}
                      className="bg-white p-4 rounded-lg border border-gray-200"
                    >
                      <div className="flex items-start gap-3">
                        <div className="bg-green-100 text-green-600 font-bold w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <Text strong className="text-base block mb-2">
                            {item.drug_name}
                          </Text>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <FaPills className="text-green-500" />
                              <Text>
                                <strong>Liều lượng:</strong> {item.dosage}
                              </Text>
                            </div>

                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <FaClock className="text-blue-500" />
                              <Text>
                                <strong>Tần suất:</strong> {item.frequency}
                              </Text>
                            </div>

                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <FaCalendarDay className="text-purple-500" />
                              <Text>
                                <strong>Thời gian:</strong> {item.duration_days} ngày
                              </Text>
                            </div>

                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <FaCalendarDay className="text-orange-500" />
                              <Text>
                                <strong>Từ:</strong> {dayjs(item.start_date).format("DD/MM/YYYY")} -{" "}
                                {dayjs(item.end_date).format("DD/MM/YYYY")}
                              </Text>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
}
