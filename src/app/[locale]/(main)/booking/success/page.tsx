export default function ConfirmOrderPage() {
  return (
    <div className="py-5 px-10">
      <div className="bg-white rounded-xl flex justify-between p-5">
        <div className="flex flex-col gap-5 flex-1/2">
          <h1 className="text-4xl font-bold">Cảm ơn bạn đã đặt hàng!</h1>
          <p className="text-sm text-[#9a9292]">
            Yêu cầu của bạn đã được tiếp nhận và đang được xử lý. Bạn sẽ nhận được cập nhật và nhắc
            nhở qua email hoặc thông báo khi lịch hẹn của bạn được xác nhận hoặc khi đơn thuốc của
            bạn đã được chuẩn bị và giao đi.
          </p>
        </div>
        <div className="flex-1/2">
          <div className="bg-[#f6f6f6] relative rounded-4xl overflow-hidden pb-10">
            <div className="p-6">
              <h2 className="font-bold text-xl">Order Summary</h2>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between">
                  <p>Date</p>
                  <p>20/10/2003</p>
                </div>
                <div className="flex justify-between">
                  <p>Order Number</p>
                  <p>1234567890</p>
                </div>
                <div className="flex justify-between">
                  <p>Payment Method</p>
                  <p>Mastercard</p>
                </div>
              </div>
            </div>

            <svg
              className="absolute bottom-0 left-0 w-full h-12"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 100 15"
              preserveAspectRatio="none"
            >
              <path
                d="M0 0 
       Q 5 15 10 0 
       Q 15 15 20 0 
       Q 25 15 30 0 
       Q 35 15 40 0 
       Q 45 15 50 0 
       Q 55 15 60 0 
       Q 65 15 70 0 
       Q 75 15 80 0 
       Q 85 15 90 0 
       Q 95 15 100 0 
       V15 H0Z"
                fill="#fff"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
