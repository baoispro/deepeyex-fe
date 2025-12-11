"use client";

import { useRouter } from "@/app/shares/locales/navigation";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import { FaArrowLeft, FaRegCreditCard, FaMoneyBill, FaRegPaperPlane } from "react-icons/fa";
import dayjs from "dayjs";
import { toast } from "react-toastify";
import { useCreateBookingMutation } from "@/app/modules/booking/hooks/mutations/use-create-booking.mutation";
import { BookingRequest } from "@/app/modules/booking/apis/bookingApi";
import { Patient } from "@/app/modules/hospital/types/patient";
import { useSelector } from "react-redux";
import { RootState } from "@/app/shares/stores";
import { CartItemWithKey } from "../cart/page";
import { useCreateOrderMutation } from "@/app/shares/hooks/mutations/use-order-drug.mutation";
import { useCart } from "@/app/shares/hooks/carts/useCart";
import { SendEmailApi, SendOrderConfirmationRequest } from "@/app/shares/api/sendMail";
import { useCreateVnpayPaymentMutation } from "@/app/shares/hooks/mutations/use-vnpay-payment.mutation";
import { createOrGetConversation } from "@/app/shares/utils/createOrGetConversation";
import { DoctorApi } from "@/app/modules/hospital/apis/doctor/doctorApi";
import { Doctor } from "@/app/modules/hospital/types/doctor";
import { PatientApi } from "@/app/modules/hospital/apis/patient/patientApi";
import {
  InitMedicalRecordAndDiagnosisRequest,
  MedicalRecordApi,
} from "@/app/modules/hospital/apis/medical_record/medicalRecordApi";
import { SubscriptionApi } from "@/app/shares/api/subscriptionApi";
import SubscribeModal from "@/app/modules/home/components/SubscribeModal";

