"use client";
import React, { useEffect, useRef, useState } from "react";
import { Button, Input } from "antd";
import {
  AiOutlineAudio,
  AiOutlineAudioMuted,
  AiOutlineVideoCamera,
  AiOutlineVideoCameraAdd,
  AiOutlinePhone,
  AiOutlineMessage,
} from "react-icons/ai";
import { loadStringeeSdk } from "@/app/shares/utils/stringee-sdk-loader";
import {
  connectToStringee,
  makeVideoCall,
  hangupCall,
  muteCall,
} from "@/app/shares/utils/stringee";
import { callEventEmitter } from "@/app/shares/utils/callEvents";

interface Props {
  userToken: string;
  callTo: string;
  onLeave: () => void;
}

const VideoCallRoom = ({ userToken, callTo, onLeave }: Props) => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const [isMicOn, setIsMicOn] = useState(true);
  const [isCamOn, setIsCamOn] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [messages, setMessages] = useState<string[]>([]);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    const init = async () => {
      await loadStringeeSdk();
      await connectToStringee(userToken);

      // Lắng nghe stream từ call
      callEventEmitter.on("local-stream", (stream: MediaStream) => {
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      });
      callEventEmitter.on("remote-stream", (stream: MediaStream) => {
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = stream;
      });
      callEventEmitter.on("incoming-call", (call: any) => {
        const answer = confirm(`Incoming call from: ${call.fromNumber}, answer?`);
        if (answer) call.makeCall(() => console.log("Call answered"));
      });
    };
    init();
  }, [userToken]);

  const handleStartCall = () => makeVideoCall(userToken, callTo, true);
  const handleEndCall = () => {
    hangupCall();
    onLeave();
  };
  const handleToggleMic = () => {
    muteCall(isMicOn);
    setIsMicOn(!isMicOn);
  };
  const handleToggleCam = () => {
    // enableCamera(!isCamOn);
    setIsCamOn(!isCamOn);
  };
  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    setMessages([...messages, newMessage]);
    setNewMessage("");
  };

  return (
    <div className="flex h-[600px] bg-gray-100 rounded-xl overflow-hidden shadow-inner">
      {/* Video */}
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
            onClick={handleToggleMic}
            icon={isMicOn ? <AiOutlineAudio /> : <AiOutlineAudioMuted />}
          />
          <Button
            shape="circle"
            size="large"
            onClick={handleToggleCam}
            icon={isCamOn ? <AiOutlineVideoCamera /> : <AiOutlineVideoCameraAdd />}
          />
          <Button
            shape="circle"
            danger
            size="large"
            icon={<AiOutlinePhone />}
            onClick={handleEndCall}
          />
          <Button
            shape="circle"
            size="large"
            icon={<AiOutlineMessage />}
            onClick={() => setIsChatOpen(!isChatOpen)}
          />
          <Button type="primary" onClick={handleStartCall}>
            📞 Gọi {callTo}
          </Button>
        </div>
      </div>

      {/* Chat */}
      {isChatOpen && (
        <div className="w-1/3 bg-white flex flex-col border-l">
          <div className="p-3 font-semibold border-b">💬 Chat</div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {messages.length === 0 ? (
              <p className="text-gray-400 text-sm">Chưa có tin nhắn</p>
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
