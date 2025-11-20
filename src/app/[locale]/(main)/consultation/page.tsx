"use client";
import React, { useState, useEffect } from "react";
import { Tabs, List, Avatar, Button, Card, message, Spin } from "antd";
import { AiOutlineInfoCircle } from "react-icons/ai";
import ChatBox from "@/app/modules/hospital/components/Chatbox";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "@/app/shares/configs/firebase";
import ChatHeader from "@/app/modules/hospital/components/VideoCallRoom";
import { useSelector } from "react-redux";
import { RootState } from "@/app/shares/stores";
import { useGetAppointmentsOnline } from "@/app/modules/hospital/hooks/queries/appointment/use-get-appointments-online";
import { Appointment } from "@/app/modules/hospital/types/appointment";
import { useTranslations } from "next-intl";

interface Conversation {
  id: string;
  participants: string[];
  doctorInfo: {
    id: string;
    name: string;
    avatar: string;
    email: string;
  };
  patientInfo: {
    id: string;
    name: string;
    avatar: string;
    email: string;
  };
  lastAppointmentId?: string;
  lastMessage?: string;
  createdAt?: { seconds: number; nanoseconds: number };
  updatedAt?: { seconds: number; nanoseconds: number };
}

const Consultation = () => {
  const t = useTranslations("booking");
  const [selectedChat, setSelectedChat] = useState<Conversation | null>(null); // dùng cho tab lịch sử tư vấn

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("online");
  const [showInfo, setShowInfo] = useState(false);
  const user_id = useSelector((state: RootState) => state.auth.userId);
  const patient_id = useSelector((state: RootState) => state.auth.patient?.patientId);
  const auth = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (!patient_id) return;

    const q = query(
      collection(db, "conversations"),
      where("participants", "array-contains", patient_id),
    );

    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Conversation[];
        setConversations(data);
        setLoading(false);
      },
      (error) => {
        console.error(t("consultation.messages.conversationError"), error);
        setLoading(false);
      },
    );

    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patient_id]);

  const handleJoinRoom = (item: Conversation) => {
    const isPatient = auth?.role === "patient";
    const other = isPatient ? item.doctorInfo : item.patientInfo;

    message.success(`${t("consultation.messages.openingChat")} ${other.name}`);
    setSelectedChat(item);
    setShowInfo(false);
  };

  const { data, isLoading, isError } = useGetAppointmentsOnline({
    book_user_id: user_id || "",
  });

  return (
    <div className="aspect-1.85:1 px-4">
      <Card className="h-full rounded-2xl shadow-md overflow-hidden">
        <Tabs
          activeKey={activeTab}
          onChange={(key) => setActiveTab(key)}
          items={[
            {
              key: "online",
              label: t("consultation.tabs.online"),
              children: (
                <div className="flex flex-col gap-5">
                  {/** Gọi API lấy danh sách lịch tư vấn online */}
                  {(() => {
                    if (isLoading) {
                      return (
                        <div className="flex justify-center items-center h-40">
                          <Spin size="large" tip={t("consultation.online.loading")} />
                        </div>
                      );
                    }

                    if (isError || !data?.data?.length) {
                      return (
                        <div className="text-center text-gray-400 mt-6">
                          {t("consultation.online.noAppointments")}
                        </div>
                      );
                    }

                    return (
                      <>
                        {data.data.map((appointment: Appointment) => (
                          <div
                            key={appointment.appointment_id}
                            className="flex items-center justify-between p-4 bg-white rounded-2xl shadow-md hover:shadow-xl transition-all cursor-pointer space-x-4"
                          >
                            {/* Thông tin bác sĩ */}
                            <div className="flex items-center gap-4">
                              {/* Avatar */}
                              <Avatar
                                src={
                                  appointment.doctor.image ||
                                  `https://api.dicebear.com/7.x/initials/svg?seed=${appointment.doctor.full_name}`
                                }
                                className="w-12 h-12"
                              />

                              {/* Info */}
                              <div className="flex flex-col">
                                <span className="font-semibold text-gray-800 text-base">
                                  {appointment.doctor.full_name || t("consultation.online.doctor")}
                                </span>
                                <span className="text-gray-500 text-sm">
                                  {new Date(appointment.time_slots[0].start_time).toLocaleString()}
                                </span>
                                <span className="mt-1 px-2 py-1 w-max rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  {appointment.status === "PENDING_ONLINE"
                                    ? t("consultation.online.status.pending")
                                    : appointment.status === "CONFIRMED_ONLINE"
                                      ? t("consultation.online.status.confirmed")
                                      : t("consultation.online.status.completed")}
                                </span>
                              </div>
                            </div>

                            {/* Nút gọi video */}
                            <div>
                              <ChatHeader userId={appointment.doctor.user_id} />
                            </div>
                          </div>
                        ))}
                      </>
                    );
                  })()}
                </div>
              ),
            },
            {
              key: "history",
              label: t("consultation.tabs.history"),
              children: (
                <div className="flex h-[30vh] md:h-[75vh] xl:h-[60vh]">
                  {/* Sidebar hội thoại */}
                  <div className="w-1/4 border-r bg-white flex flex-col">
                    <div className="p-4 text-lg font-semibold border-b">
                      {t("consultation.history.conversationList")}
                    </div>
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
                          const isPatient = auth?.role === "patient";
                          const other = isPatient ? item.doctorInfo : item.patientInfo;
                          const isActive = selectedChat?.id === item.id;

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
                                    src={
                                      other.avatar ||
                                      `https://api.dicebear.com/7.x/initials/svg?seed=${other.name}`
                                    }
                                  />
                                }
                                title={<span className="font-semibold">{other.name}</span>}
                                description={
                                  item.lastMessage ? (
                                    item.lastMessage
                                  ) : (
                                    <span className="text-gray-400 italic">
                                      {t("consultation.history.noMessage")}
                                    </span>
                                  )
                                }
                              />
                            </List.Item>
                          );
                        }}
                      />
                    ) : (
                      <div className="text-center text-gray-400 mt-10">
                        {t("consultation.history.noConversations")}
                      </div>
                    )}
                  </div>

                  {/* Chat + Info */}
                  <div className="flex-1 flex bg-gray-50">
                    {selectedChat ? (
                      <>
                        {/* Khu vực chat */}
                        <div className={`flex flex-col w-${showInfo ? "2/3" : "full"} border-r`}>
                          {/* Header */}
                          <div className="flex justify-between items-center p-4 border-b bg-white shadow-sm">
                            <div className="flex items-center gap-3">
                              <Avatar
                                src={
                                  (auth?.role === "patient"
                                    ? selectedChat.doctorInfo.avatar
                                    : selectedChat.patientInfo.avatar) ||
                                  `https://api.dicebear.com/7.x/initials/svg?seed=${
                                    auth?.role === "patient"
                                      ? selectedChat.doctorInfo.name
                                      : selectedChat.patientInfo.name
                                  }`
                                }
                                size={48}
                              />
                              <div>
                                <p className="font-semibold text-lg text-gray-800">
                                  {auth?.role === "patient"
                                    ? selectedChat.doctorInfo.name
                                    : selectedChat.patientInfo.name}
                                </p>
                                <p className="text-xs text-green-600">
                                  {t("consultation.history.active")}
                                </p>
                              </div>
                            </div>

                            <Button
                              type="text"
                              icon={<AiOutlineInfoCircle size={22} />}
                              onClick={() => setShowInfo(!showInfo)}
                            />
                          </div>

                          {/* ChatBox */}
                          <div className="flex-1 overflow-y-auto bg-gray-50">
                            <ChatBox
                              conversationId={selectedChat.id}
                              otherUser={
                                patient_id === selectedChat.doctorInfo.id
                                  ? selectedChat.patientInfo
                                  : selectedChat.doctorInfo
                              }
                            />
                          </div>
                        </div>

                        {/* Khu vực thông tin bên phải */}
                        {showInfo && (
                          <div className="w-1/3 bg-white p-4 flex flex-col border-l shadow-inner">
                            <h3 className="text-lg font-semibold mb-4">
                              {t("consultation.history.conversationInfo")}
                            </h3>

                            <div className="flex items-center gap-3 mb-4">
                              <Avatar
                                size={60}
                                src={
                                  auth?.role === "patient"
                                    ? selectedChat.doctorInfo.avatar
                                    : selectedChat.patientInfo.avatar
                                }
                              />
                              <div>
                                <p className="font-semibold text-base">
                                  {auth?.role === "patient"
                                    ? selectedChat.doctorInfo.name
                                    : selectedChat.patientInfo.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {selectedChat.participants.join(", ")}
                                </p>
                              </div>
                            </div>

                            <div className="space-y-2 text-sm text-gray-600">
                              <p>
                                <span className="font-medium">
                                  {t("consultation.history.createdDate")}{" "}
                                </span>
                                {selectedChat.createdAt
                                  ? new Date(selectedChat.createdAt.seconds * 1000).toLocaleString()
                                  : t("consultation.history.unknown")}
                              </p>
                              <p>
                                <span className="font-medium">
                                  {t("consultation.history.lastAppointment")}{" "}
                                </span>
                                {selectedChat.lastAppointmentId || t("consultation.history.none")}
                              </p>
                              <p>
                                <span className="font-medium">
                                  {t("consultation.history.lastMessage")}{" "}
                                </span>
                                {selectedChat.lastMessage || t("consultation.history.none")}
                              </p>
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="flex flex-col justify-center items-center w-full text-gray-400 text-lg">
                        {t("consultation.history.selectConversation")}
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
