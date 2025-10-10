"use client";
import React, { useEffect, useRef, useState } from "react";
import { Button, Input, message } from "antd";
import {
  AiOutlineAudio,
  AiOutlineAudioMuted,
  AiOutlineVideoCamera,
  AiOutlineVideoCameraAdd,
  AiOutlinePhone,
  AiOutlineMessage,
} from "react-icons/ai";

const VideoCallRoom = ({ onLeave }: { onLeave: () => void }) => {
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCamOn, setIsCamOn] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [messages, setMessages] = useState<string[]>([]);
  const [newMessage, setNewMessage] = useState("");

  // 🔹 Mở camera khi vào phòng
  useEffect(() => {
    const startCamera = async () => {
      try {
        const userStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = userStream;
        }
        setStream(userStream);
      } catch (err) {
        message.error("Không thể truy cập camera/micro");
        console.error(err);
      }
    };
    startCamera();

    return () => {
      // Cleanup khi rời phòng
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  // 🔹 Bật / tắt camera
  const toggleCamera = () => {
    if (!stream) return;
    stream.getVideoTracks().forEach((track) => (track.enabled = !isCamOn));
    setIsCamOn(!isCamOn);
  };

  // 🔹 Bật / tắt mic
  const toggleMic = () => {
    if (!stream) return;
    stream.getAudioTracks().forEach((track) => (track.enabled = !isMicOn));
    setIsMicOn(!isMicOn);
  };

  // 🔹 Gửi tin nhắn
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
          className="rounded-lg w-[90%] max-h-[90%] object-cover"
        />
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3">
          <Button
            shape="circle"
            size="large"
            onClick={toggleMic}
            icon={isMicOn ? <AiOutlineAudio /> : <AiOutlineAudioMuted />}
            title="Bật / tắt mic"
          />
          <Button
            shape="circle"
            size="large"
            onClick={toggleCamera}
            icon={isCamOn ? <AiOutlineVideoCamera /> : <AiOutlineVideoCameraAdd />}
            title="Bật / tắt camera"
          />
          <Button
            shape="circle"
            danger
            size="large"
            icon={<AiOutlinePhone />}
            onClick={() => {
              onLeave();
              stream?.getTracks().forEach((t) => t.stop());
              message.info("Đã rời phòng");
            }}
            title="Rời phòng"
          />
          <Button
            shape="circle"
            size="large"
            icon={<AiOutlineMessage />}
            onClick={() => setIsChatOpen(!isChatOpen)}
            title="Hiện / ẩn chat"
          />
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
