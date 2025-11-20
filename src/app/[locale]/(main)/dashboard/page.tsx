"use client";

import { useState } from "react";
import { useRouter } from "@/app/shares/locales/navigation";
import { FaCalendarAlt, FaStethoscope, FaPills, FaBell, FaArrowRight } from "react-icons/fa";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import Image from "next/image";
import Link from "next/link";
import Avatar from "react-avatar";
import { useTranslations } from "next-intl";

dayjs.locale("vi");

// Mock data
const mockAppointmentsToday = [
  {
    appointment_id: "1",
    appointment_code: "APPT-001",
    doctor: {
      full_name: "Nguyễn Văn An",
      image:
        "https://deepeyex-admin.s3.ap-southeast-1.amazonaws.com/doctors/a03fc991-c81c-4887-8412-dab5aa643e53.webp",
      specialty: "ophthalmology",
    },
    service_name: "Khám tổng quát",
    time_slots: [
      {
        start_time: dayjs().hour(14).minute(0).toISOString(),
        end_time: dayjs().hour(14).minute(30).toISOString(),
      },
    ],
  },
  {
    appointment_id: "2",
    appointment_code: "APPT-002",
    doctor: {
      full_name: "Trần Thị Bình",
      image:
        "https://deepeyex-admin.s3.ap-southeast-1.amazonaws.com/doctors/a03fc991-c81c-4887-8412-dab5aa643e53.webp",
      specialty: "ophthalmology",
    },
    service_name: "Kiểm tra mắt",
    time_slots: [
      {
        start_time: dayjs().hour(16).minute(0).toISOString(),
        end_time: dayjs().hour(16).minute(30).toISOString(),
      },
    ],
  },
];

const mockRecentDiagnosis = [
  {
    record_id: "1",
    diagnosis: "Viêm kết mạc (Đau mắt đỏ)",
    notes: "Cần điều trị bằng thuốc nhỏ mắt",
    created_at: dayjs().subtract(1, "day").toISOString(),
    patient_id: "p1",
    appointment_id: "a1",
    doctor_id: "d1",
  },
  {
    record_id: "2",
    diagnosis: "Khô mắt",
    notes: "Bổ sung nước mắt nhân tạo",
    created_at: dayjs().subtract(3, "days").toISOString(),
    patient_id: "p1",
    appointment_id: "a2",
    doctor_id: "d2",
  },
  {
    record_id: "3",
    diagnosis: "Mắt bình thường",
    notes: "Không có dấu hiệu bất thường",
    created_at: dayjs().subtract(5, "days").toISOString(),
    patient_id: "p1",
    appointment_id: "a3",
    doctor_id: "d3",
  },
  {
    record_id: "4",
    diagnosis: "Chắp / Lẹo",
    notes: "Chườm nóng, vệ sinh mắt",
    created_at: dayjs().subtract(7, "days").toISOString(),
    patient_id: "p1",
    appointment_id: "a4",
    doctor_id: "d4",
  },
];

const mockMedications = [
  {
    id: "1",
    name: "Thuốc nhỏ mắt",
    time: "9:00 AM",
    instruction: "1 lần, nhỏ 2 giọt mỗi bên mắt",
    taken: true,
  },
  {
    id: "2",
    name: "Vitamin A",
    time: "12:00 PM",
    instruction: "1 viên sau khi ăn trưa",
    taken: false,
  },
  {
    id: "3",
    name: "Kháng sinh",
    time: "6:00 PM",
    instruction: "1 viên với nước",
    taken: false,
    isUpcoming: true,
  },
];

const mockNotifications = [
  {
    id: "1",
    type: "appointment",
    title: "Lịch khám tới",
    message: "Bạn có lịch khám vào ngày mai lúc 14:00",
    time: "2 giờ trước",
    color: "blue",
  },
  {
    id: "2",
    type: "diagnosis",
    title: "Chẩn đoán mới",
    message: "Kết quả chẩn đoán của bạn đã sẵn sàng",
    time: "5 giờ trước",
    color: "green",
  },
  {
    id: "3",
    type: "medication",
    title: "Nhắc uống thuốc",
    message: "Đừng quên uống thuốc sau bữa ăn",
    time: "1 ngày trước",
    color: "orange",
  },
];

