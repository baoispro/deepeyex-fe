"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import {
  FaCheckCircle,
  FaCalendarCheck,
  FaUserMd,
  FaClock,
  FaFileAlt,
  FaStethoscope,
  FaTimesCircle,
  FaSpinner,
} from "react-icons/fa";
import dayjs from "dayjs";
import Image from "next/image";
import { useConfirmFollowUpAppointmentMutation } from "@/app/modules/hospital/hooks/mutations/appointments/use-confirm-follow-up-appointment.mutation";
import { toast } from "react-toastify";
import { Appointment } from "@/app/modules/hospital/types/appointment";
import Link from "next/link";

export default function ConfirmAppointmentPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [showAnimation, setShowAnimation] = useState(false);
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const { mutate: confirmAppointment, isPending } = useConfirmFollowUpAppointmentMutation({
    onSuccess: (response) => {
      if (response.data) {
        setAppointment(response.data);
        toast.success("Xác nhận lịch tái khám thành công!");
        setIsConfirming(false);
        setTimeout(() => setShowAnimation(true), 100);
      } else {
        setHasError(true);
        setErrorMessage("Không nhận được dữ liệu từ server");
        setIsConfirming(false);
        setTimeout(() => setShowAnimation(true), 100);
      }
    },
    onError: (error: Error) => {
      setIsConfirming(false);
      setHasError(true);
      const msg =
        // @ts-expect-error - error structure from API may vary
        error?.response?.data?.message || error.message || "Có lỗi xảy ra";
      setErrorMessage(msg);
      setTimeout(() => setShowAnimation(true), 100);
    },
  });

  const handleConfirm = useCallback(() => {
    if (token) {
      setIsConfirming(true);
      confirmAppointment(token);
    } else {
      toast.error("Token không hợp lệ");
    }
  }, [token, confirmAppointment]);

  useEffect(() => {
    handleConfirm();
  }, [handleConfirm]);

  // Hiển thị loading khi đang xác nhận
  if (isConfirming || isPending) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-blue-500 text-6xl mx-auto mb-4" />
          <p className="mt-4 text-lg text-gray-600">Đang xác nhận lịch tái khám...</p>
        </div>
      </div>
    );
  }

  // Hiển thị lỗi nếu có lỗi từ API hoặc không có appointment
  if (hasError || !appointment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div
            className={`bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-700 transform ${
              showAnimation ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
            }`}
          >
            <div className="bg-gradient-to-r from-red-400 to-red-500 px-8 py-12 text-center">
              <div className="inline-block">
                <div className="relative">
                  <FaTimesCircle className="relative text-white text-8xl" />
                </div>
              </div>
              <h1 className="mt-6 text-4xl font-bold text-white">Không thể xác nhận!</h1>
              <p className="mt-3 text-lg text-white/90">
                {errorMessage ||
                  "Không thể xác nhận lịch tái khám. Có thể token đã hết hạn hoặc không hợp lệ."}
              </p>
            </div>
            <div className="px-8 py-8">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/"
                  className="px-8 py-4 bg-white text-gray-700 font-bold rounded-xl shadow-lg hover:shadow-xl border-2 border-gray-200 hover:border-gray-300 transform hover:-translate-y-0.5 transition-all duration-200 text-center"
                >
                  Về trang chủ
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const timeSlots = appointment?.time_slots || [];
  const timeSlot = timeSlots[0];
  const doctor = appointment?.doctor;
  const patient = appointment?.patient;
  const startTime = timeSlot ? dayjs(timeSlot.start_time) : null;
  const endTime = timeSlot ? dayjs(timeSlot.end_time) : null;

  const capitalizeWords = (str: string): string => {
    return str
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Success Animation Card */}
        <div
          className={`bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-700 transform ${
            showAnimation ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
        >
          {/* Header with Icon */}
          <div className="bg-gradient-to-r from-green-400 to-green-500 px-8 py-12 text-center">
            <div className="inline-block">
              <div className="relative">
                <div className="absolute inset-0 bg-white rounded-full animate-ping opacity-20"></div>
                <FaCheckCircle className="relative text-white text-8xl animate-bounce" />
              </div>
            </div>
            <h1 className="mt-6 text-4xl font-bold text-white">
              Xác nhận lịch tái khám thành công!
            </h1>
            <p className="mt-3 text-lg text-white/90">
              Lịch hẹn tái khám của bạn đã được xác nhận thành công
            </p>
          </div>

          {/* Appointment Info */}
          <div className="px-8 py-8">
            <div className="bg-gradient-to-r from-green-50 to-green-50 rounded-xl p-6 mb-8">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FaCalendarCheck className="text-green-500" />
                Thông tin lịch hẹn
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2 bg-white rounded-lg p-3">
                  <span className="text-gray-600 font-medium">Mã lịch hẹn:</span>
                  <span className="text-gray-900 font-bold text-lg">
                    {appointment.appointment_code}
                  </span>
                </div>
                <div className="flex flex-col gap-2 bg-white rounded-lg p-3">
                  <span className="text-gray-600 font-medium">Trạng thái:</span>
                  <span className="text-green-600 font-bold text-lg">ĐÃ XÁC NHẬN</span>
                </div>
                {/* <div className="flex flex-col gap-2 bg-white rounded-lg p-3">
                  <span className="text-gray-600 font-medium">Ngày khám:</span>
                  <span className="text-gray-900 font-bold text-lg">
                    {startTime ? capitalizeWords(startTime.format("dddd, DD/MM/YYYY")) : "N/A"}
                  </span>
                </div>
                <div className="flex flex-col gap-2 bg-white rounded-lg p-3">
                  <span className="text-gray-600 font-medium">Thời gian:</span>
                  <span className="text-gray-900 font-bold text-lg flex items-center gap-2">
                    <FaClock className="text-green-500" />
                    {startTime?.format("HH:mm")} - {endTime?.format("HH:mm")}
                  </span>
                </div> */}
                <div className="flex flex-col gap-2 bg-white rounded-lg p-3 md:col-span-2">
                  <span className="text-gray-600 font-medium">Dịch vụ:</span>
                  <span className="text-blue-600 font-bold text-lg">
                    {appointment.service_name}
                  </span>
                </div>
              </div>
            </div>

            {/* Time Slots Info */}
            {timeSlots.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <FaClock className="text-blue-500" />
                  Chi tiết thời gian khám
                </h2>
                <div className="space-y-3">
                  {timeSlots.map((slot, index) => {
                    const slotStartTime = dayjs(slot.start_time);
                    const slotEndTime = dayjs(slot.end_time);
                    return (
                      <div
                        key={slot.slot_id || index}
                        className="bg-gradient-to-r from-blue-50 to-blue-50 rounded-lg p-4 border border-blue-200"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-800">
                                {slotStartTime.format("DD/MM/YYYY")}
                              </p>
                              <p className="text-sm text-gray-600">
                                {slotStartTime.format("dddd")}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-gray-800 text-lg">
                              {slotStartTime.format("HH:mm")} - {slotEndTime.format("HH:mm")}
                            </p>
                            <p className="text-xs text-gray-500">Sức chứa: {slot.capacity} người</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Doctor Info */}
            {doctor && (
              <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <FaUserMd className="text-green-500" />
                  Thông tin bác sĩ
                </h2>
                <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-lg">
                  <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-green-200">
                    <Image
                      src={doctor.image || "/placeholder-doctor.png"}
                      alt={doctor.full_name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <FaUserMd className="text-green-500" />
                      <p className="text-gray-800 font-bold text-lg">BS. {doctor.full_name}</p>
                    </div>
                    <p className="text-sm text-gray-600">
                      Chuyên khoa: {doctor.specialty === "ophthalmology" ? "Mắt" : doctor.specialty}
                    </p>
                    <p className="text-sm text-gray-600">📞 {doctor.phone}</p>
                    <p className="text-sm text-gray-600">✉️ {doctor.email}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Patient Info */}
            {patient && (
              <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <FaUserMd className="text-blue-500" />
                  Thông tin bệnh nhân
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2 bg-gray-50 p-3 rounded-lg">
                    <span className="text-gray-600 text-sm">Họ và tên:</span>
                    <span className="text-gray-900 font-semibold">{patient.full_name}</span>
                  </div>
                  <div className="flex flex-col gap-2 bg-gray-50 p-3 rounded-lg">
                    <span className="text-gray-600 text-sm">Ngày sinh:</span>
                    <span className="text-gray-900 font-semibold">
                      {dayjs(patient.dob).format("DD/MM/YYYY")}
                    </span>
                  </div>
                  <div className="flex flex-col gap-2 bg-gray-50 p-3 rounded-lg">
                    <span className="text-gray-600 text-sm">Giới tính:</span>
                    <span className="text-gray-900 font-semibold">
                      {patient.gender === "male"
                        ? "Nam"
                        : patient.gender === "female"
                          ? "Nữ"
                          : "Khác"}
                    </span>
                  </div>
                  <div className="flex flex-col gap-2 bg-gray-50 p-3 rounded-lg">
                    <span className="text-gray-600 text-sm">Số điện thoại:</span>
                    <span className="text-gray-900 font-semibold">{patient.phone}</span>
                  </div>
                  <div className="flex flex-col gap-2 bg-gray-50 p-3 rounded-lg md:col-span-2">
                    <span className="text-gray-600 text-sm">Địa chỉ:</span>
                    <span className="text-gray-900 font-semibold">{patient.address}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Notes */}
            {appointment.notes && (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded p-4 mb-8">
                <div className="flex items-start gap-3">
                  <FaFileAlt className="text-yellow-600 text-xl mt-1" />
                  <div>
                    <h3 className="font-bold text-yellow-900 mb-1">Ghi chú:</h3>
                    <p className="text-sm text-yellow-800">{appointment.notes}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Important Info */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8">
              <h3 className="font-bold text-green-900 mb-3 flex items-center gap-2">
                <FaStethoscope className="text-green-600" />
                Lưu ý quan trọng
              </h3>
              <ul className="space-y-2 text-sm text-green-800">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">•</span>
                  <span>Vui lòng đến bệnh viện đúng giờ hẹn: {startTime?.format("HH:mm")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">•</span>
                  <span>Mang theo CMND/CCCD và thẻ BHYT (nếu có)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">•</span>
                  <span>
                    Nếu có thắc mắc, vui lòng liên hệ hotline: {doctor?.phone || "1900-xxx-xxx"}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">•</span>
                  <span>Bạn có thể xem chi tiết lịch hẹn trong mục &quot;Hồ sơ&quot;</span>
                </li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/vi/profile"
                className="px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <FaCalendarCheck />
                Xem lịch hẹn của tôi
              </Link>
              <Link
                href="/"
                className="px-8 py-4 bg-white text-gray-700 font-bold rounded-xl shadow-lg hover:shadow-xl border-2 border-gray-200 hover:border-gray-300 transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2"
              >
                Về trang chủ
              </Link>
            </div>
          </div>
        </div>

        {/* Support Section */}
        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Cần hỗ trợ?{" "}
            <a
              href="mailto:support@deepeyex.com"
              className="text-green-600 hover:underline font-semibold"
            >
              Liên hệ với chúng tôi
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
