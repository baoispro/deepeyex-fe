import api from "@/app/shares/configs/axios";
import { AxiosInstance } from "axios";
import { AIDiagnosisResponse } from "../types/response";
import { CreateAIDiagnosisBody } from "../schemas/createAiDiagnosis.schema";

const endpoint = "/hospital/ai-diagnoses";

class AIDiagnosisClient {
  private readonly client: AxiosInstance;

  constructor() {
    this.client = api;
  }

  // ---------------- Create AI Diagnosis ----------------
  async create(data: CreateAIDiagnosisBody): Promise<AIDiagnosisResponse> {
    const formData = new FormData();

    formData.append("patient_id", data.patient_id);
    formData.append("record_id", data.record_id);
    formData.append("disease_code", data.disease_code);
    formData.append("confidence", data.confidence.toString());

    if (data.eye_type) formData.append("eye_type", data.eye_type);
    if (data.notes) formData.append("notes", data.notes);
    if (data.main_image_url instanceof File) {
      formData.append("main_image", data.main_image_url);
    }

    const response = await this.client.post<AIDiagnosisResponse>(endpoint, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return response.data;
  }

  // ---------------- Get All Pending Diagnoses ----------------
  async getAllPending(): Promise<AIDiagnosisResponse[]> {
    const response = await this.client.get<AIDiagnosisResponse[]>(endpoint);
    return response.data;
  }

  // ---------------- Get Diagnoses By Patient ID ----------------
  async getByPatientId(patientId: string): Promise<AIDiagnosisResponse[]> {
    const response = await this.client.get<AIDiagnosisResponse[]>(
      `${endpoint}/patient/${patientId}`,
    );
    return response.data;
  }

  // ---------------- Verify Diagnosis ----------------
  async verify(
    id: string,
    data: {
      doctor_id: string;
      status: string;
      notes?: string;
      signature?: string;
    },
  ): Promise<{ message: string }> {
    const response = await this.client.put<{ message: string }>(`${endpoint}/${id}/verify`, data);
    return response.data;
  }
}

const AIDiagnosisApi = new AIDiagnosisClient();
export { AIDiagnosisApi };
