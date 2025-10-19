"use client";
import { Typography, Tag, Spin, Button, Modal, Select, DatePicker } from "antd";
import React, { useState } from "react";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import Image from "next/image";
import {
  FaCalendarAlt,
  FaClock,
  FaUserMd,
  FaFileAlt,
  FaCalendarPlus,
  FaStethoscope,
  FaFilter,
  FaRedo,
} from "react-icons/fa";
import { useRouter } from "@/app/shares/locales/navigation";
import { Appointment, statusLabels } from "../../hospital/types/appointment";
import { useCancelAppointmentMutation } from "../../hospital/hooks/mutations/appointments/use-cancel-appointment.mutation";
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";
import { QueryKeyEnum } from "@/app/shares/enums/queryKey";

dayjs.locale("vi");

const { Title, Text } = Typography;
const { Option } = Select;

interface AppointmentFilters {
  status: string;
  date: string;
  sort: string;
}

interface AppointmentListProps {
  appointments: Appointment[];
  loading?: boolean;
  filters: AppointmentFilters;
  onFilterChange: (filters: AppointmentFilters) => void;
}

const statusColors: Record<Appointment["status"], string> = {
  PENDING: "orange",
  CONFIRMED: "blue",
  COMPLETED: "green",
  CANCELLED: "red",
  PENDING_ONLINE: "purple",
  CONFIRMED_ONLINE: "cyan",
  COMPLETED_ONLINE: "teal",
};

