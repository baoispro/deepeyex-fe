import { useQuery } from "@tanstack/react-query";
import { QueryKeyEnum } from "@/app/shares/enums/queryKey";
import { PrescriptionApi } from "../../../apis/prescription/prescriptionApi";

interface PrescriptionFilters {
  status?: string;
  date?: string;
  sort?: string;
}

export const useGetPrescriptionsByPatientId = (
  patientId: string | undefined,
  filters?: PrescriptionFilters,
) => {
  return useQuery({
    queryKey: [QueryKeyEnum.Prescription, patientId, filters],
    queryFn: () => PrescriptionApi.getPrescriptionsByPatientId(patientId!, filters),
    enabled: !!patientId,
  });
};
