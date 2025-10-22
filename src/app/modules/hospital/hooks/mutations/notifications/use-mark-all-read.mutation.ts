import { useMutation, useQueryClient } from "@tanstack/react-query";
import { NotificationApi } from "../../../apis/notification/notificationApi";
import { QueryKeyEnum } from "@/app/shares/enums/queryKey";

export const useMarkAllNotificationsReadMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => NotificationApi.markAllRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeyEnum.Notification], exact: false });
    },
  });
};
