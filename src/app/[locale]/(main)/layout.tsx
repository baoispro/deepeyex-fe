import Footer from "@/app/modules/home/components/Footer";
import Header from "@/app/modules/home/components/Header";
import { ChatBox } from "@/app/shares/components/ChatBox";
import type { ReactNode } from "react";

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 font-sans text-gray-800">
      <Header />
      <main className="flex-grow pt-24 relative">{children}</main>
      <Footer />
      <ChatBox />
    </div>
  );
}
