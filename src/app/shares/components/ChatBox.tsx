"use client";

import { useState, useRef, useEffect } from "react";
import Markdown from "react-markdown";
import { geminiApi } from "../api/chat";

export function ChatBox() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ sender: "user" | "bot"; text: string }[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const toggleChat = () => {
    setIsChatOpen((prev) => !prev);
  };

  const handleSendMessage = async () => {
    if (inputValue.trim() === "") return;

    const userMessage = inputValue;
    setChatMessages((prev) => [...prev, { sender: "user", text: userMessage }]);
    setInputValue("");

    setIsLoading(true);

    try {
      const reply = await geminiApi.sendMessage(userMessage);
      setChatMessages((prev) => [...prev, { sender: "bot", text: reply }]);
    } catch (error) {
      console.error("Error sending message:", error);
      setChatMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Xin lỗi, đã xảy ra lỗi khi nhận phản hồi." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, isLoading]);

  const renderMessage = (msg: { sender: "user" | "bot"; text: string }, idx: number) => {
    const isUser = msg.sender === "user";

    const messageText = msg.text;

    return (
      <div key={idx} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
        <div
          className={`px-3 py-2 rounded-xl text-sm break-words inline-block whitespace-pre-wrap ${
            isUser ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-900"
          }`}
          style={{ maxWidth: "75%" }}
        >
          <Markdown>{messageText}</Markdown>
        </div>
      </div>
    );
  };

  return (
    <div>
      <button
        onClick={toggleChat}
        className="fixed bottom-6 right-6 z-50 bg-[#1250dc] hover:bg-[#0e3eb7] text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg transition-all"
        aria-label="Toggle Chat"
      >
        💬
      </button>

      {isChatOpen && (
        <div className="fixed bottom-24 right-6 w-[320px] h-[400px] bg-white shadow-lg rounded-xl border z-50 flex flex-col overflow-hidden">
          <div className="bg-[#1250dc] text-white p-3 font-semibold flex justify-between items-center">
            <span>Chatbot</span>
            <button onClick={toggleChat} className="text-white font-bold" aria-label="Close Chat">
              ×
            </button>
          </div>
          <div className="flex-1 p-4 overflow-y-auto text-sm text-[#333] space-y-2">
            <div className="text-gray-500">👋 Xin chào! Tôi có thể giúp gì cho bạn?</div>
            {chatMessages.map(renderMessage)}
            {isLoading && (
              <div className="flex justify-start">
                <div
                  className="px-3 py-2 rounded-xl text-sm bg-gray-200 text-gray-900 break-words inline-block whitespace-pre-wrap"
                  style={{ maxWidth: "75%" }}
                >
                  <span className="animate-pulse">Đang gõ ...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
          <div className="p-2 border-t flex items-center gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !isLoading && handleSendMessage()}
              className="flex-1 px-3 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-[#1250dc]"
              placeholder={isLoading ? "Đang chờ..." : "Nhập tin nhắn..."}
              disabled={isLoading}
            />
            <button
              onClick={handleSendMessage}
              className={`px-3 py-1 rounded-2xl transition-colors ${
                isLoading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#1250dc] text-white hover:bg-[#0e3eb7]"
              }`}
              disabled={isLoading || inputValue.trim() === ""}
            >
              Gửi
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
