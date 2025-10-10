// ChatBox.tsx
"use client";
import React, { useState, useEffect, useRef } from "react";
import { Input, Button } from "antd";
import { FaPaperPlane } from "react-icons/fa";
import {
  collection,
  addDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "@/app/shares/configs/firebase";

interface Message {
  id: string;
  text: string;
  sender: string;
  timestamp?: any;
}

interface ChatBoxProps {
  conversationId: string; // id của cuộc trò chuyện
  otherUser: string; // email hoặc id của người kia
}

const ChatBox: React.FC<ChatBoxProps> = ({ conversationId, otherUser }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // 🔹 Realtime listener theo conversationId
  useEffect(() => {
    if (!conversationId) return;

    const q = query(
      collection(db, "conversations", conversationId, "messages"),
      orderBy("timestamp", "asc"),
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const msgs: Message[] = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            text: data.text ?? "",
            sender: data.sender ?? "Unknown",
            timestamp: data.timestamp ?? null,
          };
        });

        setMessages(msgs);

        // 🔹 Tự động cuộn xuống cuối cùng
        setTimeout(() => {
          scrollRef.current?.scrollTo({
            top: scrollRef.current.scrollHeight,
            behavior: "smooth",
          });
        }, 100);
      },
      (error) => {
        console.error("❌ Firestore onSnapshot error:", error);
      },
    );

    return () => unsubscribe();
  }, [conversationId]);

  // 🔹 Gửi tin nhắn
  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    try {
      await addDoc(collection(db, "conversations", conversationId, "messages"), {
        text: trimmed,
        sender: auth.currentUser?.email ?? "Anonymous",
        timestamp: serverTimestamp(),
      });
      setInput("");
    } catch (error) {
      console.error("❌ Send message error:", error);
    }
  };

  return (
    <div className="flex flex-col h-full rounded-md bg-white shadow-md">
      {/* 🔹 Message list */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-2"
        style={{ maxHeight: "400px" }}
      >
        {messages.map((msg) => {
          const isMe = msg.sender === auth.currentUser?.email;
          return (
            <div key={msg.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
              {!isMe && <span className="text-xs text-gray-500 mb-1">{msg.sender}</span>}
              <div
                className={`max-w-[70%] p-2 rounded-lg break-words ${
                  isMe
                    ? "bg-blue-500 text-white rounded-br-none"
                    : "bg-gray-200 text-black rounded-bl-none"
                }`}
              >
                {msg.text}
              </div>
            </div>
          );
        })}
      </div>

      {/* 🔹 Input box */}
      <div className="flex p-2 border-t bg-gray-50">
        <Input.TextArea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Nhập tin nhắn..."
          autoSize={{ minRows: 1, maxRows: 5 }}
          onPressEnter={(e) => {
            if (!e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
          className="flex-grow mr-2 rounded-md"
        />
        <Button
          type="primary"
          icon={<FaPaperPlane />}
          onClick={sendMessage}
          disabled={!input.trim()}
        />
      </div>
    </div>
  );
};

export default ChatBox;
