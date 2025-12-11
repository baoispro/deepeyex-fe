import { QueryKey, useQuery, UseQueryOptions } from "@tanstack/react-query";
import { QueryKeyEnum } from "@/app/shares/enums/queryKey";
import { SubscriptionApi, CheckPlanResponse } from "@/app/shares/api/subscriptionApi";
import { ApiResponse } from "@/app/shares/types/response";

type Options = Omit<
  UseQueryOptions<ApiResponse<CheckPlanResponse>, Error, ApiResponse<CheckPlanResponse>, QueryKey>,
  "queryKey" | "queryFn"
>;

export const useGetSubscriptionQuery = (userId: string | null, options?: Options) => {
  return useQuery({
    queryKey: [QueryKeyEnum.Subscription, userId],
    queryFn: () => SubscriptionApi.checkPlan(userId!),
    enabled: !!userId,
    ...options,
  });
};
