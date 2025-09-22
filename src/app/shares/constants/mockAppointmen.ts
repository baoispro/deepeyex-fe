import { Appointment } from "@/app/modules/profile/types/appointment";

export const mockAppointments: Appointment[] = [
  {
    appointment_id: "A-001",
    date: "2025-09-25T10:30:00Z",
    doctor_name: "Bs. Nguyễn Văn A",
    clinic: "Phòng khám Mắt ABC",
    status: "upcoming",
    note: "Kiểm tra lại giác mạc",
  },
  {
    appointment_id: "A-002",
    date: "2025-08-15T14:00:00Z",
    doctor_name: "Bs. Trần Thị B",
    clinic: "Phòng khám Mắt XYZ",
    status: "completed",
    note: "Tái khám sau điều trị viêm kết mạc",
  },
  {
    appointment_id: "A-003",
    date: "2025-09-10T08:00:00Z",
    doctor_name: "Bs. Lê Văn C",
    clinic: "Bệnh viện Mắt Trung Ương",
    status: "cancelled",
  },
];
