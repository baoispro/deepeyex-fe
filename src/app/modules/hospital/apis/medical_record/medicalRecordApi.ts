import api from "@/app/shares/configs/axios";
import { AxiosInstance } from "axios";
import { GetMedicalRecordByPatientIdResponse } from "../../types/response";

const endpoint = "/hospital/medical_records";

// ---------------- Request ----------------
export interface InitMedicalRecordAndDiagnosisRequest {
  patient_id: string; // Bắt buộc
  appointment_id?: string; // Có thể null
  doctor_id?: string; // Có thể null
  ai_diagnosis_id?: string; // Có thể null
}

// ---------------- Response ----------------
export interface InitMedicalRecordAndDiagnosisResponse {
  record_id: string; // ID của MedicalRecord vừa tạo
}

class MedicalRecordClient {
  private readonly client: AxiosInstance;

  constructor() {
    this.client = api;
  }

  // ---------------- Get all MedicalRecords by PatientID ----------------
  async getByPatientId(patientId: string): Promise<GetMedicalRecordByPatientIdResponse> {
    const response = await this.client.get<GetMedicalRecordByPatientIdResponse>(
      `${endpoint}/patient`,
      {
        params: { patient_id: patientId },
      },
    );
    return response.data;
  }

  async initRecordAndDiagnosis(
    payload: InitMedicalRecordAndDiagnosisRequest,
  ): Promise<InitMedicalRecordAndDiagnosisResponse> {
    const response = await this.client.post<InitMedicalRecordAndDiagnosisResponse>(
      `${endpoint}/init`,
      payload,
    );
    return response.data;
  }
}

const MedicalRecordApi = new MedicalRecordClient();
export { MedicalRecordApi };
