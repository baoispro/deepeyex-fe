import { useQuery } from "@tanstack/react-query";
import { QueryKeyEnum } from "@/app/shares/enums/queryKey";
import { AppointmentApi } from "../../../apis/appointment/appointmentApi";

export const useGetAppointmentsByPatientId = (patientId: string | undefined) => {
  return useQuery({
    queryKey: [QueryKeyEnum.Appointment, patientId],
    queryFn: () => AppointmentApi.getAppointmentsByPatientId(patientId!),
    enabled: !!patientId,
  });
};
