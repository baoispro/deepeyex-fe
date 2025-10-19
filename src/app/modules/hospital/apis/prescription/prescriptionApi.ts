import { AxiosInstance } from "axios";
import api from "@/app/shares/configs/axios";
import { ApiResponse } from "@/app/shares/types/response";
import { Prescription } from "../../types/prescription";

type ListPrescriptionsResponse = ApiResponse<Prescription[]>;

class PrescriptionClient {
  private readonly client: AxiosInstance;

  constructor() {
    this.client = api;
  }

  /**
   * Get prescriptions by patient ID
   * @param patientId - Patient ID
   * @param params - Optional filters (status, date, sort)
   * @returns Prescriptions list
   */
  async getPrescriptionsByPatientId(
    patientId: string,
    params?: {
      status?: string;
      date?: string;
      sort?: string;
    },
  ): Promise<ListPrescriptionsResponse> {
    const response = await this.client.get<ListPrescriptionsResponse>(
      `/hospital/prescriptions/patient/${patientId}`,
      { params },
    );
    return response.data;
  }
}

const PrescriptionApi = new PrescriptionClient();
export { PrescriptionApi };
