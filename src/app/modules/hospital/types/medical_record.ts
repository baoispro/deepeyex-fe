import { Appointment } from "./appointment";
import { Doctor } from "./doctor";

export type MedicalRecord = {
  record_id: string;
  patient_id: string;
  appointment_id: string;
  doctor_id: string;
  diagnosis: string;
  notes?: string | null;
  related_record_id?: string | null;
  created_at: string; // ISO string
  updated_at: string; // ISO string
  //   ai_diagnoses: AIDiagnosisResponse[];
  //   attachments: AttachmentResponse[];
  //   prescriptions: PrescriptionResponse[];
  appointment?: Appointment | null;
  // doctor?: Doctor | null;
};
