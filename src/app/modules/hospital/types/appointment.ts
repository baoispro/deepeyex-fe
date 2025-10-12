import { Patient } from "./patient";
import { TimeSlot } from "./timeslot";

export interface Appointment {
  appointment_id: string;
  appointment_code: string;
  patient_id: string;
  hospital_id: string;
  doctor_id: string;
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
  notes: string;
  created_at: string;
  updated_at: string;
  book_user_id: string;
  service_name: string;
  time_slots: TimeSlot[];
  patient: Patient;
}

export type LabelStatus = {
  label: string;
  color: string;
};

export const statusLabels: Record<Appointment["status"], LabelStatus> = {
  PENDING: { label: "Chờ xác nhận", color: "orange" },
  CONFIRMED: { label: "Đã xác nhận", color: "blue" },
  COMPLETED: { label: "Đã hoàn tất", color: "green" },
  CANCELLED: { label: "Đã hủy", color: "red" },
};
