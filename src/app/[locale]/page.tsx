"use client";
import { ChatBox } from "../shares/components/ChatBox";
import HeroCarousel from "../modules/home/components/HeroCarousel";
import Header from "../modules/home/components/Header";
import { Link } from "../shares/locales/navigation";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100 font-sans text-gray-800">
      {/* Header */}
      <Header />

      {/* Hero Carousel */}
      <main className="flex-grow pt-24 relative">
        <HeroCarousel />
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between items-center">
          <p>
            &copy; 2025 DeepEyeX.{" "}
            {/* {language === "vi" ? "Bảo lưu mọi quyền." : "All rights reserved."} */}
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="#" className="hover:text-white transition">
              Facebook
            </Link>
            <Link href="#" className="hover:text-white transition">
              Twitter
            </Link>
            <Link href="#" className="hover:text-white transition">
              LinkedIn
            </Link>
          </div>
        </div>
      </footer>

      <ChatBox />
    </div>
  );
}
