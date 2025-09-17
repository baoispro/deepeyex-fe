"use client";
import React, { useState } from "react";
import { Card, Input, Button } from "antd";
import {
  AiOutlineVideoCamera,
  AiOutlineVideoCameraAdd,
  AiOutlineAudio,
  AiOutlineAudioMuted,
  AiOutlinePhone,
} from "react-icons/ai"; // Từ react-icons/ai
import { FaPaperPlane } from "react-icons/fa"; // Từ react-icons/fa

const ConsultationRoom = () => {
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCamOn, setIsCamOn] = useState(true);

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Video Section */}
      <div className="flex-grow flex items-center justify-center p-4 relative">
        {/* Main Video (Bác sĩ) */}
        <div className="w-full h-full bg-black rounded-lg overflow-hidden relative">
          <div className="absolute top-2 left-2 text-white">
            <span className="bg-red-500 px-2 py-1 rounded-full text-xs">LIVE</span>
          </div>
          {/* Thay thế bằng component Video thực tế */}
          <div className="absolute inset-0 flex items-center justify-center text-white text-3xl">
            Video Bác sĩ
          </div>
        </div>

        {/* Small Video (Bệnh nhân) */}
        <div className="absolute bottom-6 right-6 w-40 h-32 bg-gray-700 rounded-lg overflow-hidden border-2 border-white">
          <div className="flex items-center justify-center h-full text-white text-xl">
            Video Bệnh nhân
          </div>
        </div>

        {/* Control Panel */}
        <div className="absolute bottom-20 flex justify-center w-full">
          <div className="bg-gray-800 p-3 rounded-full flex gap-4 text-white">
            <Button
              type="primary"
              shape="circle"
              icon={isCamOn ? <AiOutlineVideoCamera /> : <AiOutlineVideoCameraAdd />}
              onClick={() => setIsCamOn(!isCamOn)}
            />
            <Button
              type="primary"
              shape="circle"
              icon={isMicOn ? <AiOutlineAudio /> : <AiOutlineAudioMuted />}
              onClick={() => setIsMicOn(!isMicOn)}
            />
            <Button type="primary" danger shape="circle" icon={<AiOutlinePhone />} />
          </div>
        </div>
      </div>

      {/* Chat Section */}
      <Card className="m-4">
        <div className="h-64 overflow-y-auto mb-4 p-2 bg-gray-50 rounded-md">
          {/* Chat messages */}
          <div className="mb-2 text-right">
            <span className="bg-blue-500 text-white p-2 rounded-lg">
              Chào bác sĩ, em bị đau bụng.
            </span>
          </div>
          <div className="mb-2 text-left">
            <span className="bg-gray-300 p-2 rounded-lg">Chào bạn, bạn đau ở đâu?</span>
          </div>
        </div>
        <div className="flex">
          <Input.TextArea
            placeholder="Nhập tin nhắn..."
            autoSize={{ minRows: 1, maxRows: 3 }}
            className="flex-grow mr-2"
          />
          <Button type="primary" icon={<FaPaperPlane />} />
        </div>
      </Card>
    </div>
  );
};

export default ConsultationRoom;
