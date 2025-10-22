import { QueryKey, useQuery, UseQueryOptions } from "@tanstack/react-query";
import { QueryKeyEnum } from "@/app/shares/enums/queryKey";
import { NotificationApi, Notification } from "../../../apis/notification/notificationApi";
import { ApiResponse } from "@/app/shares/types/response";

type Options = Omit<
  UseQueryOptions<ApiResponse<Notification[]>, Error, ApiResponse<Notification[]>, QueryKey>,
  "queryKey" | "queryFn"
>;

export function useGetNotificationsByUserQuery(userId: string, options?: Options) {
  return useQuery({
    queryKey: [QueryKeyEnum.Notification, userId],
    queryFn: () => NotificationApi.getAll(userId),
    // enabled: !!userId,
    ...options,
  });
}
