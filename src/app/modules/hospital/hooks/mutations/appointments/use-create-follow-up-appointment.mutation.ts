import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { AppointmentApi, CreateFollowUpRequest } from "../../../apis/appointment/appointmentApi";
import { CreateFollowUpResponse } from "../../../types/response";

type Options = Omit<
  UseMutationOptions<CreateFollowUpResponse, Error, CreateFollowUpRequest>,
  "mutationFn"
>;

const useCreateFollowUpAppointmentMutation = (options?: Options) => {
  return useMutation({
    mutationFn: async (payload: CreateFollowUpRequest): Promise<CreateFollowUpResponse> => {
      return AppointmentApi.createFollowUpAppointment(payload);
    },
    ...options,
  });
};

export { useCreateFollowUpAppointmentMutation };
