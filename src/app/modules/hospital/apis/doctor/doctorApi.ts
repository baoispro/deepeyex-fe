import api from "@/app/shares/configs/axios";
import { AxiosInstance } from "axios";
import {
  GetDoctorByIdResponse,
  ListDoctorsResponse,
  ListDoctorsByHospitalResponse,
  GetDoctorByUserIdResponse,
} from "../../types/response";

const endpoint = "/doctor/doctors";

class DoctorClient {
  private readonly client: AxiosInstance;

  constructor() {
    this.client = api;
  }

  // ---------------- List All Doctors ----------------
  async getAll(): Promise<ListDoctorsResponse> {
    const response = await this.client.get<ListDoctorsResponse>(endpoint);
    return response.data;
  }

  // ---------------- Get Doctor By ID ----------------
  async getById(doctorId: string): Promise<GetDoctorByIdResponse> {
    const response = await this.client.get<GetDoctorByIdResponse>(`${endpoint}/${doctorId}`);
    return response.data;
  }

  // ---------------- Get Doctor By UserID ----------------
  async getByUserId(userId: string): Promise<GetDoctorByUserIdResponse> {
    const response = await this.client.get<GetDoctorByUserIdResponse>(`${endpoint}/user/${userId}`);
    return response.data;
  }

  // ---------------- List Doctors By Hospital ----------------
  async getByHospital(hospitalId: string): Promise<ListDoctorsByHospitalResponse> {
    const response = await this.client.get<ListDoctorsByHospitalResponse>(
      `${endpoint}/hospital/${hospitalId}`,
    );
    return response.data;
  }
}

const DoctorApi = new DoctorClient();
export { DoctorApi };
