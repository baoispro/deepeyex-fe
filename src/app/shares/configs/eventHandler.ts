// shares/websocket/eventHandler.ts
import { notification } from "antd";
import { queryClient } from "./queryClient";
import { QueryKeyEnum } from "../enums/queryKey";
import { toast } from "react-toastify";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const handleSocketEvent = (data: any) => {
  switch (data.type) {
    case "NEW_APPOINTMENT":
      notification.open({
        message: "📅 Lịch hẹn mới",
        description: data.payload?.message || "Bạn có lịch hẹn mới từ bệnh nhân.",
      });
      console.log("đã đặt thành công nhé 12211");

      // ✅ Refresh lại danh sách lịch khám (React Query tự refetch)
      queryClient.invalidateQueries({ queryKey: [QueryKeyEnum.Appointment], exact: false });
      break;

    // có thể thêm các event khác ở đây
    case "CANCEL_APPOINTMENT":
      notification.warning({
        message: "Lịch hẹn bị hủy",
        description: data.payload?.message || "Bệnh nhân đã hủy lịch hẹn.",
      });
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      break;

    case "NEW_NOTIFICATION":
      toast.success(
        data.payload?.notification?.title ||
          "🔔 Thông báo mới\n" + (data.payload?.notification?.message || "Bạn có thông báo mới."),
      );
      console.log("Có notification mới:", data.payload?.notification);

      queryClient.invalidateQueries({ queryKey: [QueryKeyEnum.Notification], exact: false });
      break;

    default:
      console.log("[WS] Unknown event:", data);
  }
};
