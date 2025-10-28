import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { AppointmentApi } from "../../../apis/appointment/appointmentApi";
import { CreateFollowUpResponse } from "../../../types/response";

type Options = Omit<UseMutationOptions<CreateFollowUpResponse, Error, string>, "mutationFn">;

const useConfirmFollowUpAppointmentMutation = (options?: Options) => {
  return useMutation({
    mutationFn: async (token: string): Promise<CreateFollowUpResponse> => {
      return AppointmentApi.confirmFollowUpAppointment(token);
    },
    ...options,
  });
};

export { useConfirmFollowUpAppointmentMutation };
