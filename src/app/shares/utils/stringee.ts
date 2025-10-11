import { EventEmitter } from "events";

export const callEventEmitter = new EventEmitter();

let client: any = null;
let currentCall: any = null;

export const connectToStringee = async (token: string) => {
  return new Promise((resolve, reject) => {
    if (!window.StringeeClient) return reject("Stringee SDK chưa được tải");

    client = new window.StringeeClient();

    client.on("connect", () => console.log("✅ Đã kết nối Stringee server"));
    client.on("authen", (res: any) => {
      if (res.r === 0) console.log("🟢 Authenticated with Stringee", res);
      else console.error("❌ Authen failed:", res);
    });
    client.on("disconnect", () => console.log("❌ Mất kết nối Stringee"));
    client.on("otherdeviceauthen", () => {
      console.warn("⚠️ Tài khoản đăng nhập từ thiết bị khác");
      client.disconnect();
    });

    // Khi có cuộc gọi đến
    client.on("incomingcall", (incomingCall: any) => {
      console.log("📞 Có cuộc gọi đến:", incomingCall.fromNumber);
      currentCall = incomingCall;
      setupCallEvents(currentCall);
      callEventEmitter.emit("incoming-call", incomingCall);
    });

    client.connect(token);
    resolve(client);
  });
};

export const makeVideoCall = async (token: string, toUserId: string, isVideo = true) => {
  if (!client) await connectToStringee(token);

  const call = new window.StringeeCall(client, token, toUserId, isVideo);
  setupCallEvents(call);
  call.makeCall((res: any) => console.log("📤 Gọi đi:", res));
};

export const hangupCall = () => {
  if (currentCall) currentCall.hangup();
};

export const muteCall = (muted: boolean) => {
  if (currentCall) currentCall.mute(muted);
};

export const setupCallEvents = (call: any) => {
  call.on("addlocalstream", (stream: MediaStream) => {
    callEventEmitter.emit("local-stream", stream);
  });

  call.on("addremotestream", (stream: MediaStream) => {
    callEventEmitter.emit("remote-stream", stream);
  });

  call.on("signalingstate", (state: any) => {
    console.log("📡 signalingstate:", state);
    if (state.code === 6 || state.code === 5) {
      callEventEmitter.emit("call-ended");
    }
  });
};
