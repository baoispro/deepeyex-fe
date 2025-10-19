import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { AppointmentApi } from "../../../apis/appointment/appointmentApi";
import { CancelAppointmentResponse } from "../../../types/response";

type Options = Omit<UseMutationOptions<CancelAppointmentResponse, Error, string>, "mutationFn">;

const useCancelAppointmentMutation = (options?: Options) => {
  return useMutation({
    mutationFn: async (appointment_id: string): Promise<CancelAppointmentResponse> => {
      return AppointmentApi.cancelAppointment(appointment_id);
    },
    ...options,
  });
};

export { useCancelAppointmentMutation };
