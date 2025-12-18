import api from "@/app/shares/configs/axios";
import { ApiResponse } from "@/app/shares/types/response";
import { AxiosInstance } from "axios";

// ---------------- Types ----------------
export type MedicationReminder = {
  id: string;
  prescription_item_id?: string;
  reminder_time: string; // ISO datetime string
  status: "PENDING" | "DONE";
  created_at: string;
  drug_name: string;
  dosage: string;
  frequency: string;
  notes: string;
};

// ---------------- Client ----------------
class MedicationReminderClient {
  private readonly client: AxiosInstance;
  private readonly endpoint = "/hospital/medication-reminders";

  constructor() {
    this.client = api;
  }

  // ---------------- Get Medication Reminders By Patient ID ----------------
  async getByPatientId(patientId: string): Promise<ApiResponse<MedicationReminder[]>> {
    const response = await this.client.get<ApiResponse<MedicationReminder[]>>(
      `${this.endpoint}/patient/${patientId}`,
    );
    return response.data;
  }

  // ---------------- Mark Medication Taken ----------------
  async markTaken(id: string): Promise<void> {
    await this.client.put(`${this.endpoint}/${id}/taken`);
  }
}

const MedicationReminderApi = new MedicationReminderClient();
export { MedicationReminderApi, MedicationReminderClient };
