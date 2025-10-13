import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { CreatePaymentRequest, VnpayApi } from "@/app/shares/api/vnpayApi";
import { ApiResponse } from "@/app/shares/types/response";

interface CreatePaymentResponse {
  paymentUrl: string;
}

export const useCreateVnpayPaymentMutation = (
  options?: UseMutationOptions<ApiResponse<CreatePaymentResponse>, Error, CreatePaymentRequest>,
) => {
  return useMutation<ApiResponse<CreatePaymentResponse>, Error, CreatePaymentRequest>({
    mutationFn: (data: CreatePaymentRequest) => VnpayApi.createPaymentURL(data),
    ...options,
  });
};
