"use client";
import React, { useState, useEffect } from "react";
import { Tabs, List, Avatar, Button, Card, message, Spin } from "antd";
import {
  AiOutlineVideoCamera,
  AiOutlineAudio,
  AiOutlineAudioMuted,
  AiOutlinePhone,
} from "react-icons/ai";
import ChatBox from "@/app/modules/hospital/components/Chatbox";
import { collection, onSnapshot, query, where, doc, setDoc, getDocs } from "firebase/firestore";
import { db } from "@/app/shares/configs/firebase";
import VideoCallRoom from "@/app/modules/hospital/components/VideoCallRoom";

const Consultation = () => {
  const [showCall, setShowCall] = useState(false);
  const [isMicOn, setIsMicOn] = useState(true);
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("history");

  const patientEmail = "nguyenlegiabao810@gmail.com";
  const doctorEmail = "baon00382xxx@gmail.com";

  // 🔹 Khởi tạo hội thoại mẫu nếu chưa có
  useEffect(() => {
    const setupConversation = async () => {
      try {
        const q = query(
          collection(db, "conversations"),
          where("participants", "array-contains", patientEmail),
        );
        const snapshot = await getDocs(q);
        const exists = snapshot.docs.find(
          (d) =>
            d.data().participants.includes(patientEmail) &&
            d.data().participants.includes(doctorEmail),
        );

        if (!exists) {
          const convId = "conversation-" + Date.now();
          const conversationRef = doc(db, "conversations", convId);
          await setDoc(conversationRef, {
            participants: [patientEmail, doctorEmail],
            createdAt: new Date(),
            lastMessage: "Xin chào bác sĩ!",
            appointmentId: "appt-" + Date.now(),
          });
          console.log("✅ Đã tạo cuộc hội thoại mẫu giữa 2 email");
        }
      } catch (err) {
        console.error("❌ Lỗi khi tạo conversation mẫu:", err);
      }
    };
    setupConversation();
  }, []);

  // 🔹 Lấy danh sách hội thoại realtime
  useEffect(() => {
    const q = query(
      collection(db, "conversations"),
      where("participants", "array-contains", patientEmail),
    );

    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setConversations(data);
        setLoading(false);
      },
      (error) => {
        console.error("❌ Firestore error:", error);
        setLoading(false);
      },
    );

    return () => unsub();
  }, []);

  const handleJoinRoom = (item: any) => {
    const other = item.participants?.find((p: string) => p !== patientEmail) || "Người dùng khác";
    message.success(`Đang mở chat với ${other}`);
    setSelectedConversation(item);
  };

  return (
    <div className="aspect-[1.85:1] px-4">
      <Card className="h-full rounded-2xl shadow-md overflow-hidden">
        <Tabs
          activeKey={activeTab}
          onChange={(key) => setActiveTab(key)}
          items={[
            {
              key: "online",
              label: "🎥 Phòng tư vấn trực tuyến",
              children: showCall ? (
                <VideoCallRoom onLeave={() => setShowCall(false)} />
              ) : (
                <div className="flex flex-col h-[600px] bg-gray-100 rounded-xl p-6 justify-center items-center">
                  <h2 className="text-2xl font-semibold mb-4 text-gray-800">
                    Phòng tư vấn trực tuyến
                  </h2>
                  <p className="text-gray-500 mb-6">
                    Bạn có thể tham gia buổi tư vấn qua video call với bác sĩ.
                  </p>
                  <div className="flex gap-3">
                    <Button
                      type="primary"
                      icon={<AiOutlineVideoCamera />}
                      size="large"
                      onClick={() => setShowCall(true)}
                    >
                      Tham gia ngay
                    </Button>
                    <Button
                      icon={<AiOutlineAudio />}
                      onClick={() => message.info("🔈 Đang bật micro...")}
                    >
                      Kiểm tra micro
                    </Button>
                  </div>
                </div>
              ),
            },

            {
              key: "history",
              label: "💬 Lịch sử tư vấn",
              children: (
                <div className="flex">
                  {/* Sidebar hội thoại */}
                  <div className="w-1/3 border-r bg-white flex flex-col">
                    <div className="p-4 text-lg font-semibold border-b">Danh sách hội thoại</div>

                    {loading ? (
                      <div className="flex-1 flex justify-center items-center">
                        <Spin size="large" />
                      </div>
                    ) : conversations.length > 0 ? (
                      <List
                        className="overflow-y-auto flex-1"
                        itemLayout="horizontal"
                        dataSource={conversations}
                        renderItem={(item) => {
                          const myEmail = patientEmail;
                          const other =
                            item.participants?.find((p: string) => p !== myEmail) ||
                            "Người dùng khác";
                          const isActive = selectedConversation?.id === item.id;

                          return (
                            <List.Item
                              className={`cursor-pointer px-4 py-3 hover:bg-gray-100 transition ${
                                isActive ? "bg-blue-50 border-l-4 border-blue-500" : ""
                              }`}
                              onClick={() => handleJoinRoom(item)}
                            >
                              <List.Item.Meta
                                avatar={
                                  <Avatar
                                    src={`https://api.dicebear.com/7.x/initials/svg?seed=${other}`}
                                  />
                                }
                                title={<span className="font-semibold">{other}</span>}
                                description={item.lastMessage || "Chưa có tin nhắn"}
                              />
                            </List.Item>
                          );
                        }}
                      />
                    ) : (
                      <div className="text-center text-gray-400 mt-10">
                        Không có cuộc hội thoại nào.
                      </div>
                    )}
                  </div>

                  {/* Khu vực chat */}
                  <div className="flex-1 flex flex-col bg-gray-50">
                    {selectedConversation ? (
                      <>
                        {/* Header */}
                        <div className="flex justify-between items-center p-4 border-b bg-white shadow-sm">
                          <div className="flex items-center gap-3">
                            <Avatar
                              src={`https://api.dicebear.com/7.x/initials/svg?seed=${
                                selectedConversation.participants.find(
                                  (p: string) => p !== patientEmail,
                                ) || "User"
                              }`}
                              size={48}
                            />
                            <div>
                              <p className="font-semibold text-lg text-gray-800">
                                {selectedConversation.participants.find(
                                  (p: string) => p !== patientEmail,
                                ) || "Người dùng khác"}
                              </p>
                              <p className="text-xs text-green-600">Đang hoạt động</p>
                            </div>
                          </div>
                        </div>

                        {/* Chatbox */}
                        <div className="flex-1 overflow-y-auto bg-gray-50 max-h-[calc(100vh-320px)]">
                          <ChatBox
                            conversationId={selectedConversation.id}
                            otherUser={
                              selectedConversation.participants.find(
                                (p: string) => p !== patientEmail,
                              ) || "Người dùng khác"
                            }
                          />
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col justify-center items-center h-full text-gray-400 text-lg">
                        💬 Hãy chọn một cuộc hội thoại để bắt đầu
                      </div>
                    )}
                  </div>
                </div>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
};

export default Consultation;
