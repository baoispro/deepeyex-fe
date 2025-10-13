import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { OrderApi, Order } from "../../api/orderApi";

interface UpdateOrderStatusBody {
  order_id: string;
  status: string;
}

type Options = Omit<UseMutationOptions<Order, Error, UpdateOrderStatusBody>, "mutationFn">;

const useUpdateOrderStatusMutation = (options?: Options) => {
  return useMutation({
    mutationFn: async (body: UpdateOrderStatusBody): Promise<Order> => {
      const { order_id, status } = body;
      return OrderApi.updateOrderStatus(order_id, status);
    },
    ...options,
  });
};

export { useUpdateOrderStatusMutation };
