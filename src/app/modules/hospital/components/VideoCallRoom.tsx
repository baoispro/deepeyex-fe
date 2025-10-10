"use client";
import React, { useEffect, useRef, useState } from "react";
import { Button, Input, message } from "antd";
import { loadStringeeSDK } from "../../../shares/utils/stringee-sdk-loader"; // loader
import {
  AiOutlineAudio,
  AiOutlineAudioMuted,
  AiOutlineVideoCamera,
  AiOutlineVideoCameraAdd,
  AiOutlinePhone,
  AiOutlineMessage,
} from "react-icons/ai";

interface Props {
  userToken: string; // token Stringee server cung cấp
  callTo: string; // số điện thoại hoặc ID Stringee người gọi
  onLeave: () => void;
}

const VideoCallRoom = ({ userToken, callTo, onLeave }: Props) => {
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCamOn, setIsCamOn] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [messages, setMessages] = useState<string[]>([]);
  const [newMessage, setNewMessage] = useState("");

  const [client, setClient] = useState<any>(null);
  const [call, setCall] = useState<any>(null);
  const [sdk, setSdk] = useState<any>(null);

  // 🔹 Load Stringee SDK và kết nối
  useEffect(() => {
    let stringee: any;

    const initSDK = async () => {
      try {
        stringee = await loadStringeeSDK();
        setSdk(stringee);

        const client = new stringee.StringeeClient();
        setClient(client);

        client.connect(userToken);

        client.on("connect", () => {
          console.log("✅ Connected to Stringee");
          message.success("Đã kết nối server Stringee");
        });

        client.on("incomingcall2", (incomingCall: any) => {
          console.log("📞 Incoming call...");
          setCall(incomingCall);

          incomingCall.on("addremotestream", (stream: any) => {
            if (remoteVideoRef.current) remoteVideoRef.current.srcObject = stream;
          });

          incomingCall.answer();
        });
      } catch (err) {
        console.error("❌ Lỗi load Stringee SDK:", err);
      }
    };

    initSDK();

    return () => {
      client?.disconnect?.();
    };
  }, [userToken]);

  // 🔹 Bật camera / mic (cả local stream và call)
  const toggleCamera = () => {
    if (!stream) return;
    stream.getVideoTracks().forEach((t) => (t.enabled = !isCamOn));
    setIsCamOn(!isCamOn);
  };

  const toggleMic = () => {
    if (!stream) return;
    stream.getAudioTracks().forEach((t) => (t.enabled = !isMicOn));
    setIsMicOn(!isMicOn);
  };

  // 🔹 Tạo cuộc gọi
  const startCall = () => {
    if (!sdk || !client) return;

    const call2 = new sdk.StringeeCall2(client, callTo);
    setCall(call2);

    call2.on("addlocalstream", (stream: any) => {
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
    });
    call2.on("addremotestream", (stream: any) => {
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = stream;
    });

    call2.makeCall((res: any) => console.log("Make call:", res));
  };

  // 🔹 Kết thúc cuộc gọi
  const endCall = () => {
    call?.hangup();
    onLeave();
  };

  // 🔹 Mở camera khi vào phòng
  useEffect(() => {
    const startCamera = async () => {
      try {
        const userStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        if (localVideoRef.current) localVideoRef.current.srcObject = userStream;
        setStream(userStream);
      } catch (err) {
        message.error("Không thể truy cập camera/micro");
        console.error(err);
      }
    };
    startCamera();

    return () => {
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  // 🔹 Chat
  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    setMessages((prev) => [...prev, newMessage]);
    setNewMessage("");
  };

  return (
    <div className="flex h-[600px] bg-gray-100 rounded-xl overflow-hidden shadow-inner">
      {/* Vùng video */}
      <div className="flex-1 relative bg-black flex justify-center items-center">
        <video
          ref={localVideoRef}
          autoPlay
          muted
          playsInline
          className="absolute bottom-2 left-2 w-40 rounded-lg"
        />
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="rounded-lg w-[90%] max-h-[90%] object-cover"
        />

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3">
          <Button
            shape="circle"
            size="large"
            onClick={toggleMic}
            icon={isMicOn ? <AiOutlineAudio /> : <AiOutlineAudioMuted />}
          />
          <Button
            shape="circle"
            size="large"
            onClick={toggleCamera}
            icon={isCamOn ? <AiOutlineVideoCamera /> : <AiOutlineVideoCameraAdd />}
          />
          <Button shape="circle" danger size="large" icon={<AiOutlinePhone />} onClick={endCall} />
          <Button
            shape="circle"
            size="large"
            icon={<AiOutlineMessage />}
            onClick={() => setIsChatOpen(!isChatOpen)}
          />
          <Button type="primary" onClick={startCall}>
            📞 Gọi {callTo}
          </Button>
        </div>
      </div>

      {/* Vùng chat */}
      {isChatOpen && (
        <div className="w-1/3 bg-white flex flex-col border-l">
          <div className="p-3 font-semibold border-b">💬 Chat trong phòng</div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {messages.length === 0 ? (
              <p className="text-gray-400 text-sm">Chưa có tin nhắn nào</p>
            ) : (
              messages.map((msg, idx) => (
                <div
                  key={idx}
                  className="bg-blue-50 text-gray-800 p-2 rounded-lg w-fit max-w-[80%]"
                >
                  {msg}
                </div>
              ))
            )}
          </div>
          <div className="flex border-t p-2">
            <Input
              placeholder="Nhập tin nhắn..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onPressEnter={handleSendMessage}
            />
            <Button type="primary" onClick={handleSendMessage} className="ml-2">
              Gửi
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoCallRoom;
