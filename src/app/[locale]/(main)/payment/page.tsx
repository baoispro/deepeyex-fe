"use client";

import { useRouter } from "@/app/shares/locales/navigation";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import { FaArrowLeft, FaRegCreditCard, FaMoneyBill } from "react-icons/fa";
import dayjs from "dayjs";
import { toast } from "react-toastify";
import { useCreateBookingMutation } from "@/app/modules/booking/hooks/mutations/use-create-booking.mutation";
import { BookingRequest } from "@/app/modules/booking/apis/bookingApi";
import { Patient } from "@/app/modules/hospital/types/patient";
import { useSelector } from "react-redux";
import { RootState } from "@/app/shares/stores";

interface BookingService {
  name: string;
  price: number;
}

interface BookingSlot {
  slot_id: string;
  start_time: string;
  end_time: string;
}

interface BookingInfo {
  patient: Patient | null;
  service: BookingService | null;
  slot: BookingSlot | null;
  doctor: { name: string | null; id: string | null };
  hospital: { name: string | null; id: string | null };
}

interface CartItem {
  key: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  oldPrice?: number;
}

const mockPaymentMethods = [
  {
    key: "cash",
    icon: <FaMoneyBill className="text-blue-500" />,
    name: "Thanh toán tiền mặt khi nhận hàng",
  },
  {
    key: "atm",
    icon: <FaRegCreditCard className="text-blue-500" />,
    name: "Thanh toán bằng thẻ ATM nội địa và tài khoản ngân hàng",
  },
];

