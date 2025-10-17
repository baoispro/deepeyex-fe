"use client";

import { Modal } from "antd";
import React from "react";

interface BookingTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (type: "new" | "reexam") => void;
}

const BookingTypeModal: React.FC<BookingTypeModalProps> = ({ isOpen, onClose, onSelect }) => {
  const handleSelectType = (type: "new" | "reexam") => {
    localStorage.setItem("booking_type", type);
    onSelect(type);
    onClose();
  };

  return (
    <Modal
      open={isOpen}
      closable={false}
      footer={null}
      centered
      width={500}
      className="rounded-2xl"
    >
      <div className="flex flex-col items-center gap-6 py-5">
        <h2 className="text-xl font-semibold text-center">Chọn loại lịch hẹn của bạn</h2>

        <div className="grid grid-cols-2 gap-5 w-full">
          {/* Ô Khám mới */}
          <div
            onClick={() => handleSelectType("new")}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && handleSelectType("new")}
            className="cursor-pointer bg-white rounded-2xl p-6 text-center shadow-md border border-transparent
                       hover:shadow-[0_6px_20px_rgba(18,80,220,0.2)] hover:border-blue-200 hover:-translate-y-1
                       transition-all duration-300 ease-out focus:outline-none"
          >
            <div className="flex flex-col items-center">
              <h3 className="font-semibold text-base text-[#1250dc]">Khám mới</h3>
              <p className="text-sm text-gray-500 mt-1">
                Dành cho bệnh nhân khám lần đầu hoặc chưa có hồ sơ.
              </p>
            </div>
          </div>

          {/* Ô Tái khám */}
          <div
            onClick={() => handleSelectType("reexam")}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && handleSelectType("reexam")}
            className="cursor-pointer bg-white rounded-2xl p-6 text-center shadow-md border border-transparent
                       hover:shadow-[0_6px_20px_rgba(34,197,94,0.2)] hover:border-green-200 hover:-translate-y-1
                       transition-all duration-300 ease-out focus:outline-none"
          >
            <div className="flex flex-col items-center">
              <h3 className="font-semibold text-base text-[#1250dc]">Tái khám</h3>
              <p className="text-sm text-gray-500 mt-1">
                Dành cho bệnh nhân đã có hồ sơ khám trước đó.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default BookingTypeModal;
