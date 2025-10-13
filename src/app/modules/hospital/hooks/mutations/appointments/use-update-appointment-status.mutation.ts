import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { AppointmentApi } from "../../../apis/appointment/appointmentApi";
import { UpdateAppointmentStatusResponse } from "../../../types/response";

interface UpdateAppointmentStatusBody {
  appointment_id: string;
  status: string;
}

type Options = Omit<
  UseMutationOptions<UpdateAppointmentStatusResponse, Error, UpdateAppointmentStatusBody>,
  "mutationFn"
>;

const useUpdateAppointmentStatusMutation = (options?: Options) => {
  return useMutation({
    mutationFn: async (
      body: UpdateAppointmentStatusBody,
    ): Promise<UpdateAppointmentStatusResponse> => {
      const { appointment_id, status } = body;
      return AppointmentApi.updateStatusAppointment(appointment_id, status);
    },
    ...options,
  });
};

export { useUpdateAppointmentStatusMutation };
