"use client";
import { Typography, Tag, Spin, Button, Select, DatePicker } from "antd";
import React from "react";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import { FaPrescriptionBottle, FaFilter, FaRedo, FaUserMd } from "react-icons/fa";
import { useRouter } from "@/app/shares/locales/navigation";
import { Prescription } from "../../hospital/types/prescription";
import PrescriptionCard from "./PrescriptionCard";

dayjs.locale("vi");

const { Title, Text } = Typography;
const { Option } = Select;

interface PrescriptionFilters {
  status: string;
  date: string;
  sort: string;
}

interface PrescriptionListProps {
  prescriptions: Prescription[];
  loading?: boolean;
  filters: PrescriptionFilters;
  onFilterChange: (filters: PrescriptionFilters) => void;
}

export default function PrescriptionList({
  prescriptions,
  loading,
  filters,
  onFilterChange,
}: PrescriptionListProps) {
  const router = useRouter();

  const handleStatusChange = (value: string) => {
    onFilterChange({ ...filters, status: value });
  };

  const handleDateChange = (date: dayjs.Dayjs | null, dateString: string | string[]) => {
    // Nếu date null hoặc dateString rỗng thì clear filter
    if (!date || !dateString || dateString === "") {
      onFilterChange({ ...filters, date: "" });
      return;
    }

    // Convert sang format YYYY-MM-DD để gửi lên backend
    const dateValue = date.format("YYYY-MM-DD");
    onFilterChange({ ...filters, date: dateValue });
  };

  const handleResetFilters = () => {
    onFilterChange({ status: "", date: "", sort: "newest" });
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <Title level={4} className="!mb-0">
          💊 Toa thuốc
        </Title>
        <Text className="text-gray-500">Tổng: {prescriptions.length} toa thuốc</Text>
      </div>

      {/* Filters Section */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-50 p-5 rounded-xl border border-blue-100">
        <div className="flex items-center gap-2 mb-4">
          <FaFilter className="text-blue-600" />
          <Text strong className="text-gray-700">
            Bộ lọc tìm kiếm
          </Text>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Status Filter */}
          <div className="flex flex-col gap-2">
            <Text className="text-sm text-gray-600 font-medium">Trạng thái</Text>
            <Select
              placeholder="Tất cả trạng thái"
              allowClear
              value={filters.status || undefined}
              onChange={handleStatusChange}
              className="w-full"
              size="large"
            >
              <Option value="">Tất cả</Option>
              <Option value="PENDING">
                <Tag color="orange" className="!m-0">
                  Chờ xử lý
                </Tag>
              </Option>
              <Option value="COMPLETED">
                <Tag color="green" className="!m-0">
                  Hoàn thành
                </Tag>
              </Option>
              <Option value="CANCELLED">
                <Tag color="red" className="!m-0">
                  Đã hủy
                </Tag>
              </Option>
            </Select>
          </div>

          {/* Date Filter */}
          <div className="flex flex-col gap-2">
            <Text className="text-sm text-gray-600 font-medium">Ngày kê đơn</Text>
            <DatePicker
              placeholder="Chọn ngày"
              format="DD/MM/YYYY"
              value={
                filters.date && filters.date !== "" && dayjs(filters.date, "YYYY-MM-DD").isValid()
                  ? dayjs(filters.date, "YYYY-MM-DD")
                  : null
              }
              onChange={handleDateChange}
              className="w-full"
              size="large"
              allowClear
            />
          </div>

          {/* Reset Button */}
          <div className="flex flex-col gap-2">
            <Text className="text-sm text-gray-600 font-medium opacity-0">Action</Text>
            <Button
              icon={<FaRedo />}
              size="large"
              onClick={handleResetFilters}
              className="w-full !h-10"
            >
              Đặt lại bộ lọc
            </Button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center min-h-[400px]">
          <Spin size="large" tip="Đang tải toa thuốc..." />
        </div>
      )}

      {/* Empty State */}
      {!loading && prescriptions.length === 0 && (
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center px-4">
          {/* Icon animation */}
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-blue-100 rounded-full animate-pulse"></div>
            <div className="relative bg-gradient-to-br from-blue-50 to-blue-100 rounded-full p-10">
              <FaPrescriptionBottle className="text-blue-400 text-6xl" />
            </div>
          </div>

          {/* Text content */}
          <Title level={4} className="!mb-2 text-gray-800">
            Chưa có toa thuốc
          </Title>
          <Text className="text-gray-500 text-base mb-6 max-w-md">
            Bạn chưa có toa thuốc nào. Hãy đặt lịch khám với bác sĩ để được kê đơn thuốc phù hợp.
          </Text>

          {/* Action button */}
          <Button
            type="primary"
            size="large"
            icon={<FaUserMd />}
            onClick={() => router.push("/booking")}
            className="!h-11 !px-6 !bg-gradient-to-r !from-blue-500 !to-blue-600 hover:!from-blue-600 hover:!to-green-700"
          >
            Đặt lịch khám ngay
          </Button>
        </div>
      )}

      {/* Prescriptions List */}
      {!loading && prescriptions.length > 0 && (
        <div className="grid grid-cols-1 gap-4">
          {prescriptions.map((prescription) => (
            <PrescriptionCard key={prescription.prescription_id} prescription={prescription} />
          ))}
        </div>
      )}
    </div>
  );
}
