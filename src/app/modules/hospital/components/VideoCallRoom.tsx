"use client";
import React, { useEffect, useRef, useState } from "react";
import { Button, message } from "antd";
import {
  AiOutlineAudio,
  AiOutlineAudioMuted,
  AiOutlineVideoCamera,
  AiOutlineVideoCameraAdd,
  AiOutlinePhone,
} from "react-icons/ai";
import { loadStringeeSdk } from "@/app/shares/utils/stringee-sdk-loader";
import {
  connectToStringee,
  makeVideoCall,
  hangupCall,
  muteCall,
  callEventEmitter,
} from "@/app/shares/utils/stringee";

interface VideoCallRoomProps {
  userToken: string;
  callTo?: string;
  onLeave: () => void;
}

const VideoCallRoom = ({ userToken, callTo, onLeave }: VideoCallRoomProps) => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const [isMicOn, setIsMicOn] = useState(true);
  const [isCamOn, setIsCamOn] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [incomingCall, setIncomingCall] = useState<any>(null);

  useEffect(() => {
    const init = async () => {
      try {
        await loadStringeeSdk();
        await connectToStringee(userToken);

        callEventEmitter.on("local-stream", (stream: MediaStream) => {
          if (localVideoRef.current) localVideoRef.current.srcObject = stream;
        });

        callEventEmitter.on("remote-stream", (stream: MediaStream) => {
          if (remoteVideoRef.current) remoteVideoRef.current.srcObject = stream;
          setIsConnected(true);
        });

        callEventEmitter.on("incoming-call", (call: any) => {
          console.log("📞 Có cuộc gọi đến:", call.fromNumber);
          setIncomingCall(call);
        });

        callEventEmitter.on("call-ended", () => {
          message.info("🛑 Cuộc gọi kết thúc");
          setIsConnected(false);
          setIncomingCall(null);
          onLeave();
        });
      } catch (err) {
        console.error("❌ Lỗi khởi tạo Stringee:", err);
      }
    };

    init();
    return () => callEventEmitter.removeAllListeners();
  }, [userToken]);

  const handleStartCall = async () => {
    if (!callTo) return message.warning("Thiếu người nhận để gọi");
    await makeVideoCall(userToken, callTo, true);
  };

  const handleEndCall = () => {
    hangupCall();
    setIsConnected(false);
    setIncomingCall(null);
    onLeave();
  };

  const handleToggleMic = () => {
    muteCall(isMicOn);
    setIsMicOn(!isMicOn);
  };

  const handleAnswerCall = () => {
    if (incomingCall) {
      incomingCall.answer();
      setIncomingCall(null);
      message.success("📞 Đã trả lời cuộc gọi");
    }
  };

  const handleRejectCall = () => {
    if (incomingCall) {
      incomingCall.reject();
      setIncomingCall(null);
      message.info("🚫 Đã từ chối cuộc gọi");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center z-50 p-4">
      <div className="relative flex justify-center items-center w-full max-w-3xl bg-gray-900 rounded-2xl overflow-hidden shadow-lg">
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-full max-h-[70vh] object-cover"
        />
        <video
          ref={localVideoRef}
          autoPlay
          muted
          playsInline
          className="absolute bottom-4 right-4 w-40 h-28 rounded-lg border-2 border-white shadow-md"
        />
      </div>

      <div className="flex justify-center gap-4 mt-6">
        <Button
          shape="circle"
          size="large"
          onClick={handleToggleMic}
          icon={isMicOn ? <AiOutlineAudio /> : <AiOutlineAudioMuted />}
        />
        <Button
          shape="circle"
          danger
          size="large"
          onClick={handleEndCall}
          icon={<AiOutlinePhone />}
        />
        {!isConnected && callTo && (
          <Button type="primary" onClick={handleStartCall}>
            📞 Gọi
          </Button>
        )}
      </div>

      {incomingCall && (
        <div className="absolute bottom-10 bg-white p-4 rounded-xl shadow-lg text-center">
          <p className="font-semibold mb-3">📞 Cuộc gọi đến từ: {incomingCall.fromNumber}</p>
          <div className="flex justify-center gap-3">
            <Button type="primary" onClick={handleAnswerCall}>
              Trả lời
            </Button>
            <Button danger onClick={handleRejectCall}>
              Từ chối
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoCallRoom;
