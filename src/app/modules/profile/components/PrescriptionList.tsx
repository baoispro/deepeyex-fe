"use client";
import { Typography, Tag, Spin, Button, Select, DatePicker, Card, Collapse } from "antd";
import React from "react";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import {
  FaPrescriptionBottle,
  FaPills,
  FaClock,
  FaCalendarDay,
  FaFilter,
  FaRedo,
  FaUserMd,
  FaRobot,
} from "react-icons/fa";
import { useRouter } from "@/app/shares/locales/navigation";
import {
  Prescription,
  prescriptionStatusLabels,
  prescriptionSourceLabels,
} from "../../hospital/types/prescription";

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
          {prescriptions.map((prescription) => {
            const createdDate = dayjs(prescription.CreatedAt);
            const sourceIcon = prescription.source === "DOCTOR" ? <FaUserMd /> : <FaRobot />;

            return (
              <Card
                key={prescription.prescription_id}
                className="hover:shadow-lg transition-shadow duration-300 border-2 border-gray-200"
              >
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

                  <Tag
                    color={prescriptionStatusLabels[prescription.status].color}
                    className="text-sm px-3 py-1"
                  >
                    {prescriptionStatusLabels[prescription.status].label}
                  </Tag>
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
                                        <strong>Từ:</strong>{" "}
                                        {dayjs(item.start_date).format("DD/MM/YYYY")} -{" "}
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
            );
          })}
        </div>
      )}
    </div>
  );
}