interface BookingService {
  service_id: string;
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

// Interface cho dữ liệu từ API provinces
interface District {
  code: number;
  name: string;
  codename: string;
  division_type: string;
  short_codename?: string;
  wards?: Ward[];
}

interface Ward {
  code: number;
  name: string;
  codename: string;
  division_type: string;
  short_codename?: string;
}

interface City {
  code: number;
  name: string;
  codename: string;
  division_type: string;
  phone_code: number;
  districts?: District[];
  wards?: Ward[]; // API v2 có thể trả về wards trực tiếp
}

const mockPaymentMethods = [
  {
    key: "cash",
    icon: <FaMoneyBill className="text-blue-500" size={30} />,
    name: "Thanh toán tiền mặt khi nhận hàng",
  },
  {
    key: "atm",
    icon: <FaRegCreditCard className="text-blue-500" size={45} />,
    name: "Thanh toán bằng thẻ ATM nội địa và tài khoản ngân hàng",
  },
];

// Cấu hình phí vận chuyển theo địa chỉ
const SHIPPING_CONFIG = {
  innerCity: {
    provinces: ["Thành phố Hà Nội", "Thành phố Hồ Chí Minh"],
    fee: 15000,
  },
  nearby: {
    provinces: [
      "Thành phố Hải Phòng",
      "Thành phố Đà Nẵng",
      "Thành phố Cần Thơ",
      "Tỉnh Bắc Ninh",
      "Tỉnh Hải Dương",
      "Tỉnh Vĩnh Phúc",
      "Tỉnh Thái Nguyên",
      "Tỉnh Quảng Ninh",
      "Tỉnh Bình Dương",
      "Tỉnh Đồng Nai",
      "Tỉnh Long An",
    ],
    fee: 30000,
  },
  faraway: {
    fee: 50000,
  },
  freeShippingThreshold: 500000, // Miễn phí ship cho đơn hàng trên 500k
};

const OrderPage = () => {
  const [type, setType] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [hoadon, setHoadon] = useState(false);
  const [bookingInfo, setBookingInfo] = useState<BookingInfo | null>(null);
  const [cartItems, setCartItems] = useState<CartItemWithKey[]>([]);
  const auth = useSelector((state: RootState) => state.auth);
  const patient_id = auth.patient?.patientId;
  const user_id = auth.userId;
  const [shippingMethod, setShippingMethod] = useState("delivery");
  const [subscribeModalOpen, setSubscribeModalOpen] = useState(false);

  // State cho địa chỉ từ API
  const [cities, setCities] = useState<City[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [selectedCityCode, setSelectedCityCode] = useState<number | null>(null);
  const [selectedWardCode, setSelectedWardCode] = useState<number | null>(null);
  const [wardText, setWardText] = useState<string>(""); // Nhập tay phường/xã (fallback)
  const [selectedProvince, setSelectedProvince] = useState<string>("");
  // State cho thông tin giao hàng (thuốc)
  const [deliveryInfo, setDeliveryInfo] = useState({
    receiverName: "",
    receiverPhone: "",
    receiverEmail: "",
    address: "",
    note: "",
  });

  // State lưu thông tin để gửi email sau khi order thành công
  const [pendingEmailData, setPendingEmailData] = useState<SendOrderConfirmationRequest | null>(
    null,
  );

  const router = useRouter();

  const { clearCart } = useCart();
  const { mutate: createBooking, isPending: isBookingPending } = useCreateBookingMutation({
    onSuccess: async (data) => {
      // Nếu thanh toán bằng ATM, chuyển đến VNPay
      if (!data?.data?.appointment) return;
      const payload: InitMedicalRecordAndDiagnosisRequest = {
        patient_id: patient_id || "",
        ai_diagnosis_id: localStorage.getItem("ai_diagnosis_id") || "",
        doctor_id: bookingInfo?.doctor.id ?? undefined,
        appointment_id: data.data.appointment.appointment_id ?? undefined,
      };
      const aiDiagnosisId = localStorage.getItem("ai_diagnosis_id");
      console.log("Payload khởi tạo medical record:", payload);

      if (aiDiagnosisId) {
        console.log("Khởi tạo medical record với ai_diagnosis_id:", aiDiagnosisId);
        await MedicalRecordApi.initRecordAndDiagnosis(payload);
        localStorage.removeItem("ai_diagnosis_id");
      }
      localStorage.removeItem("bookingPatient");
      localStorage.removeItem("bookingSlot");
      localStorage.removeItem("doctor_id");
      localStorage.removeItem("doctor_name");
      localStorage.removeItem("hospital_id");
      localStorage.removeItem("hospital_name");
      if (!data?.data?.appointment) return;
      const doctorResponse = await DoctorApi.getById(data.data.appointment.doctor_id);
      const patientResponse = await PatientApi.getByID(data?.data.appointment.patient_id);
      localStorage.setItem("doctor", JSON.stringify(doctorResponse));
      localStorage.setItem("patient", JSON.stringify(patientResponse));
      localStorage.setItem("appointment", data.data.appointment.appointment_id);
      if (paymentMethod === "atm") {
        const orderId = data.data.order?.order_id || Date.now().toString();
        handleVnpayPayment(orderId);
      } else {
        await createOrGetConversation(
          doctorResponse.data || ({} as Doctor),
          patientResponse.data || ({} as Patient),
          data.data.appointment.appointment_id || null,
        );
        toast.success("Đặt lịch khám thành công!");
        router.push("/booking/success");
      }
    },
    onError: (err) => {
      toast.error("Đặt lịch thất bại: " + err.message);
    },
  });

  const { mutate: createOrder, isPending: isOrderPending } = useCreateOrderMutation({
    onSuccess: async (res) => {
      const newOrderId = res.data?.order_id || "";
      localStorage.setItem("orderId", newOrderId);

      // Nếu thanh toán bằng ATM, chuyển đến VNPay
      if (paymentMethod === "atm") {
        handleVnpayPayment(newOrderId);
        return;
      }

      toast.success("Đặt hàng thành công!");

      // Gửi email xác nhận đơn hàng nếu có thông tin pending
      if (pendingEmailData) {
        try {
          // Cập nhật order_code với ID vừa nhận được
          const emailData: SendOrderConfirmationRequest = {
            ...pendingEmailData,
            order_code: newOrderId,
          };
          await SendEmailApi.sendOrderConfirmation(emailData);
          toast.success("Hóa đơn đã được gửi tới email của bạn!");
        } catch (error) {
          console.error(error);
          toast.error("Có lỗi xảy ra khi gửi hóa đơn.");
        } finally {
          // Reset pending email data
          setPendingEmailData(null);
        }
      }

      // Clear cart sau khi đặt hàng thành công
      clearCart();
      router.push("/booking/success");
    },
    onError: (err) => {
      toast.error("Đặt hàng thất bại: " + err.message);
      // Reset pending email data khi có lỗi
      setPendingEmailData(null);
    },
  });

  const { mutate: createVnpayPayment, isPending: isVnpayPending } = useCreateVnpayPaymentMutation({
    onSuccess: (data) => {
      const paymentUrl = data.data?.paymentUrl;
      if (paymentUrl) {
        // Redirect đến trang thanh toán VNPay
        window.location.href = paymentUrl;
      } else {
        toast.error("Không thể tạo link thanh toán.");
      }
    },
    onError: (err) => {
      toast.error("Tạo thanh toán thất bại: " + err.message);
    },
  });

  const isPending = isBookingPending || isOrderPending || isVnpayPending;

  // Fetch danh sách tỉnh/thành phố từ API
  useEffect(() => {
    fetch("https://provinces.open-api.vn/api/v2/?depth=2")
      .then((res) => res.json())
      .then((data: City[]) => {
        setCities(data);
      })
      .catch((error) => console.error("Error fetching cities:", error));
  }, []);

  // Cập nhật wards khi chọn city
  useEffect(() => {
    if (selectedCityCode) {
      const selectedCity = cities.find((city) => city.code === selectedCityCode);
      if (selectedCity) {
        setSelectedProvince(selectedCity.name);

        // Nếu city đã có wards từ API depth=2
        if (selectedCity.wards && selectedCity.wards.length > 0) {
          setWards(selectedCity.wards);
        } else {
          // Nếu chưa có, fetch wards trực tiếp từ city
          fetch(`https://provinces.open-api.vn/api/v2/p/${selectedCityCode}?depth=2`)
            .then((res) => res.json())
            .then((cityData: City | { wards?: Ward[] } | Ward[]) => {
              if (Array.isArray(cityData)) {
                // Nếu trả về array wards trực tiếp
                setWards(cityData);
              } else if ("wards" in cityData && cityData.wards) {
                // Nếu trả về object có wards
                setWards(cityData.wards);
              } else if ("wards" in cityData && Array.isArray((cityData as City).wards)) {
                // Nếu là City object có wards
                setWards((cityData as City).wards || []);
              } else {
                setWards([]);
              }
            })
            .catch((error) => {
              console.error("Error fetching wards:", error);
              setWards([]);
            });
        }

        // Reset ward khi đổi city
        setWardText("");
        setSelectedWardCode(null);
      }
    } else {
      setWards([]);
      setSelectedWardCode(null);
    }
  }, [selectedCityCode, cities]);

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

      setCartItems(itemList as CartItemWithKey[]);

      setBookingInfo({
        patient: patient ? JSON.parse(patient) : null,
        service: service ? JSON.parse(service) : null,
        slot: slot ? JSON.parse(slot) : null,
        doctor: { name: doctorName, id: doctorId },
        hospital: { name: hospitalName, id: hospitalId },
      });
    } else {
      // nếu là thuốc, có thể load cart từ mockCartItems hoặc API
      const cartItems = localStorage.getItem("cartItems");
      setCartItems(cartItems ? JSON.parse(cartItems) : []);
    }
  }, []);

  // Hàm tính phí vận chuyển
  const calculateShippingFee = (): number => {
    if (type !== "thuoc" || shippingMethod !== "delivery") {
      return 0; // Không phải thuốc hoặc nhận tại cửa hàng
    }

    // Miễn phí ship cho đơn hàng trên ngưỡng
    if (subtotal >= SHIPPING_CONFIG.freeShippingThreshold) {
      return 0;
    }

    // Tính phí theo tỉnh/thành phố
    if (!selectedProvince) {
      return 0; // Chưa chọn tỉnh
    }

    if (SHIPPING_CONFIG.innerCity.provinces.includes(selectedProvince)) {
      return SHIPPING_CONFIG.innerCity.fee;
    }

    if (SHIPPING_CONFIG.nearby.provinces.includes(selectedProvince)) {
      return SHIPPING_CONFIG.nearby.fee;
    }

    return SHIPPING_CONFIG.faraway.fee; // Tỉnh xa
  };

  // Tính tổng tiền
  const subtotal = cartItems.reduce((sum, item) => {
    const itemPrice = item.sale_price || item.price;
    return sum + itemPrice * item.quantity;
  }, 0);

  // Tính giảm giá trực tiếp từ sale_price (chỉ cho thuốc)
  const directDiscount =
    type === "thuoc"
      ? cartItems.reduce((sum, item) => {
          if (item.sale_price && item.price > item.sale_price) {
            return sum + (item.price - item.sale_price) * item.quantity;
          }
          return sum;
        }, 0)
      : 0;

  const voucherDiscount = 0; // Giảm giá voucher (nếu có)
  const shippingFee = calculateShippingFee();
  const total = subtotal - voucherDiscount + shippingFee;

  // Hàm xử lý thanh toán VNPay
  const handleVnpayPayment = (orderId: string) => {
    createVnpayPayment({
      amount: total,
      orderId: orderId,
    });
  };

  // Hàm xử lý đặt lịch khám (booking)
  const handleCompleteBooking = async () => {
    if (!bookingInfo?.patient) {
      toast.error("Không tìm thấy thông tin bệnh nhân.");
      return;
    }

    if (!paymentMethod) {
      toast.error("Vui lòng chọn phương thức thanh toán.");
      return;
    }

    // Kiểm tra limit tư vấn nếu là dịch vụ tư vấn trực tuyến
    if (bookingInfo.service?.name === "Tư vấn trực tuyến với bác sĩ") {
      if (!user_id) {
        toast.error("Vui lòng đăng nhập để đặt lịch tư vấn");
        return;
      }

      try {
        const limitCheck = await SubscriptionApi.checkConsultLimit(user_id);
        const data = limitCheck.data;

        // Kiểm tra nếu chưa đăng ký gói nào (limit = 0 hoặc không có plan_name)
        if (!data?.plan_name && (data?.limit === 0 || data?.limit === undefined)) {
          toast.error("Bạn cần đăng ký gói để sử dụng dịch vụ tư vấn trực tuyến");
          setSubscribeModalOpen(true);
          return;
        }

        // Kiểm tra nếu không thể sử dụng (hết limit hoặc chưa đăng ký)
        if (!data?.can_use) {
          if (data?.remaining === 0) {
            toast.error(
              "Bạn đã hết lượt tư vấn. Vui lòng đăng ký gói để tiếp tục sử dụng dịch vụ.",
            );
          } else {
            toast.error("Bạn cần đăng ký gói để sử dụng dịch vụ tư vấn trực tuyến");
          }
          setSubscribeModalOpen(true);
          return;
        }
      } catch (error: unknown) {
        // Nếu API trả về 403 hoặc 404, có nghĩa là chưa đăng ký gói hoặc hết limit
        const err = error as { response?: { status?: number } };
        if (err?.response?.status === 403 || err?.response?.status === 404) {
          toast.error("Bạn cần đăng ký gói để sử dụng dịch vụ tư vấn trực tuyến");
          setSubscribeModalOpen(true);
          return;
        }
        console.error("Error checking consult limit:", error);
      }

      if (paymentMethod != "atm") {
        toast.error("Dịch vụ này chỉ hỗ trợ thanh toán online.");
        return;
      }
    }

    // Map cartItems sang order_items backend yêu cầu
    const order_items = cartItems.map((item) => ({
      drug_id: item.key.startsWith("drug_") ? item.key : undefined,
      service_id: bookingInfo.service?.service_id || undefined,
      item_name: item.key.startsWith("drug_") ? item.name : bookingInfo.service?.name || "",
      quantity: item.quantity,
      price: item.sale_price || item.price,
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
      service_name: bookingInfo.service?.name || "",
    };

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

  // Hàm xử lý đặt hàng thuốc (order)
  const handleCompleteOrderDrug = () => {
    // if (!patient_id || !user_id) {
    //   toast.error("Vui lòng đăng nhập để đặt hàng.");
    //   return;
    // }

    if (!paymentMethod) {
      toast.error("Vui lòng chọn phương thức thanh toán.");
      return;
    }

    // Validation cho giao hàng
    if (shippingMethod === "delivery") {
      if (!deliveryInfo.receiverName.trim()) {
        toast.error("Vui lòng nhập họ tên người nhận.");
        return;
      }
      if (!deliveryInfo.receiverPhone.trim()) {
        toast.error("Vui lòng nhập số điện thoại người nhận.");
        return;
      }
      if (!selectedCityCode) {
        toast.error("Vui lòng chọn Tỉnh/Thành phố.");
        return;
      }
      if (!deliveryInfo.address.trim()) {
        toast.error("Vui lòng nhập địa chỉ cụ thể.");
        return;
      }
    }

    // Build địa chỉ đầy đủ
    const selectedCity = cities.find((c) => c.code === selectedCityCode);
    const selectedWard = wards.find((w) => w.code === selectedWardCode);

    // Map cartItems sang order_items backend yêu cầu
    const order_items = cartItems.map((item) => ({
      drug_id: item.drug_id,
      item_name: item.name,
      quantity: item.quantity,
      price: item.sale_price || item.price,
      item_id: item.drug_id ?? undefined,
    }));

    const orderRequest = {
      patient_id: patient_id || "0",
      book_user_id: user_id || "0",
      items: order_items,
      delivery_info: {
        address: deliveryInfo.address,
        phone: deliveryInfo.receiverPhone,
        note: deliveryInfo.note,
        method: shippingMethod === "delivery" ? ("HOME_DELIVERY" as const) : ("PICKUP" as const),
        city: selectedCity?.name,
        ward: selectedWard?.name || wardText || undefined, // Ưu tiên selectedWard, fallback về wardText
        fee: shippingFee,
        fullName: deliveryInfo.receiverName,
        email: deliveryInfo.receiverEmail,
      },
    };

    // Chuẩn bị dữ liệu email để gửi sau khi order thành công
    const emailData: SendOrderConfirmationRequest = {
      to_email: deliveryInfo.receiverEmail,
      patient_name: deliveryInfo.receiverName,
      order_code: "", // Sẽ được cập nhật trong onSuccess callback
      order_items: cartItems,
      delivery_method:
        shippingMethod === "delivery" ? ("HOME_DELIVERY" as const) : ("PICKUP" as const),
      delivery_address: deliveryInfo.address,
      delivery_phone: deliveryInfo.receiverPhone,
      delivery_fullname: deliveryInfo.receiverName,
      delivery_email: deliveryInfo.receiverEmail,
      delivery_note: deliveryInfo.note,
      delivery_fee: shippingFee,
      delivery_city: selectedCity?.name || "",
      delivery_ward: selectedWard?.name || wardText || "",
    };

    // Lưu phí vận chuyển vào localStorage để hiển thị ở trang success
    localStorage.setItem("shippingFee", shippingFee.toString());

    // Nếu thanh toán bằng ATM, lưu thông tin email vào localStorage để gửi sau khi thanh toán thành công
    // Nếu thanh toán bằng cash, lưu vào state để gửi ngay trong onSuccess
    if (paymentMethod === "atm") {
      localStorage.setItem("pendingEmailData", JSON.stringify(emailData));
      // Xóa state để tránh gửi email 2 lần
      setPendingEmailData(null);
    } else {
      // Lưu dữ liệu email vào state để gửi sau khi order thành công (thanh toán COD)
      setPendingEmailData(emailData);
      // Xóa localStorage để tránh gửi email 2 lần
      localStorage.removeItem("pendingEmailData");
    }

    // Tạo order - email sẽ được gửi trong onSuccess callback (cash) hoặc ở success page (ATM)
    createOrder(orderRequest);
  };

  // Hàm chung để xử lý hoàn tất
  const handleCompleteOrder = () => {
    if (type === "booking") {
      handleCompleteBooking();
    } else if (type === "thuoc") {
      handleCompleteOrderDrug();
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
                      className="w-16 h-16 object-contain rounded"
                      width={64}
                      height={64}
                    />
                  )}
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <p className="font-bold">{item.name}</p>
                      <div className="flex flex-col items-end">
                        {type === "thuoc" && (
                          <>
                            {item.sale_price ? (
                              <>
                                <span className="line-through text-gray-500 text-sm">
                                  Giá gốc: {item.price.toLocaleString()}đ
                                </span>
                                <span className="text-red-500 font-bold">
                                  Giá sale: {item.sale_price.toLocaleString()}đ
                                </span>
                              </>
                            ) : (
                              <span className="text-blue-500 font-bold">
                                {item.price.toLocaleString()}đ
                              </span>
                            )}
                          </>
                        )}
                        {type === "booking" && (
                          <span className="text-red-500 font-bold">
                            {item.price.toLocaleString()}đ
                          </span>
                        )}
                      </div>
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
              <div className="flex space-x-2 mb-6">
                <button
                  className={`py-2 px-4 rounded-full font-medium ${
                    shippingMethod === "delivery"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-700"
                  }`}
                  onClick={() => setShippingMethod("delivery")}
                >
                  Giao hàng tận nơi
                </button>
              </div>

              {shippingMethod === "delivery" && (
                <>
                  <h3 className="text-lg font-semibold mb-2">Địa chỉ nhận hàng</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Họ và tên người nhận"
                      value={deliveryInfo.receiverName}
                      onChange={(e) =>
                        setDeliveryInfo({ ...deliveryInfo, receiverName: e.target.value })
                      }
                      className="p-3 border border-gray-600 rounded-md col-span-2"
                    />
                    <input
                      type="text"
                      placeholder="Số điện thoại"
                      className="p-3 border border-gray-600 rounded-md"
                      onChange={(e) =>
                        setDeliveryInfo({ ...deliveryInfo, receiverPhone: e.target.value })
                      }
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      value={deliveryInfo.receiverEmail}
                      onChange={(e) =>
                        setDeliveryInfo({ ...deliveryInfo, receiverEmail: e.target.value })
                      }
                      className="p-3 border border-gray-600 rounded-md"
                    />
                    <select
                      value={selectedCityCode || ""}
                      onChange={(e) => setSelectedCityCode(Number(e.target.value))}
                      className="p-3 border border-gray-600 rounded-md appearance-none bg-white cursor-pointer"
                    >
                      <option value="" disabled>
                        Chọn Tỉnh/Thành phố
                      </option>
                      {cities.map((city) => (
                        <option key={city.code} value={city.code}>
                          {city.name}
                        </option>
                      ))}
                    </select>
                    {wards.length > 0 ? (
                      <select
                        value={selectedWardCode || ""}
                        onChange={(e) => {
                          const wardCode = Number(e.target.value);
                          setSelectedWardCode(wardCode);
                          const selectedWard = wards.find((w) => w.code === wardCode);
                          setWardText(selectedWard?.name || "");
                        }}
                        disabled={!selectedCityCode}
                        className="p-3 border border-gray-600 rounded-md appearance-none bg-white cursor-pointer disabled:bg-gray-100 disabled:cursor-not-allowed"
                      >
                        <option value="" disabled>
                          Chọn Phường/Xã
                        </option>
                        {wards.map((ward) => (
                          <option key={ward.code} value={ward.code}>
                            {ward.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        placeholder="Nhập Phường/Xã"
                        value={wardText}
                        onChange={(e) => setWardText(e.target.value)}
                        disabled={!selectedCityCode}
                        className="p-3 border border-gray-600 rounded-md disabled:bg-gray-100 disabled:cursor-not-allowed"
                      />
                    )}
                    <input
                      type="text"
                      placeholder="Nhập địa chỉ cụ thể (số nhà, tên đường)"
                      value={deliveryInfo.address}
                      onChange={(e) =>
                        setDeliveryInfo({ ...deliveryInfo, address: e.target.value })
                      }
                      className="md:col-span-2 p-3 border border-gray-600 rounded-md"
                    />
                  </div>
                  <div className="flex items-center text-gray-500 mt-4 mb-2">
                    <FaRegPaperPlane className="mr-2" />
                    <p className="text-sm">Ghi chú (không bắt buộc)</p>
                  </div>
                  <textarea
                    placeholder="Ví dụ: Hãy gọi cho tôi 15 phút trước khi giao"
                    rows={2}
                    value={deliveryInfo.note}
                    onChange={(e) => setDeliveryInfo({ ...deliveryInfo, note: e.target.value })}
                    className="w-full p-3 border border-gray-600 rounded-md"
                  ></textarea>
                </>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Tổng tiền */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            {/* Thông báo miễn phí ship */}
            {type === "thuoc" &&
              shippingMethod === "delivery" &&
              subtotal < SHIPPING_CONFIG.freeShippingThreshold &&
              subtotal > 0 && (
                <div className="bg-green-50 border border-green-200 text-green-800 p-3 rounded-md mb-4 flex items-center text-sm">
                  <FaRegCreditCard className="mr-2 flex-shrink-0" />
                  <p>
                    Mua thêm{" "}
                    <span className="font-bold">
                      {(SHIPPING_CONFIG.freeShippingThreshold - subtotal).toLocaleString()}đ
                    </span>{" "}
                    để được <span className="font-bold">MIỄN PHÍ VẬN CHUYỂN</span>!
                  </p>
                </div>
              )}
            <div className="space-y-2 mb-4 text-base">
              <div className="flex justify-between">
                <p className="font-semibold">Tổng tiền</p>
                <p>{subtotal.toLocaleString()}đ</p>
              </div>
              {directDiscount > 0 && (
                <div className="flex justify-between">
                  <p className="font-semibold">Giảm giá trực tiếp</p>
                  <p className="text-red-500">-{directDiscount.toLocaleString()}₫</p>
                </div>
              )}
              {voucherDiscount > 0 && (
                <div className="flex justify-between">
                  <p className="font-semibold">Giảm giá voucher</p>
                  <p className="text-red-500">-{voucherDiscount.toLocaleString()}₫</p>
                </div>
              )}
              <div className="flex justify-between items-center">
                <div className="flex flex-col">
                  {type === "thuoc" && <p className="font-semibold">Phí vận chuyển</p>}
                  {type === "thuoc" && shippingMethod === "delivery" && (
                    <p className="text-xs text-gray-500">
                      {subtotal >= SHIPPING_CONFIG.freeShippingThreshold ? (
                        "Miễn phí cho đơn trên 500k"
                      ) : selectedProvince ? (
                        <>
                          {SHIPPING_CONFIG.innerCity.provinces.includes(selectedProvince)
                            ? "Nội thành"
                            : SHIPPING_CONFIG.nearby.provinces.includes(selectedProvince)
                              ? "Tỉnh lân cận"
                              : "Tỉnh xa"}
                        </>
                      ) : (
                        "Chọn tỉnh để xem phí"
                      )}
                    </p>
                  )}
                </div>
                {type === "thuoc" && shippingMethod === "delivery" ? (
                  selectedProvince ? (
                    shippingFee === 0 ? (
                      <p className="text-green-500 font-semibold">Miễn phí</p>
                    ) : (
                      <p className="text-blue-500 font-semibold">
                        +{shippingFee.toLocaleString()}đ
                      </p>
                    )
                  ) : (
                    <p className="text-gray-400">—</p> // Khi chưa chọn tỉnh
                  )
                ) : (
                  <p className="text-gray-400">—</p>
                )}
              </div>
            </div>
            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold">Thành tiền</h3>
                <h3 className="text-xl font-bold text-blue-500">{total.toLocaleString()}đ</h3>
              </div>
            </div>
          </div>

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
                    className={`w-5 h-5 rounded-full border shrink-0 flex items-center justify-center ${
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

          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <button
              className="bg-blue-500 text-white text-lg font-bold py-3 px-6 rounded-full w-full"
              onClick={handleCompleteOrder}
            >
              {isPending
                ? "Đang xử lý..."
                : paymentMethod === "atm"
                  ? "Thanh toán"
                  : type === "booking"
                    ? "Đặt lịch khám"
                    : "Đặt hàng"}
            </button>
          </div>
        </div>
      </div>

      <SubscribeModal
        open={subscribeModalOpen}
        onClose={() => setSubscribeModalOpen(false)}
        planName="VIP"
        onSuccess={() => {
          // Refresh lại sau khi đăng ký thành công
          window.location.reload();
        }}
      />
    </div>
  );
};

export default OrderPage;
