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
import { Prescription, prescriptionStatusLabels } from "../../hospital/types/prescription";
import { useTranslations } from "next-intl";

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
  const t = useTranslations("home");
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
          💊 {t("profile.prescriptionList.title")}
        </Title>
        <Text className="text-gray-500">
          {t("profile.prescriptionList.total", { count: prescriptions.length })}
        </Text>
      </div>

      {/* Filters Section */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-50 p-5 rounded-xl border border-blue-100">
        <div className="flex items-center gap-2 mb-4">
          <FaFilter className="text-blue-600" />
          <Text strong className="text-gray-700">
            {t("profile.prescriptionList.filters.title")}
          </Text>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Status Filter */}
          <div className="flex flex-col gap-2">
            <Text className="text-sm text-gray-600 font-medium">
              {t("profile.prescriptionList.filters.status")}
            </Text>
            <Select
              placeholder={t("profile.prescriptionList.filters.allStatus")}
              allowClear
              value={filters.status || undefined}
              onChange={handleStatusChange}
              className="w-full"
              size="large"
            >
              <Option value="">{t("profile.prescriptionList.filters.all")}</Option>
              <Option value="PENDING">
                <Tag color="orange" className="!m-0">
                  {t("profile.prescriptionList.status.PENDING")}
                </Tag>
              </Option>
              <Option value="APPROVED">
                <Tag color="green" className="!m-0">
                  {t("profile.prescriptionList.status.APPROVED")}
                </Tag>
              </Option>
              <Option value="CANCELLED">
                <Tag color="red" className="!m-0">
                  {t("profile.prescriptionList.status.CANCELLED")}
                </Tag>
              </Option>
            </Select>
          </div>

          {/* Date Filter */}
          <div className="flex flex-col gap-2">
            <Text className="text-sm text-gray-600 font-medium">
              {t("profile.prescriptionList.filters.date")}
            </Text>
            <DatePicker
              placeholder={t("profile.prescriptionList.filters.selectDate")}
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
              {t("profile.prescriptionList.filters.reset")}
            </Button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center min-h-[400px]">
          <Spin size="large" tip={t("profile.prescriptionList.loading")} />
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
            {t("profile.prescriptionList.empty.title")}
          </Title>
          <Text className="text-gray-500 text-base mb-6 max-w-md">
            {t("profile.prescriptionList.empty.description")}
          </Text>

          {/* Action button */}
          <Button
            type="primary"
            size="large"
            icon={<FaUserMd />}
            onClick={() => router.push("/booking")}
            className="!h-11 !px-6 !bg-gradient-to-r !from-blue-500 !to-blue-600 hover:!from-blue-600 hover:!to-green-700"
          >
            {t("profile.prescriptionList.empty.bookNow")}
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
                        {t(`profile.prescriptionList.source.${prescription.source}`)}
                      </Text>
                      <Text className="text-sm text-gray-500">
                        {createdDate.format("DD/MM/YYYY HH:mm")}
                      </Text>
                    </div>
                  </div>

                  <Tag
                    color={prescriptionStatusLabels[prescription.status]?.color || "default"}
                    className="text-sm px-3 py-1"
                  >
                    {t(`profile.prescriptionList.status.${prescription.status}`) ||
                      prescriptionStatusLabels[prescription.status]?.label ||
                      prescription.status}
                  </Tag>
                </div>

                {/* Description */}
                {prescription.description && (
                  <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded mb-4">
                    <Text className="text-sm">
                      <strong>📝 {t("profile.prescriptionList.card.note")}</strong>{" "}
                      {prescription.description}
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
                            {t("profile.prescriptionList.card.details", {
                              count: prescription.items.length,
                            })}
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
                                        <strong>{t("profile.prescriptionList.card.dosage")}</strong>{" "}
                                        {item.dosage}
                                      </Text>
                                    </div>

                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                      <FaClock className="text-blue-500" />
                                      <Text>
                                        <strong>
                                          {t("profile.prescriptionList.card.frequency")}
                                        </strong>{" "}
                                        {item.frequency}
                                      </Text>
                                    </div>

                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                      <FaCalendarDay className="text-purple-500" />
                                      <Text>
                                        <strong>
                                          {t("profile.prescriptionList.card.duration")}
                                        </strong>{" "}
                                        {item.duration_days}{" "}
                                        {t("profile.prescriptionList.card.days")}
                                      </Text>
                                    </div>

                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                      <FaCalendarDay className="text-orange-500" />
                                      <Text>
                                        <strong>{t("profile.prescriptionList.card.from")}</strong>{" "}
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
