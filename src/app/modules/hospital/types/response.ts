import { ApiResponse } from "@/app/shares/types/response";
import { Patient } from "./patient";

type GetPatientResponse = ApiResponse<Patient>;

export type { GetPatientResponse };
