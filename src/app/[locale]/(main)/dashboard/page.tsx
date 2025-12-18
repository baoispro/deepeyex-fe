"use client";

import { useMemo } from "react";
import { FaCalendarAlt, FaStethoscope, FaPills, FaBell, FaArrowRight } from "react-icons/fa";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi";
import Image from "next/image";
import Link from "next/link";
import { Spin } from "antd";
import { useAppSelector } from "@/app/shares/stores";
import { useGetAppointmentsByPatientId } from "@/app/modules/hospital/hooks/queries/appointment/use-get-appointments.query";
import { useGetNotificationsByUserQuery } from "@/app/modules/hospital/hooks/queries/notification/use-get-all-notification.query";
import { useGetAIDiagnosisByPatientId } from "@/app/modules/hospital/hooks/queries/aidiagnosis/use-get-aidiagnosis-by-patient.query";
import { useGetMedicationRemindersByPatientId } from "@/app/modules/hospital/hooks/queries/medication-reminder/use-get-medication-reminders-by-patient.query";
import { MedicationReminderApi } from "@/app/modules/hospital/apis/medication-reminder/medicationReminderApi";
import { AIDiagnosis } from "@/app/modules/hospital/apis/aidiagnosis/types/aidiagnosis";

dayjs.extend(relativeTime);
dayjs.locale("vi");

