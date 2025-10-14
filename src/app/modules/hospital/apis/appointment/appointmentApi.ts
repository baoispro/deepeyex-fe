import { AxiosInstance } from "axios";
import api from "@/app/shares/configs/axios";
import { ListAppointmentsResponse, UpdateAppointmentStatusResponse } from "../../types/response";

class AppointmentClient {
  private readonly client: AxiosInstance;

  constructor() {
    this.client = api;
  }

  /**
   * Get appointments by patient ID
   * @param patientId - Patient ID
   * @returns Appointments list
   */
  async getAppointmentsByPatientId(patientId: string): Promise<ListAppointmentsResponse> {
    const response = await this.client.get<ListAppointmentsResponse>(
      `/hospital/appointments/patient/${patientId}`,
    );
    return response.data;
  }

  //Update status appointment
  async updateStatusAppointment(
    appointmentId: string,
    status: string,
  ): Promise<UpdateAppointmentStatusResponse> {
    const response = await this.client.put<UpdateAppointmentStatusResponse>(
      `/hospital/appointments/${appointmentId}/status`,
      { status },
    );
    return response.data;
  }

  async getOnlineAppointments(params: {
    book_user_id?: string;
    doctorId?: string;
  }): Promise<ListAppointmentsResponse> {
    const response = await this.client.get<ListAppointmentsResponse>(
      `/hospital/appointments/online`,
      { params },
    );
    return response.data;
  }
}

const AppointmentApi = new AppointmentClient();
export { AppointmentApi };
