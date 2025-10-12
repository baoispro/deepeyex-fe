import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { OrderApi, Order, CreateOrderRequest } from "../../api/orderApi";

type Options = Omit<UseMutationOptions<Order, Error, CreateOrderRequest>, "mutationFn">;

const useCreateOrderMutation = (options?: Options) => {
  return useMutation({
    mutationFn: (data: CreateOrderRequest) => OrderApi.createOrder(data),
    ...options,
  });
};

export { useCreateOrderMutation };
