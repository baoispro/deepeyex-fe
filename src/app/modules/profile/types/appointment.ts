export type Appointment = {
  appointment_id: string;
  date: string;
  doctor_name: string;
  clinic: string;
  status: "upcoming" | "completed" | "cancelled";
  note?: string;
};

export type LabelStatus = {
  label: string;
  color: string;
};
export const statusLabels: Record<Appointment["status"], LabelStatus> = {
  upcoming: { label: "Sắp tới", color: "blue" },
  completed: { label: "Đã hoàn tất", color: "green" },
  cancelled: { label: "Đã hủy", color: "red" },
};