const OrderPage = () => {
  const [type, setType] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [hoadon, setHoadon] = useState(false);
  const [bookingInfo, setBookingInfo] = useState<BookingInfo | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const auth = useSelector((state: RootState) => state.auth);
  const patient_id = auth.patient?.patientId;
  const user_id = auth.userId;

  const router = useRouter();

  const { mutate: createBooking, isPending } = useCreateBookingMutation({
    onSuccess: (res) => {
      toast.success("Booking created successfully!");
      console.log("Booking response:", res);
      // Sau khi tạo booking xong có thể chuyển tới trang thanh toán hoặc confirmation
      router.push("/booking/success");
    },
    onError: (err) => {
      toast.error("Booking failed: " + err.message);
    },
  });

  useEffect(() => {
    const localType = localStorage.getItem("type");
    setType(localType);

    if (localType === "booking") {
      const service = localStorage.getItem("bookingService");
      const slot = localStorage.getItem("bookingSlot");
      const patient = localStorage.getItem("bookingPatient");
      const doctorName = localStorage.getItem("doctor_name");
      const doctorId = localStorage.getItem("doctor_id");
      const hospitalName = localStorage.getItem("hospital_name");
      const hospitalId = localStorage.getItem("hospital_id");

      const itemList = [];
      if (service) {
        const s = JSON.parse(service);
        itemList.push({ key: s.name, name: s.name, price: s.price, quantity: 1 });
      }

      setCartItems(itemList);

      setBookingInfo({
        patient: patient ? JSON.parse(patient) : null,
        service: service ? JSON.parse(service) : null,
        slot: slot ? JSON.parse(slot) : null,
        doctor: { name: doctorName, id: doctorId },
        hospital: { name: hospitalName, id: hospitalId },
      });
    } else {
      // nếu là thuốc, có thể load cart từ mockCartItems hoặc API
      setCartItems([
        {
          key: "1",
          name: "Sữa Nutrifood Varna Colostrum 237ml hỗ trợ tăng cường sức đề kháng (24 Chai)",
          image: "/milk-product.png",
          price: 35000,
          oldPrice: 38500,
          quantity: 1,
        },
      ]);
    }
  }, []);

  // Tính tổng tiền
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const voucherDiscount = type === "thuoc" ? 3500 : 0;
  const shippingFee = type === "thuoc" ? 0 : 0;
  const total = subtotal - voucherDiscount - shippingFee;

  const handleCompleteOrder = async () => {
    if (!bookingInfo?.patient) {
      alert("Không tìm thấy thông tin bệnh nhân.");
      return;
    }

    if (!paymentMethod) {
      alert("Vui lòng chọn phương thức thanh toán.");
      return;
    }

    // Map cartItems sang order_items backend yêu cầu
    const order_items = cartItems.map((item) => ({
      drug_id: item.key.startsWith("drug_") ? item.key : undefined,
      service_id: item.key.startsWith("service_") ? item.key : undefined,
      item_name: item.name,
      quantity: item.quantity,
      price: item.price,
    }));

    const req: BookingRequest = {
      patient_id: patient_id || "",
      doctor_id: bookingInfo.doctor.id || "",
      hospital_id: bookingInfo.hospital.id || "",
      slot_ids: bookingInfo.slot ? [bookingInfo.slot.slot_id] : [],
      book_user_id: user_id || "",
      notes: "",
      order_items,
      payment_status: paymentMethod === "cash" ? "PENDING" : "PAID",
    };

    // Gọi mutation
    createBooking(req);

    // --- Gửi hóa đơn điện tử ---
    try {
      const invoice = {
        id: Date.now().toString(),
        type,
        shippingAddress: { customerEmail: bookingInfo.patient.email },
        items: cartItems,
        totalAmount: total,
        patient: bookingInfo.patient,
        doctor: bookingInfo.doctor,
        hospital: bookingInfo.hospital,
        slot: bookingInfo.slot,
      };

      const res = await fetch("/api/send-invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invoice),
      });

      const result = await res.json();
      if (result.success) {
        toast.success("Hóa đơn đã được gửi tới email của bạn!");
      } else {
        alert("Gửi hóa đơn thất bại: " + (result.error || "unknown error"));
      }
    } catch (error) {
      console.error(error);
      alert("Có lỗi xảy ra khi gửi hóa đơn.");
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
              <button
                className="flex items-center text-gray-600 hover:text-blue-500"
                onClick={() => router.back()}
              >
                <FaArrowLeft className="mr-2" /> Quay lại
              </button>
            </div>

            <h2 className="text-xl font-semibold mb-4">
              {type === "booking" ? "Thông tin đặt khám" : "Danh sách sản phẩm"}
            </h2>

            <div className="space-y-4">
              {cartItems.map((item, idx) => (
                <div key={idx} className="flex items-center space-x-4">
                  {type === "thuoc" && (
                    <Image
                      src={item.image || ""}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded"
                      width={16}
                      height={16}
                    />
                  )}
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <p className="font-bold">{item.name}</p>
                      <p>
                        {type === "thuoc" && (
                          <>
                            <span className="line-through text-gray-500 mr-2">
                              {item.oldPrice?.toLocaleString()}₫
                            </span>
                            <span className="text-red-500 font-bold">
                              {item.price.toLocaleString()}₫
                            </span>
                          </>
                        )}
                        {type === "booking" && (
                          <span className="text-red-500 font-bold">
                            {item.price.toLocaleString()}₫
                          </span>
                        )}
                      </p>
                      <p className="text-gray-600">
                        x{item.quantity} {type === "thuoc" ? "Chai" : "dịch vụ"}
                      </p>
                    </div>
                    {type === "booking" && bookingInfo && bookingInfo.slot && (
                      <p>
                        <span>Bác sĩ: {bookingInfo.doctor.name}</span> <br />
                        <span>Bệnh viện: {bookingInfo.hospital.name}</span> <br />
                        <span>
                          Thời gian: {dayjs(bookingInfo.slot.start_time).format("DD/MM/YYYY HH:mm")}{" "}
                          - {dayjs(bookingInfo.slot.end_time).format("HH:mm")}
                        </span>
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {type === "booking" && bookingInfo?.patient && (
              <div className="mt-6 p-4 border rounded-md bg-gray-50">
                <h3 className="font-semibold mb-2">Thông tin người đặt</h3>
                <p>Họ và tên: {bookingInfo.patient.full_name}</p>
                <p>Số điện thoại: {bookingInfo.patient.phone}</p>
                <p>Email: {bookingInfo.patient.email}</p>
              </div>
            )}
          </div>

          {type === "thuoc" && (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">Chọn hình thức nhận hàng</h2>
              {/* Giữ nguyên UI nhận hàng */}
            </div>
          )}

          {/* Phương thức thanh toán + hóa đơn */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Yêu cầu xuất hóa đơn điện tử</h3>
              <div
                className={`relative inline-block w-12 h-6 rounded-full cursor-pointer transition-colors duration-200 ease-in-out ${hoadon ? "bg-blue-500" : "bg-gray-300"}`}
                onClick={() => setHoadon(!hoadon)}
              >
                <div
                  className={`absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200 ease-in-out ${hoadon ? "translate-x-6" : "translate-x-0"}`}
                ></div>
              </div>
            </div>

            <h3 className="text-lg font-semibold mb-2">Chọn phương thức thanh toán</h3>
            <div className="space-y-4">
              {mockPaymentMethods.map((method) => (
                <div
                  key={method.key}
                  className={`flex items-center space-x-4 p-4 rounded-lg border cursor-pointer ${
                    paymentMethod === method.key ? "border-blue-500 bg-blue-50" : "border-gray-200"
                  }`}
                  onClick={() => setPaymentMethod(method.key)}
                >
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                      paymentMethod === method.key
                        ? "border-blue-500 bg-blue-500"
                        : "border-gray-400"
                    }`}
                  >
                    {paymentMethod === method.key && (
                      <div className="w-2 h-2 rounded-full bg-white"></div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      {method.icon}
                      <p className="font-medium">{method.name}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Tổng tiền */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold">Thành tiền</h3>
                <h3 className="text-xl font-bold text-blue-500">{total.toLocaleString()}₫</h3>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <button
              className="bg-blue-500 text-white text-lg font-bold py-3 px-6 rounded-full w-full"
              onClick={handleCompleteOrder}
            >
              {isPending ? "Đang xử lý..." : "Hoàn tất"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderPage;