export default function PatientDashboard() {
  const t = useTranslations("home");
  const router = useRouter();
  const [medications, setMedications] = useState(mockMedications);
  const today = dayjs().format("YYYY-MM-DD");

  // Kiểm tra hôm nay đã chẩn đoán chưa
  const hasDiagnosisToday = mockRecentDiagnosis.some((record) => {
    return dayjs(record.created_at).format("YYYY-MM-DD") === today;
  });

  const handleMarkMedicationTaken = (id: string) => {
    setMedications((prev) => prev.map((med) => (med.id === id ? { ...med, taken: true } : med)));
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
              <h1 className="text-3xl font-bold text-gray-900">{t("dashboard.title")}</h1>
              <p className="text-gray-600 mt-2">{t("dashboard.greeting")}</p>
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
                  <h2 className="text-xl font-bold text-gray-800">
                    {t("dashboard.todayAppointments.title")}
                  </h2>
                </div>
                {mockAppointmentsToday.length > 0 && (
                  <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm font-semibold">
                    {mockAppointmentsToday.length} {t("dashboard.todayAppointments.appointments")}
                  </span>
                )}
              </div>

              {mockAppointmentsToday.length === 0 ? (
                <div className="text-center py-8">
                  <FaCalendarAlt className="text-gray-300 text-6xl mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">
                    {t("dashboard.todayAppointments.noAppointments")}
                  </p>
                  <Link
                    href="/booking"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    {t("dashboard.todayAppointments.bookAppointment")} <FaArrowRight />
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {mockAppointmentsToday.map((appt) => {
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
                                {appt.service_name ||
                                  t("dashboard.todayAppointments.serviceDefault")}
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
                  <h2 className="text-xl font-bold text-gray-800">
                    {t("dashboard.recentDiagnosis.title")}
                  </h2>
                </div>
                <Link
                  href="/profile"
                  className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                >
                  {t("dashboard.recentDiagnosis.viewAll")} <FaArrowRight className="text-xs" />
                </Link>
              </div>

              {mockRecentDiagnosis.length === 0 ? (
                <div className="text-center py-8 bg-gradient-to-br from-blue-50 to-green-50 rounded-lg border-2 border-dashed border-gray-300">
                  <FaStethoscope className="text-green-300 text-6xl mx-auto mb-4" />
                  <p className="text-gray-700 font-semibold mb-2">
                    {t("dashboard.recentDiagnosis.noHistory")}
                  </p>
                  <p className="text-gray-600 text-sm mb-4">
                    {t("dashboard.recentDiagnosis.noHistoryDescription")}
                  </p>
                  <Link
                    href="/predict"
                    className="inline-flex items-center gap-2 px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-semibold"
                  >
                    {t("dashboard.recentDiagnosis.diagnoseNow")} <FaArrowRight />
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {mockRecentDiagnosis.slice(0, 3).map((record) => (
                    <div
                      key={record.record_id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900 mb-1">
                            {record.diagnosis || t("dashboard.recentDiagnosis.noDiagnosis")}
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
                            {t("dashboard.recentDiagnosis.noDiagnosisToday")}
                          </p>
                          <p className="text-sm text-yellow-800 mb-3">
                            {t("dashboard.recentDiagnosis.noDiagnosisTodayDescription")}
                          </p>
                          <Link
                            href="/predict"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors text-sm font-semibold"
                          >
                            {t("dashboard.recentDiagnosis.diagnoseNow")} <FaArrowRight />
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Timeline chẩn đoán */}
            {mockRecentDiagnosis.length > 0 && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center gap-2 mb-4">
                  <FaStethoscope className="text-purple-500 text-xl" />
                  <h2 className="text-xl font-bold text-gray-800">
                    {t("dashboard.diagnosisTimeline.title")}
                  </h2>
                </div>
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-500 to-blue-500"></div>

                  {/* Timeline items */}
                  <div className="space-y-4 relative">
                    {mockRecentDiagnosis.map((record, index) => (
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
                            {record.diagnosis || t("dashboard.diagnosisTimeline.diagnosis")}
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
                <h2 className="text-xl font-bold text-gray-800">
                  {t("dashboard.medicationReminder.title")}
                </h2>
              </div>
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
                      <span
                        className={`text-xs text-white px-2 py-1 rounded-full ${
                          med.isUpcoming ? "bg-gray-400" : "bg-orange-500"
                        }`}
                      >
                        {med.time}
                      </span>
                    </div>
                    <p
                      className={`text-sm mb-2 ${med.isUpcoming ? "text-gray-600" : "text-orange-800"}`}
                    >
                      {med.instruction}
                    </p>
                    {med.taken ? (
                      <p className="text-xs text-green-600 font-semibold">
                        {t("dashboard.medicationReminder.taken")}
                      </p>
                    ) : !med.isUpcoming ? (
                      <button
                        onClick={() => handleMarkMedicationTaken(med.id)}
                        className="text-xs text-orange-600 hover:text-orange-700 font-semibold"
                      >
                        {t("dashboard.medicationReminder.notTaken")}
                      </button>
                    ) : (
                      <p className="text-xs text-gray-500 font-semibold">
                        {t("dashboard.medicationReminder.notTimeYet")}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Thông báo */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FaBell className="text-red-500 text-xl" />
                  <h2 className="text-xl font-bold text-gray-800">
                    {t("dashboard.notifications.title")}
                  </h2>
                </div>
                <Link
                  href="/notification"
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  {t("dashboard.notifications.viewAll")}
                </Link>
              </div>
              <div className="space-y-3">
                {mockNotifications.map((notif) => (
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
