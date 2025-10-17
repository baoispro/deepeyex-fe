import { QueryKey, useQuery, UseQueryOptions } from "@tanstack/react-query";
import { QueryKeyEnum } from "@/app/shares/enums/queryKey";
import { GetMedicalRecordByPatientIdResponse } from "../../../types/response";
import { MedicalRecordApi } from "../../../apis/medical_record/medicalRecordApi";

type Options = Omit<
  UseQueryOptions<
    GetMedicalRecordByPatientIdResponse,
    Error,
    GetMedicalRecordByPatientIdResponse,
    QueryKey
  >,
  "queryKey" | "queryFn"
>;

export function useGetMedicalRecordsByPatientQuery(patientId: string, options?: Options) {
  return useQuery({
    queryKey: [QueryKeyEnum.MedicalRecords, patientId],
    queryFn: () => MedicalRecordApi.getByPatientId(patientId),
    enabled: !!patientId, // chỉ chạy query khi patientId tồn tại
    ...options,
  });
}
