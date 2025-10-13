import { useQuery } from "@tanstack/react-query";
import { OrderApi } from "@/app/shares/api/orderApi";
import { QueryKeyEnum } from "@/app/shares/enums/queryKey";

export const useGetOrdersByPatientId = (patientId: string | undefined) => {
  return useQuery({
    queryKey: [QueryKeyEnum.Order, "patient-orders", patientId],
    queryFn: () => OrderApi.getOrdersByPatientId(patientId!),
    enabled: !!patientId,
  });
};
