import api from "@/app/shares/configs/axios";
import { AxiosInstance } from "axios";
import { GetMedicalRecordByPatientIdResponse } from "../../types/response";

const endpoint = "/hospital/medical_records";

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
}

const MedicalRecordApi = new MedicalRecordClient();
export { MedicalRecordApi };