const capitalizeWords = (str: string): string => {
  return str
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

interface AxiosErrorResponse {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
}

export default function AppointmentList({
  appointments,
  loading,
  filters,
  onFilterChange,
}: AppointmentListProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<{
    id: string;
    code: string;
  } | null>(null);

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

  const { mutate: cancelAppointment, isPending: isCancelling } = useCancelAppointmentMutation({
    onSuccess: () => {
      toast.success("Hủy chuyến thành công!");
      queryClient.invalidateQueries({ queryKey: [QueryKeyEnum.Order, "appointments"] });
      setCancellingId(null);
      setShowCancelModal(false);
      setSelectedAppointment(null);
    },
    onError: (err: Error) => {
      setCancellingId(null);
      setShowCancelModal(false);
      setSelectedAppointment(null);

      // Kiểm tra lỗi về thời gian
      const axiosError = err as AxiosErrorResponse;
      const errorMessage = axiosError?.response?.data?.message || axiosError?.message || "";

      if (
        errorMessage.toLowerCase().includes("12") ||
        errorMessage.toLowerCase().includes("hour")
      ) {
        toast.error(
          "Không thể hủy lịch hẹn vì thời gian còn lại ít hơn 12 tiếng. Nếu bạn vẫn muốn hủy, vui lòng gọi hotline: 1900-xxx-xxx",
          {
            autoClose: 8000,
          },
        );
      } else {
        toast.error("Hủy lịch hẹn thất bại: " + errorMessage);
      }
    },
  });

  const handleOpenCancelModal = (appointmentId: string, appointmentCode: string) => {
    setSelectedAppointment({ id: appointmentId, code: appointmentCode });
    setShowCancelModal(true);
  };

  const handleConfirmCancel = () => {
    if (selectedAppointment) {
      setCancellingId(selectedAppointment.id);
      cancelAppointment(selectedAppointment.id);
    }
  };

  const handleCloseModal = () => {
    if (!isCancelling) {
      setShowCancelModal(false);
      setSelectedAppointment(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <Title level={4} className="!mb-0">
          📅 Lịch hẹn khám
        </Title>
        <Text className="text-gray-500">Tổng: {appointments.length} lịch hẹn</Text>
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
                  Chờ xác nhận
                </Tag>
              </Option>
              <Option value="CONFIRMED">
                <Tag color="blue" className="!m-0">
                  Đã xác nhận
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
              <Option value="PENDING_ONLINE">
                <Tag color="blue" className="!m-0">
                  Chờ xác nhận (Online)
                </Tag>
              </Option>
              <Option value="CONFIRMED_ONLINE">
                <Tag color="cyan" className="!m-0">
                  Đã xác nhận (Online)
                </Tag>
              </Option>
              <Option value="COMPLETED_ONLINE">
                <Tag color="teal" className="!m-0">
                  Hoàn thành (Online)
                </Tag>
              </Option>
            </Select>
          </div>

          {/* Date Filter */}
          <div className="flex flex-col gap-2">
            <Text className="text-sm text-gray-600 font-medium">Ngày khám</Text>
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
          <Spin size="large" tip="Đang tải lịch hẹn..." />
        </div>
      )}

      {/* Empty State */}
      {!loading && appointments.length === 0 && (
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center px-4">
          {/* Icon animation */}
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-blue-100 rounded-full animate-pulse"></div>
            <div className="relative bg-gradient-to-br from-blue-50 to-blue-100 rounded-full p-10">
              <FaCalendarPlus className="text-blue-400 text-6xl" />
            </div>
          </div>

          {/* Text content */}
          <Title level={4} className="!mb-2 text-gray-800">
            Chưa có lịch hẹn khám
          </Title>
          <Text className="text-gray-500 text-base mb-6 max-w-md">
            Bạn chưa đặt lịch khám nào. Hãy tìm bệnh viện và bác sĩ phù hợp để được tư vấn và điều
            trị chuyên nghiệp.
          </Text>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              type="primary"
              size="large"
              icon={<FaStethoscope />}
              onClick={() => router.push("/booking")}
              className="!h-11 !px-6 !bg-gradient-to-r !from-blue-500 !to-blue-600 hover:!from-blue-600 hover:!to-blue-700"
            >
              Đặt lịch khám ngay
            </Button>
            <Button size="large" onClick={() => router.push("/shop")} className="!h-11 !px-6">
              Mua thuốc
            </Button>
          </div>
        </div>
      )}

      {/* Appointments List */}
      {!loading && appointments.length > 0 && (
        <div className="grid grid-cols-1 gap-4">
          {appointments.map((appt) => {
            const timeSlot = appt.time_slots[0];
            const doctor = timeSlot?.doctor;
            const startTime = dayjs(timeSlot?.start_time);
            const endTime = dayjs(timeSlot?.end_time);
            const currentTime = dayjs();

            // Kiểm tra xem đã qua thời gian khám chưa
            const isPastAppointment = currentTime.isAfter(startTime);

            // Kiểm tra có thể hủy không (chưa qua giờ khám và status là PENDING)
            const canCancel = appt.status === "PENDING" && !isPastAppointment;

            return (
              <div
                key={appt.appointment_id}
                className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow duration-300 bg-white"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-50 p-3 rounded-full">
                      <FaCalendarAlt className="text-blue-500 text-xl" />
                    </div>
                    <div>
                      <Text strong className="!text-base block">
                        {capitalizeWords(startTime.format("dddd, DD/MM/YYYY"))}
                      </Text>
                      <div className="flex items-center gap-2 text-gray-600 mt-1">
                        <FaClock className="text-sm" />
                        <Text className="!text-sm">
                          {startTime.format("HH:mm")} - {endTime.format("HH:mm")}
                        </Text>
                      </div>
                    </div>
                  </div>

                  <Tag color={statusColors[appt.status]} className="text-sm px-3 py-1">
                    {statusLabels[appt.status].label}
                  </Tag>
                </div>

                <div className="border-t border-gray-100 pt-4 space-y-3">
                  {/* Mã lịch hẹn */}
                  <div className="flex items-center gap-2">
                    <FaFileAlt className="text-gray-400" />
                    <Text className="text-gray-600 !text-base">
                      <strong>Mã lịch hẹn:</strong>{" "}
                      <span className="text-blue-600">{appt.appointment_code}</span>
                    </Text>
                  </div>
                  {appt.service_name && (
                    <div className="flex items-center gap-2">
                      <FaStethoscope className="text-gray-400" />
                      <Text className="text-gray-600 !text-base">
                        <strong>Dịch vụ:</strong> {appt.service_name}
                      </Text>
                    </div>
                  )}

                  {/* Thông tin bác sĩ */}
                  {doctor && (
                    <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
                      <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-blue-200">
                        <Image
                          src={doctor.image || "/placeholder-doctor.png"}
                          alt={doctor.full_name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <FaUserMd className="text-blue-500" />
                          <Text strong className="text-gray-800">
                            BS. {doctor.full_name}
                          </Text>
                        </div>
                        <Text className="text-sm text-gray-500 block">
                          {doctor.specialty === "ophthalmology"
                            ? "Chuyên khoa Mắt"
                            : doctor.specialty}
                        </Text>
                      </div>
                      <div className="text-right">
                        <Text className="text-xs text-gray-500 block">📞 Liên hệ</Text>
                        <Text className="text-sm text-blue-600">{doctor.phone}</Text>
                      </div>
                    </div>
                  )}

                  {/* Ghi chú */}
                  {appt.notes && (
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded">
                      <Text className="text-sm">
                        <strong>📝 Ghi chú:</strong> {appt.notes}
                      </Text>
                    </div>
                  )}

                  {/* Footer với thời gian tạo */}
                  <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                    <Text className="text-xs text-gray-400">
                      Đặt lúc: {dayjs(appt.created_at).format("DD/MM/YYYY HH:mm")}
                    </Text>
                    {appt.status === "PENDING" && (
                      <div className="flex flex-col items-end gap-1">
                        <button
                          onClick={() =>
                            handleOpenCancelModal(appt.appointment_id, appt.appointment_code)
                          }
                          disabled={
                            !canCancel || (isCancelling && cancellingId === appt.appointment_id)
                          }
                          className="bg-red-500 cursor-pointer text-white px-4 py-2 rounded-md hover:bg-red-600 font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title={
                            isPastAppointment
                              ? "Không thể hủy lịch hẹn đã qua thời gian khám"
                              : "Hủy lịch hẹn"
                          }
                        >
                          {isCancelling && cancellingId === appt.appointment_id
                            ? "Đang hủy..."
                            : "Hủy lịch hẹn"}
                        </button>
                        {isPastAppointment && (
                          <Text className="text-xs text-red-500">Đã qua thời gian khám</Text>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal xác nhận hủy lịch */}
      <Modal
        title="Xác nhận hủy lịch hẹn"
        open={showCancelModal}
        onOk={handleConfirmCancel}
        onCancel={handleCloseModal}
        okText="Xác nhận"
        cancelText="Đóng"
        okButtonProps={{ danger: true, loading: isCancelling }}
        cancelButtonProps={{ disabled: isCancelling }}
      >
        <p>
          Bạn có chắc chắn muốn hủy lịch hẹn <strong>{selectedAppointment?.code}</strong>?
        </p>
        <p className="text-gray-500 text-sm mt-2">
          Lưu ý: Sau khi hủy, bạn sẽ không thể hoàn tác thao tác này.
        </p>
      </Modal>
    </div>
  );
}
