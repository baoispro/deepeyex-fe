"use client";
import { ChatBox } from "../shares/components/ChatBox";
import HeroCarousel from "../modules/home/components/HeroCarousel";
import Header from "../modules/home/components/Header";
import { Link } from "../shares/locales/navigation";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100 font-sans text-gray-800">
      {/* Header */}
      <Header />

      {/* Hero Carousel */}
      <main className="flex-grow pt-24 relative">
        <HeroCarousel />
        <section id="about" className="relative">
          <div className="py-4 px-6 md:px-12">
            <div className="flex justify-between gap-20">
              <div>
                <div className="mb-6 relative">
                  {/* Who We Are? */}
                  <span
                    className="relative inline-block text-8xl font-jost font-extrabold text-transparent"
                    style={{
                      background: "-webkit-linear-gradient(0deg, #f4e5da, #def4f1 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    Who We Are?
                  </span>

                  {/* H2 nằm trên */}
                  <h2 className="absolute -bottom-10 left-0 text-3xl font-semibold text-gray-800">
                    AI-Powered Eye Diagnosis for Early Detection and Vision Care
                  </h2>
                </div>
                <p className="mt-15 text-gray-700 text-justify">
                  DeepEyeX is an AI-powered eye disease diagnosis system that helps you detect eye
                  conditions early, ensuring precise, personalized, and holistic care for your
                  vision. With up to 94% accuracy, you can trust our technology to protect your eyes
                  and take control of your eye health.
                </p>
              </div>
              <div className="relative inline-block flex-shrink-0">
                <Image
                  src="https://23july.hostlin.com/optcare/wp-content/uploads/2022/05/about-1.png"
                  alt="About Us"
                  width={500}
                  height={500}
                  className="relative"
                />
                <div className="absolute left-0 bottom-0 p-4 bg-[#f17732] rounded-lg flex items-center space-x-2 w-60 gap-5">
                  <h2 className="text-lg font-bold text-white">10,000+</h2>
                  <h4 className="text-sm text-white">Eyes Diagnosed with AI Precision</h4>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="Ophthalmologist" className="relative">
          <div className="py-4 px-6 md:px-12">
            <div className="flex flex-col justify-between gap-20">
              <div className="flex flex-col items-center text-center">
                <div className="mb-6 relative">
                  <span
                    className="relative inline-block text-8xl font-jost font-extrabold text-transparent"
                    style={{
                      background: "-webkit-linear-gradient(0deg, #f4e5da, #def4f1 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    Ophthalmologist
                  </span>

                  <h2 className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-3xl font-semibold text-gray-800">
                    The Most Qualified Skillful & Professional staff
                  </h2>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8 mt-5">
                <div className="relative bg-white shadow-lg rounded-2xl overflow-hidden group">
                  <Image
                    src="https://23july.hostlin.com/optcare/wp-content/uploads/2022/10/team-7-2.jpg"
                    alt="Susan Hopkins"
                    width={300}
                    height={300}
                    className="w-full h-auto object-cover transition-transform duration-300 ease-in-out transform group-hover:scale-105"
                  />
                  <div
                    className="p-6"
                    style={{
                      background: "-webkit-linear-gradient(10deg, #dff4f1, #faeae1 100%)",
                    }}
                  >
                    <h3 className="text-xl font-semibold text-gray-800">Susan Hopkins</h3>
                    <p className="text-gray-600">Cataract surgery</p>
                  </div>
                </div>

                <div className="relative bg-white shadow-lg rounded-2xl overflow-hidden group">
                  <Image
                    src="https://23july.hostlin.com/optcare/wp-content/uploads/2022/05/team-7.jpg"
                    alt="Keanu Reeves"
                    width={300}
                    height={300}
                    className="w-full h-auto object-cover transition-transform duration-300 ease-in-out transform group-hover:scale-105"
                  />
                  <div
                    className="p-6"
                    style={{
                      background: "-webkit-linear-gradient(10deg, #dff4f1, #faeae1 100%)",
                    }}
                  >
                    <h3 className="text-xl font-semibold text-gray-800">Keanu Reeves</h3>
                    <p className="text-gray-600">Clarivu eye</p>
                  </div>
                </div>

                <div className="relative bg-white shadow-lg rounded-2xl overflow-hidden group">
                  <Image
                    src="https://23july.hostlin.com/optcare/wp-content/uploads/2022/05/team-7.jpg"
                    alt="Dr.Robert De Niro"
                    width={300}
                    height={300}
                    className="w-full h-auto object-cover transition-transform duration-300 ease-in-out transform group-hover:scale-105"
                  />
                  <div
                    className="p-6"
                    style={{
                      background: "-webkit-linear-gradient(10deg, #dff4f1, #faeae1 100%)",
                    }}
                  >
                    <h3 className="text-xl font-semibold text-gray-800">Dr. Robert De Niro</h3>
                    <p className="text-gray-600">Glaucoma</p>
                  </div>
                </div>

                <div className="relative bg-white shadow-lg rounded-2xl overflow-hidden group">
                  <Image
                    src="https://23july.hostlin.com/optcare/wp-content/uploads/2022/05/team-7.jpg"
                    alt="Dr.Mel Gibson"
                    width={300}
                    height={300}
                    className="w-full h-auto object-cover transition-transform duration-300 ease-in-out transform group-hover:scale-105"
                  />
                  <div
                    className="p-6"
                    style={{
                      background: "-webkit-linear-gradient(10deg, #dff4f1, #faeae1 100%)",
                    }}
                  >
                    <h3 className="text-xl font-semibold text-gray-800">Dr. Mel Gibson</h3>
                    <p className="text-gray-600">Laboratory</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="how_it_works" className="relative">
          <div className="py-4 px-6 md:px-12">
            <div className="flex flex-col justify-between gap-20">
              <div className="flex flex-col items-center text-center">
                <div className="mb-6 relative">
                  <span
                    className="relative inline-block text-8xl font-jost font-extrabold text-transparent"
                    style={{
                      background: "-webkit-linear-gradient(0deg, #f4e5da, #def4f1 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    How It Works
                  </span>

                  <h2 className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-3xl font-semibold text-gray-800">
                    How it Helps You to Keep Healthy
                  </h2>
                </div>

                <div className="flex flex-col md:flex-row justify-center items-start gap-12 md:gap-24 text-center mt-20 md:mt-10">
                  <div className="flex flex-col items-center w-full md:w-1/3 p-4">
                    <div className="text-3xl md:text-5xl font-semibold text-gray-700 mb-6">1</div>
                    <h3 className="text-xl md:text-2xl font-bold mb-4">
                      Upload ảnh mắt / scan mắt
                    </h3>
                    <p className="text-base text-gray-600">
                      Tải lên hình ảnh mắt hoặc thực hiện quét mắt bằng thiết bị tương thích để bắt
                      đầu quá trình phân tích.
                    </p>
                  </div>

                  <div className="flex flex-col items-center w-full md:w-1/3 p-4">
                    <div className="text-3xl md:text-5xl font-semibold text-gray-700 mb-6">2</div>
                    <h3 className="text-xl md:text-2xl font-bold mb-4">
                      AI phân tích & phát hiện dấu hiệu sớm
                    </h3>
                    <p className="text-base text-gray-600">
                      Hệ thống AI sẽ phân tích hình ảnh để tìm kiếm các dấu hiệu bất thường tiềm ẩn,
                      giúp phát hiện sớm các vấn đề.
                    </p>
                  </div>

                  <div className="flex flex-col items-center w-full md:w-1/3 p-4">
                    <div className="text-3xl md:text-5xl font-semibold text-gray-700 mb-6">3</div>
                    <h3 className="text-xl md:text-2xl font-bold mb-4">
                      Nhận kết quả & khuyến nghị
                    </h3>
                    <p className="text-base text-gray-600">
                      Nhận báo cáo chi tiết về tình trạng mắt của bạn kèm theo các khuyến nghị cá
                      nhân hóa để cải thiện sức khỏe.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
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
