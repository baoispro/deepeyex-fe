import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { OrderApi, Order, CreateOrderRequest } from "../../api/orderApi";
import { ApiResponse } from "../../types/response";

type Options = Omit<
  UseMutationOptions<ApiResponse<Order>, Error, CreateOrderRequest>,
  "mutationFn"
>;

const useCreateOrderMutation = (options?: Options) => {
  return useMutation({
    mutationFn: (data: CreateOrderRequest) => OrderApi.createOrder(data),
    ...options,
  });
};

export { useCreateOrderMutation };
