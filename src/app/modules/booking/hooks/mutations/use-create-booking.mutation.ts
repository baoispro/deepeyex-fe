import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { BookingApi, BookingRequest, BookingResponse } from "../../apis/bookingApi";
import { ApiResponse } from "@/app/shares/types/response";

type Options = Omit<
  UseMutationOptions<ApiResponse<BookingResponse>, Error, BookingRequest>,
  "mutationFn"
>;

function useCreateBookingMutation(options?: Options) {
  return useMutation<ApiResponse<BookingResponse>, Error, BookingRequest>({
    mutationFn: (req: BookingRequest) => BookingApi.createBooking(req),
    ...options,
  });
}

export { useCreateBookingMutation };
