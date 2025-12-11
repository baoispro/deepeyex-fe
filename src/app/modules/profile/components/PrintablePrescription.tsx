"use client";

import React from "react";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import { Prescription } from "../../hospital/types/prescription";

dayjs.locale("vi");

interface PrintablePrescriptionProps {
  prescription: Prescription;
}

export default function PrintablePrescription({ prescription }: PrintablePrescriptionProps) {
  const createdDate = dayjs(prescription.CreatedAt);

  return (
    <div className="p-8 max-w-4xl mx-auto bg-white" style={{ fontFamily: "Arial, sans-serif" }}>
      {/* Header */}
      <div className="text-center mb-8 border-b-2 border-blue-500 pb-4">
        <h1 className="text-3xl font-bold text-blue-600 mb-2">THÔNG TIN ĐƠN THUỐC</h1>
        <p className="text-gray-600">Ngày kê đơn: {createdDate.format("DD/MM/YYYY HH:mm")}</p>
      </div>

      {/* Bác sĩ khám */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-3 border-b border-gray-300 pb-2">
          Bác sĩ khám
        </h2>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-lg font-semibold text-gray-800">{prescription.doctor_name || "N/A"}</p>
          <p className="text-sm text-gray-600 mt-1">
            Nguồn: {prescription.source === "DOCTOR" ? "Bác sĩ kê đơn" : "AI chẩn đoán"}
          </p>
        </div>
      </div>

      {/* Ghi chú */}
      {(prescription.description || prescription.notes) && (
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-3 border-b border-gray-300 pb-2">
            Ghi chú
          </h2>
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
            {prescription.description && (
              <p className="text-gray-700 mb-2">
                <strong>Mô tả:</strong> {prescription.description}
              </p>
            )}
            {prescription.notes && (
              <p className="text-gray-700">
                <strong>Lưu ý:</strong> {prescription.notes}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Thông tin thuốc */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-3 border-b border-gray-300 pb-2">
          Thông tin thuốc
        </h2>
        <div className="space-y-4">
          {prescription.items.map((item, index) => (
            <div
              key={item.prescription_item_id}
              className="bg-white border-2 border-gray-200 p-4 rounded-lg"
            >
              <div className="flex items-start gap-4">
                <div className="bg-green-100 text-green-600 font-bold w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-800 mb-3">{item.drug_name}</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">
                        <strong className="text-gray-800">Liều lượng:</strong> {item.dosage}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">
                        <strong className="text-gray-800">Tần suất:</strong> {item.frequency}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">
                        <strong className="text-gray-800">Thời gian:</strong> {item.duration_days}{" "}
                        ngày
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">
                        <strong className="text-gray-800">Từ:</strong>{" "}
                        {dayjs(item.start_date).format("DD/MM/YYYY")} -{" "}
                        {dayjs(item.end_date).format("DD/MM/YYYY")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 pt-4 border-t border-gray-300 text-center text-sm text-gray-500">
        <p>Mã đơn thuốc: {prescription.prescription_id}</p>
        <p className="mt-1">Trạng thái: {prescription.status}</p>
      </div>
    </div>
  );
}
