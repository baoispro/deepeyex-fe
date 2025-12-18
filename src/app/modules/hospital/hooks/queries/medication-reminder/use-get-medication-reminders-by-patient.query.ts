import { useQuery } from "@tanstack/react-query";
import { QueryKeyEnum } from "@/app/shares/enums/queryKey";
import { MedicationReminderApi } from "../../../apis/medication-reminder/medicationReminderApi";

export const useGetMedicationRemindersByPatientId = (patientId: string | undefined) => {
  return useQuery({
    queryKey: [QueryKeyEnum.MedicationReminder, "patient", patientId],
    queryFn: () => MedicationReminderApi.getByPatientId(patientId!),
    enabled: !!patientId,
  });
};