export default function PatientDashboard() {
  const auth = useAppSelector((state) => state.auth);
  const patientId = auth.patient?.patientId;
  const userId = auth.userId;
  const today = dayjs().format("YYYY-MM-DD");

  // Fetch appointments
  const { data: appointmentsData, isLoading: isLoadingAppointments } =
    useGetAppointmentsByPatientId(patientId || undefined, {
      date: today,
      sort: "newest",
    });

  // Fetch notifications
  const { data: notificationsData, isLoading: isLoadingNotifications } =
    useGetNotificationsByUserQuery(userId || "");

  // Fetch AI diagnoses
  const { data: aiDiagnosesData, isLoading: isLoadingDiagnoses } = useGetAIDiagnosisByPatientId(
    patientId || undefined,
  );

  // Fetch medication reminders
  const { data: medicationRemindersData, isLoading: isLoadingMedications } =
    useGetMedicationRemindersByPatientId(patientId || undefined);

  // Process appointments for today
  const appointmentsToday = useMemo(() => {
    if (!appointmentsData?.data) return [];
    return appointmentsData.data.filter((appt) => {
      const firstSlot = appt.time_slots?.[0];
      if (!firstSlot) return false;
      const appointmentDate = dayjs(firstSlot.start_time).format("YYYY-MM-DD");
      return appointmentDate === today;
    });
  }, [appointmentsData, today]);

  // Process AI diagnoses - map to MedicalRecord-like format
  const recentDiagnoses = useMemo(() => {
    if (!aiDiagnosesData || !Array.isArray(aiDiagnosesData)) return [];
    return aiDiagnosesData
      .map((diagnosisResponse) => {
        // API returns array, handle both ApiResponse<AIDiagnosis> and AIDiagnosis formats
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const responseAny = diagnosisResponse as any;
        const diagnosis: AIDiagnosis = responseAny.data || responseAny;
        return {
          record_id: diagnosis.record_id || "",
          diagnosis: diagnosis.disease_code || "Chưa có chẩn đoán",
          notes: diagnosis.notes || "",
          created_at: diagnosis.created_at || "",
          patient_id: diagnosis.patient_id || "",
          appointment_id: "",
          doctor_id: diagnosis.verified_by || "",
        };
      })
      .sort((a, b) => dayjs(b.created_at).valueOf() - dayjs(a.created_at).valueOf());
  }, [aiDiagnosesData]);

  // Process medication reminders
  const medications = useMemo(() => {
    if (!medicationRemindersData?.data) return [];
    const now = dayjs();
    return medicationRemindersData.data.map((med) => {
      // Parse reminder_time từ ISO datetime string
      const reminderDateTime = dayjs(med.reminder_time);
      const isUpcoming = reminderDateTime.isAfter(now);
      const isToday = reminderDateTime.format("YYYY-MM-DD") === today;
      const isTomorrow =
        reminderDateTime.format("YYYY-MM-DD") === dayjs().add(1, "day").format("YYYY-MM-DD");

      // Format ngày hiển thị
      let dateDisplay = "";
      if (isToday) {
        dateDisplay = "Hôm nay";
      } else if (isTomorrow) {
        dateDisplay = "Ngày mai";
      } else {
        dateDisplay = reminderDateTime.format("DD/MM/YYYY");
      }

      return {
        id: med.id,
        name: med.drug_name,
        time: reminderDateTime.format("h:mm A"),
        date: dateDisplay,
        dateTime: reminderDateTime.format("YYYY-MM-DD"),
        instruction: med.notes || "",
        taken: med.status === "DONE",
        isUpcoming,
      };
    });
  }, [medicationRemindersData, today]);

  // Process notifications
  const notifications = useMemo(() => {
    if (!notificationsData?.data) return [];
    return notificationsData.data.slice(0, 3).map((notif) => {
      let color = "blue";
      if (
        notif.title.toLowerCase().includes("chẩn đoán") ||
        notif.title.toLowerCase().includes("diagnosis")
      ) {
        color = "green";
      } else if (
        notif.title.toLowerCase().includes("thuốc") ||
        notif.title.toLowerCase().includes("medication")
      ) {
        color = "orange";
      }
      return {
        id: notif.id,
        title: notif.title,
        message: notif.message,
        time: dayjs(notif.createdAt).fromNow(),
        color,
      };
    });
  }, [notificationsData]);

  // Kiểm tra hôm nay đã chẩn đoán chưa
  const hasDiagnosisToday = recentDiagnoses.some((record) => {
    return dayjs(record.created_at).format("YYYY-MM-DD") === today;
  });

  const handleMarkMedicationTaken = async (id: string) => {
    try {
      await MedicationReminderApi.markTaken(id);
      // Refetch sẽ tự động cập nhật UI
    } catch (error) {
      console.error("Error marking medication as taken:", error);
    }
  };

  const getColorClasses = (color: string) => {
    const colors = {
      blue: "border-blue-500 bg-blue-50",
      green: "border-green-500 bg-green-50",
      orange: "border-orange-500 bg-orange-50",
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Bảng điều khiển</h1>
              <p className="text-gray-600 mt-2">Xin chào!</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cột trái - Lịch khám hôm nay và Chẩn đoán */}
          <div className="lg:col-span-2 space-y-6">
            {/* Lịch khám hôm nay */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FaCalendarAlt className="text-blue-500 text-xl" />
                  <h2 className="text-xl font-bold text-gray-800">Lịch khám hôm nay</h2>
                </div>
                {appointmentsToday.length > 0 && (
                  <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm font-semibold">
                    {appointmentsToday.length} lịch hẹn
                  </span>
                )}
              </div>

              {isLoadingAppointments ? (
                <div className="flex justify-center py-8">
                  <Spin size="large" />
                </div>
              ) : appointmentsToday.length === 0 ? (
                <div className="text-center py-8">
                  <FaCalendarAlt className="text-gray-300 text-6xl mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">Hôm nay không có lịch khám nào</p>
                  <Link
                    href="/booking"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Đặt lịch khám <FaArrowRight />
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {appointmentsToday.map((appt) => {
                    const timeSlot = appt?.time_slots?.[0];
                    const startTime = timeSlot ? dayjs(timeSlot.start_time) : null;
                    const endTime = timeSlot ? dayjs(timeSlot.end_time) : null;

                    return (
                      <div
                        key={appt.appointment_id}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            {appt.doctor?.image && (
                              <div className="relative w-12 h-12 rounded-full overflow-hidden">
                                <Image
                                  src={appt.doctor.image}
                                  alt={appt.doctor.full_name}
                                  width={48}
                                  height={48}
                                  className="object-cover"
                                />
                              </div>
                            )}
                            <div>
                              <p className="font-semibold text-gray-900">
                                BS. {appt.doctor?.full_name || "N/A"}
                              </p>
                              <p className="text-sm text-gray-600">
                                {appt.service_name || "Khám bệnh"}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-blue-600">
                              {startTime?.format("HH:mm")} - {endTime?.format("HH:mm")}
                            </p>
                            <p className="text-xs text-gray-500">{appt.appointment_code}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Chẩn đoán gần đây */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FaStethoscope className="text-green-500 text-xl" />
                  <h2 className="text-xl font-bold text-gray-800">Chẩn đoán gần đây</h2>
                </div>
                <Link
                  href="/profile"
                  className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                >
                  Xem tất cả <FaArrowRight className="text-xs" />
                </Link>
              </div>

              {isLoadingDiagnoses ? (
                <div className="flex justify-center py-8">
                  <Spin size="large" />
                </div>
              ) : recentDiagnoses.length === 0 ? (
                <div className="text-center py-8 bg-gradient-to-br from-blue-50 to-green-50 rounded-lg border-2 border-dashed border-gray-300">
                  <FaStethoscope className="text-green-300 text-6xl mx-auto mb-4" />
                  <p className="text-gray-700 font-semibold mb-2">Chưa có lịch sử chẩn đoán</p>
                  <p className="text-gray-600 text-sm mb-4">
                    Hãy chẩn đoán ngay để theo dõi tình hình mắt
                  </p>
                  <Link
                    href="/predict"
                    className="inline-flex items-center gap-2 px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-semibold"
                  >
                    Chẩn đoán ngay <FaArrowRight />
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentDiagnoses.slice(0, 3).map((record) => (
                    <div
                      key={record.record_id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900 mb-1">
                            {record.diagnosis || "Chưa có chẩn đoán"}
                          </p>
                          <p className="text-sm text-gray-600 mb-2">{record.notes}</p>
                          <p className="text-xs text-gray-500">
                            {dayjs(record.created_at).format("DD/MM/YYYY HH:mm")}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Thông báo nếu hôm nay chưa chẩn đoán */}
                  {!hasDiagnosisToday && (
                    <div className="mt-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <FaStethoscope className="text-yellow-600 text-2xl mt-1" />
                        <div className="flex-1">
                          <p className="font-semibold text-yellow-900 mb-1">
                            Chưa chẩn đoán hôm nay
                          </p>
                          <p className="text-sm text-yellow-800 mb-3">
                            Bạn chưa chẩn đoán gì hôm nay. Hãy chẩn đoán ngay để theo dõi tình hình
                            mắt của bạn.
                          </p>
                          <Link
                            href="/predict"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors text-sm font-semibold"
                          >
                            Chẩn đoán ngay <FaArrowRight />
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Timeline chẩn đoán */}
            {recentDiagnoses.length > 0 && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center gap-2 mb-4">
                  <FaStethoscope className="text-purple-500 text-xl" />
                  <h2 className="text-xl font-bold text-gray-800">Dòng thời gian chẩn đoán</h2>
                </div>
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-500 to-blue-500"></div>

                  {/* Timeline items */}
                  <div className="space-y-4 relative">
                    {recentDiagnoses.map((record, index) => (
                      <div key={record.record_id} className="flex items-start gap-4 relative">
                        {/* Dot */}
                        <div className="relative z-10 flex-shrink-0">
                          <div className="w-8 h-8 bg-purple-500 rounded-full border-4 border-white shadow-md flex items-center justify-center">
                            <span className="text-white text-xs font-bold">{index + 1}</span>
                          </div>
                        </div>
                        {/* Content */}
                        <div className="flex-1 bg-gray-50 rounded-lg p-4">
                          <p className="font-semibold text-gray-900 mb-1">
                            {record.diagnosis || "Chẩn đoán"}
                          </p>
                          <p className="text-sm text-gray-600 mb-2">{record.notes}</p>
                          <p className="text-xs text-gray-500">
                            {dayjs(record.created_at).format("DD/MM/YYYY HH:mm")}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Cột phải - Nhắc uống thuốc & Thông báo */}
          <div className="space-y-6">
            {/* Nhắc uống thuốc */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center gap-2 mb-4">
                <FaPills className="text-orange-500 text-xl" />
                <h2 className="text-xl font-bold text-gray-800">Nhắc uống thuốc</h2>
              </div>
              {isLoadingMedications ? (
                <div className="flex justify-center py-8">
                  <Spin size="large" />
                </div>
              ) : medications.length === 0 ? (
                <div className="text-center py-8">
                  <FaPills className="text-gray-300 text-6xl mx-auto mb-4" />
                  <p className="text-gray-600">Không có nhắc nhở uống thuốc</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {medications.map((med) => (
                    <div
                      key={med.id}
                      className={`${
                        med.isUpcoming ? "opacity-50 bg-gray-50" : "bg-orange-50"
                      } border border-orange-200 rounded-lg p-4`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p
                          className={`font-semibold ${med.isUpcoming ? "text-gray-600" : "text-orange-900"}`}
                        >
                          {med.name}
                        </p>
                        <div className="flex flex-col items-end gap-1">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-xs text-white px-2 py-1 rounded-full ${
                                med.isUpcoming ? "bg-gray-400" : "bg-orange-500"
                              }`}
                            >
                              {med.time}
                            </span>
                            <span
                              className={`text-xs ${
                                med.isUpcoming ? "text-gray-500" : "text-orange-600"
                              } font-medium`}
                            >
                              {med.date}
                            </span>
                          </div>
                        </div>
                      </div>
                      <p
                        className={`text-sm mb-2 ${med.isUpcoming ? "text-gray-600" : "text-orange-800"}`}
                      >
                        {med.instruction}
                      </p>
                      {med.taken ? (
                        <p className="text-xs text-green-600 font-semibold">✓ Đã uống thuốc</p>
                      ) : !med.isUpcoming ? (
                        <button
                          onClick={() => handleMarkMedicationTaken(med.id)}
                          className="text-xs text-orange-600 hover:text-orange-700 font-semibold"
                        >
                          Chưa uống
                        </button>
                      ) : (
                        <p className="text-xs text-gray-500 font-semibold">Chưa đến giờ</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Thông báo */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FaBell className="text-red-500 text-xl" />
                  <h2 className="text-xl font-bold text-gray-800">Thông báo</h2>
                </div>
                <Link
                  href="/notification"
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Xem tất cả
                </Link>
              </div>
              {isLoadingNotifications ? (
                <div className="flex justify-center py-8">
                  <Spin size="large" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-8">
                  <FaBell className="text-gray-300 text-6xl mx-auto mb-4" />
                  <p className="text-gray-600">Không có thông báo</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`border-l-4 rounded p-3 ${getColorClasses(notif.color)}`}
                    >
                      <p className="text-sm font-semibold text-gray-900 mb-1">{notif.title}</p>
                      <p className="text-xs text-gray-600">{notif.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{notif.time}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
