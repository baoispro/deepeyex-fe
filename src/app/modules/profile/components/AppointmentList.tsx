"use client";
import { Typography, Tag, Spin, Button, Modal } from "antd";
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
} from "react-icons/fa";
import { useRouter } from "@/app/shares/locales/navigation";
import { Appointment, statusLabels } from "../../hospital/types/appointment";
import { useUpdateAppointmentStatusMutation } from "../../hospital/hooks/mutations/appointments/use-update-appointment-status.mutation";
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";
import { QueryKeyEnum } from "@/app/shares/enums/queryKey";

dayjs.locale("vi");

const { Title, Text } = Typography;

interface AppointmentListProps {
  appointments: Appointment[];
  loading?: boolean;
}

const statusColors: Record<Appointment["status"], string> = {
  PENDING: "orange",
  CONFIRMED: "blue",
  COMPLETED: "green",
  CANCELLED: "red",
};

const capitalizeWords = (str: string): string => {
  return str
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export default function AppointmentList({ appointments, loading }: AppointmentListProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<{
    id: string;
    code: string;
  } | null>(null);

  const { mutate: updateStatus, isPending: isCancelling } = useUpdateAppointmentStatusMutation({
    onSuccess: () => {
      toast.success("Hủy lịch hẹn thành công!");
      // Refetch appointments list
      queryClient.invalidateQueries({ queryKey: [QueryKeyEnum.Order, "appointments"] });
      setCancellingId(null);
      setShowCancelModal(false);
      setSelectedAppointment(null);
    },
    onError: (err) => {
      toast.error("Hủy lịch hẹn thất bại: " + err.message);
      setCancellingId(null);
    },
  });

  const handleOpenCancelModal = (appointmentId: string, appointmentCode: string) => {
    setSelectedAppointment({ id: appointmentId, code: appointmentCode });
    setShowCancelModal(true);
  };

  const handleConfirmCancel = () => {
    if (selectedAppointment) {
      setCancellingId(selectedAppointment.id);
      updateStatus({
        appointment_id: selectedAppointment.id,
        status: "CANCELLED",
      });
    }
  };

  const handleCloseModal = () => {
    if (!isCancelling) {
      setShowCancelModal(false);
      setSelectedAppointment(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spin size="large" tip="Đang tải lịch hẹn..." />
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] text-center px-4">
        {/* Icon animation */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-purple-100 rounded-full animate-pulse"></div>
          <div className="relative bg-gradient-to-br from-purple-50 to-purple-100 rounded-full p-12">
            <FaCalendarPlus className="text-purple-400 text-7xl" />
          </div>
        </div>

        {/* Text content */}
        <Title level={3} className="!mb-3 text-gray-800">
          Chưa có lịch hẹn khám
        </Title>
        <Text className="text-gray-500 text-lg mb-8 max-w-md">
          Bạn chưa đặt lịch khám nào. Hãy tìm bệnh viện và bác sĩ phù hợp để được tư vấn và điều trị
          chuyên nghiệp.
        </Text>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            type="primary"
            size="large"
            icon={<FaStethoscope />}
            onClick={() => router.push("/booking")}
            className="!h-12 !px-8 !bg-gradient-to-r !from-purple-500 !to-purple-600 hover:!from-purple-600 hover:!to-purple-700"
          >
            Đặt lịch khám ngay
          </Button>
          <Button size="large" onClick={() => router.push("/shop")} className="!h-12 !px-8">
            Mua thuốc
          </Button>
        </div>

        {/* Decorative elements */}
        <div className="mt-12 grid grid-cols-3 gap-4 max-w-md opacity-40">
          <div className="bg-gray-100 rounded-lg p-4 text-center">
            <div className="text-2xl mb-1">🏥</div>
            <Text className="text-xs text-gray-500">Bệnh viện uy tín</Text>
          </div>
          <div className="bg-gray-100 rounded-lg p-4 text-center">
            <div className="text-2xl mb-1">👨‍⚕️</div>
            <Text className="text-xs text-gray-500">Bác sĩ giỏi</Text>
          </div>
          <div className="bg-gray-100 rounded-lg p-4 text-center">
            <div className="text-2xl mb-1">⏰</div>
            <Text className="text-xs text-gray-500">Đặt lịch linh hoạt</Text>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <Title level={4} className="!mb-0">
          📅 Lịch hẹn khám
        </Title>
        <Text className="text-gray-500">Tổng: {appointments.length} lịch hẹn</Text>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {appointments.map((appt) => {
          const timeSlot = appt.time_slots[0];
          const doctor = timeSlot?.doctor;
          const startTime = dayjs(timeSlot?.start_time);
          const endTime = dayjs(timeSlot?.end_time);

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
                    <button
                      onClick={() =>
                        handleOpenCancelModal(appt.appointment_id, appt.appointment_code)
                      }
                      disabled={isCancelling && cancellingId === appt.appointment_id}
                      className="bg-red-500 cursor-pointer text-white px-4 py-2 rounded-md hover:bg-red-600 font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isCancelling && cancellingId === appt.appointment_id
                        ? "Đang hủy..."
                        : "Hủy lịch hẹn"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

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
