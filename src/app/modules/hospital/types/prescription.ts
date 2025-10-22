export interface PrescriptionItem {
  prescription_item_id: string;
  prescription_id: string;
  drug_name: string;
  dosage: string;
  frequency: string;
  duration_days: number;
  start_date: string;
  end_date: string;
}

export interface Prescription {
  prescription_id: string;
  medical_record_id: string;
  patient_id: string;
  source: "DOCTOR" | "AI";
  description: string;
  status: "PENDING" | "APPROVED" | "CANCELLED";
  items: PrescriptionItem[];
  CreatedAt: string;
  UpdatedAt: string;
}

export const prescriptionStatusLabels: Record<
  Prescription["status"],
  { label: string; color: string }
> = {
  PENDING: { label: "Chờ xử lý", color: "orange" },
  APPROVED: { label: "Hoàn thành", color: "green" },
  CANCELLED: { label: "Đã hủy", color: "red" },
};

export const prescriptionSourceLabels: Record<Prescription["source"], string> = {
  DOCTOR: "Bác sĩ kê đơn",
  AI: "AI chẩn đoán",
};
