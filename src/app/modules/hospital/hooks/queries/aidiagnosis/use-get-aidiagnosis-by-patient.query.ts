import { useQuery } from "@tanstack/react-query";
import { QueryKeyEnum } from "@/app/shares/enums/queryKey";
import { AIDiagnosisApi } from "../../../apis/aidiagnosis/apis/aidiagnosis_api";

export const useGetAIDiagnosisByPatientId = (patientId: string | undefined) => {
  return useQuery({
    queryKey: [QueryKeyEnum.AIDiagnosis, "patient", patientId],
    queryFn: () => AIDiagnosisApi.getByPatientId(patientId!),
    enabled: !!patientId,
  });
};
