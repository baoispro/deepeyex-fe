import { store } from "../stores";
import { setSocketConnected } from "../stores/authSlice";
import { handleSocketEvent } from "./eventHandler";

const WS_BASE_URL = "ws://localhost:8000/ws";

let socket: WebSocket | null = null;

/**
 * Khởi tạo socket cho patient
 * @param patientId ID của patient
 */
export const initPatientSocket = (patientId: string) => {
  // Nếu socket đang mở, đóng trước khi mở lại
  if (socket && socket.readyState !== WebSocket.CLOSED) {
    socket.close();
  }

  const url = `${WS_BASE_URL}/patient?patient_id=${patientId}`;

  // Mở socket
  socket = new WebSocket(url);

  socket.onopen = () => {
    console.log(`[WS] Connected as patient ${patientId}`);
    store.dispatch(setSocketConnected(true));
  };

  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      console.log("[WS] Received message:", data);
      handleSocketEvent(data);

      // Dispatch Redux hoặc show notification nếu muốn
    } catch (err) {
      console.error("[WS] Failed to parse message:", err);
    }
  };

  socket.onclose = (event) => {
    console.warn(`[WS] Disconnected: ${event.reason}`);
    store.dispatch(setSocketConnected(false));

    // Nếu kết nối bị ngắt bất ngờ, tự reconnect sau 3 giây
    if (!event.wasClean) {
      setTimeout(() => initPatientSocket(patientId), 3000);
    }
  };

  socket.onerror = (error) => {
    if (socket?.readyState !== WebSocket.OPEN) {
      console.warn("[WS] Temporary connection issue, will retry...");
    } else {
      console.error("[WS] Error:", error);
    }
  };
};

/**
 * Gửi message tới server
 * @param msg object
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const sendMessage = (msg: any) => {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(msg));
  } else {
    console.warn("[WS] Cannot send, socket not open");
  }
};

/**
 * Đóng socket khi logout
 */
export const closeSocket = () => {
  if (socket) {
    socket.close();
    socket = null;
  }
};
