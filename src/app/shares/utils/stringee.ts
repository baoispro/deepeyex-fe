import { callEventEmitter } from "./callEvents";

// utils/stringee.ts
let client: any = null;
let currentCall: any = null;

export function connectToStringee(token: string) {
  if (typeof window === "undefined" || !window.StringeeClient) {
    console.error("Stringee SDK not loaded.");
    return;
  }

  client = new window.StringeeClient();

  client.connect(token);

  client.on("connect", function () {
    console.log("✅ Connected to Stringee Server");
  });

  client.on("authen", function (res: any) {
    if (res.r === 0) {
      console.log("✅ Authenticated with Stringee", res);
    } else {
      console.error("❌ Authentication failed", res);
    }
  });

  client.on("disconnect", function () {
    console.log("🔌 Disconnected from Stringee Server");
  });

  // Handle incoming call
  client.on("incomingcall", function (incomingCall: any) {
    console.log("📞 Incoming call from:", incomingCall.fromNumber);
    alert("📞 Incoming call received from: " + incomingCall.fromNumber);
    currentCall = incomingCall;
    setupCallEvents(currentCall);

    const answer = confirm(`Incoming call from: ${incomingCall.fromNumber}, answer?`);
    if (answer) {
      currentCall.answer((res: any) => console.log("Answer result", res));
      callEventEmitter.emit("incoming-call", incomingCall);
    } else {
      currentCall.reject((res: any) => console.log("Reject result", res));
    }
  });
}

export function makeVideoCall(fromUserId: string, toUserId: string, isVideoCall: boolean) {
  if (!client) {
    console.error("Client not initialized");
    return;
  }

  currentCall = new window.StringeeCall(client, fromUserId, toUserId, isVideoCall);
  console.log(
    `${isVideoCall ? "🎥" : "📞"} Making ${isVideoCall ? "video" : "audio"} call to`,
    toUserId,
  );
  setupCallEvents(currentCall);

  currentCall.makeCall((res: any) => {
    console.log("📞 Make call result:", res);
  });
}

function setupCallEvents(call: any) {
  call.on("addremotestream", function (stream: MediaStream) {
    console.log("📺 Remote stream added");
    const remoteVideo = document.getElementById("remoteVideo") as HTMLVideoElement;
    if (remoteVideo) remoteVideo.srcObject = stream;
  });

  call.on("addlocalstream", function (stream: MediaStream) {
    console.log("📹 Local stream added");
    const localVideo = document.getElementById("localVideo") as HTMLVideoElement;
    if (localVideo) localVideo.srcObject = stream;
  });

  call.on("signalingstate", function (state: any) {
    console.log("🔁 Signaling state changed:", state);
  });

  call.on("mediastate", function (state: any) {
    console.log("📡 Media state changed:", state);
  });

  call.on("info", function (info: any) {
    console.log("ℹ️ Call info:", info);
  });
}

export function hangupCall() {
  if (currentCall) {
    currentCall.hangup((res: any) => {
      console.log("📴 Call ended", res);
    });
  }
}

export function muteCall(mute: boolean) {
  if (currentCall) {
    currentCall.mute(mute);
    console.log(`🔇 Call ${mute ? "muted" : "unmuted"}`);
  }
}

export function getStringeeClient() {
  return client;
}
