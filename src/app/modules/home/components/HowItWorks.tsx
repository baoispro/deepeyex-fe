export default function HowItWorks() {
  return (
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
                <h3 className="text-xl md:text-2xl font-bold mb-4">Upload ảnh mắt / scan mắt</h3>
                <p className="text-base text-gray-600">
                  Tải lên hình ảnh mắt hoặc thực hiện quét mắt bằng thiết bị tương thích để bắt đầu
                  quá trình phân tích.
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
                <h3 className="text-xl md:text-2xl font-bold mb-4">Nhận kết quả & khuyến nghị</h3>
                <p className="text-base text-gray-600">
                  Nhận báo cáo chi tiết về tình trạng mắt của bạn kèm theo các khuyến nghị cá nhân
                  hóa để cải thiện sức khỏe.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
