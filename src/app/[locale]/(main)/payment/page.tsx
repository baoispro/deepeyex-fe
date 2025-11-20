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
import { useTranslations } from "next-intl";

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
}

interface City {
  code: number;
  name: string;
  codename: string;
  division_type: string;
  phone_code: number;
  districts: District[];
}

// Payment methods will be defined inside component to use translations

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
  const t = useTranslations("booking");
  const [type, setType] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [hoadon, setHoadon] = useState(false);
  const [bookingInfo, setBookingInfo] = useState<BookingInfo | null>(null);
  const [cartItems, setCartItems] = useState<CartItemWithKey[]>([]);
  const auth = useSelector((state: RootState) => state.auth);
  const patient_id = auth.patient?.patientId;
  const user_id = auth.userId;
  const [shippingMethod, setShippingMethod] = useState("delivery");

  const mockPaymentMethods = [
    {
      key: "cash",
      icon: <FaMoneyBill className="text-blue-500" />,
      name: t("paymentPage.paymentCash"),
    },
    {
      key: "atm",
      icon: <FaRegCreditCard className="text-blue-500" />,
      name: t("paymentPage.paymentATM"),
    },
  ];

  // State cho địa chỉ từ API
  const [cities, setCities] = useState<City[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [selectedCityCode, setSelectedCityCode] = useState<number | null>(null);
  const [selectedDistrictCode, setSelectedDistrictCode] = useState<number | null>(null);
  const [wardText, setWardText] = useState<string>(""); // Nhập tay phường/xã
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
        toast.success(t("paymentPage.success.bookingSuccess"));
        router.push("/booking/success");
      }
    },
    onError: (err) => {
      toast.error(t("paymentPage.failures.bookingFailed") + " " + err.message);
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

      toast.success(t("paymentPage.success.orderSuccess"));

      // Gửi email xác nhận đơn hàng nếu có thông tin pending
      if (pendingEmailData) {
        try {
          // Cập nhật order_code với ID vừa nhận được
          const emailData: SendOrderConfirmationRequest = {
            ...pendingEmailData,
            order_code: newOrderId,
          };
          await SendEmailApi.sendOrderConfirmation(emailData);
          toast.success(t("paymentPage.success.invoiceSent"));
        } catch (error) {
          console.error(error);
          toast.error(t("paymentPage.success.invoiceError"));
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
      toast.error(t("paymentPage.failures.orderFailed") + " " + err.message);
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
        toast.error(t("paymentPage.failures.noPaymentUrl"));
      }
    },
    onError: (err) => {
      toast.error(t("paymentPage.failures.paymentFailed") + " " + err.message);
    },
  });

  const isPending = isBookingPending || isOrderPending || isVnpayPending;

  // Fetch danh sách tỉnh/thành phố từ API
  useEffect(() => {
    fetch("https://provinces.open-api.vn/api/?depth=2")
      .then((res) => res.json())
      .then((data: City[]) => {
        setCities(data);
      })
      .catch((error) => console.error("Error fetching cities:", error));
  }, []);

  // Cập nhật districts khi chọn city
  useEffect(() => {
    if (selectedCityCode) {
      const selectedCity = cities.find((city) => city.code === selectedCityCode);
      if (selectedCity) {
        setDistricts(selectedCity.districts || []);
        setSelectedProvince(selectedCity.name);
        // Reset district và ward khi đổi city
        setSelectedDistrictCode(null);
        setWardText("");
      }
    } else {
      setDistricts([]);
    }
  }, [selectedCityCode, cities]);

  // Reset ward text khi đổi district
  useEffect(() => {
    if (selectedDistrictCode) {
      setWardText("");
    }
  }, [selectedDistrictCode]);

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
      toast.error(t("paymentPage.errors.noPatientInfo"));
      return;
    }

    if (!paymentMethod) {
      toast.error(t("paymentPage.errors.selectPaymentMethod"));
      return;
    }

    if (bookingInfo.service?.name === "Tư vấn trực tuyến với bác sĩ" && paymentMethod != "atm") {
      toast.error(t("paymentPage.errors.onlineOnly"));
      return;
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
        toast.success(t("paymentPage.success.invoiceSent"));
      } else {
        alert(t("paymentPage.success.invoiceError") + ": " + (result.error || "unknown error"));
      }
    } catch (error) {
      console.error(error);
      alert(t("paymentPage.success.invoiceError"));
    }
  };

  // Hàm xử lý đặt hàng thuốc (order)
  const handleCompleteOrderDrug = () => {
    if (!patient_id || !user_id) {
      toast.error(t("paymentPage.errors.loginRequired"));
      return;
    }

    if (!paymentMethod) {
      toast.error(t("paymentPage.errors.selectPaymentMethod"));
      return;
    }

    // Validation cho giao hàng
    if (shippingMethod === "delivery") {
      if (!deliveryInfo.receiverName.trim()) {
        toast.error(t("paymentPage.errors.receiverNameRequired"));
        return;
      }
      if (!deliveryInfo.receiverPhone.trim()) {
        toast.error(t("paymentPage.errors.receiverPhoneRequired"));
        return;
      }
      if (!selectedCityCode) {
        toast.error(t("paymentPage.errors.provinceRequired"));
        return;
      }
      if (!selectedDistrictCode) {
        toast.error(t("paymentPage.errors.districtRequired"));
        return;
      }
      if (!deliveryInfo.address.trim()) {
        toast.error(t("paymentPage.errors.addressRequired"));
        return;
      }
    }

    // Build địa chỉ đầy đủ
    const selectedCity = cities.find((c) => c.code === selectedCityCode);
    const selectedDistrict = districts.find((d) => d.code === selectedDistrictCode);

    // Map cartItems sang order_items backend yêu cầu
    const order_items = cartItems.map((item) => ({
      drug_id: item.drug_id,
      item_name: item.name,
      quantity: item.quantity,
      price: item.sale_price || item.price,
      item_id: item.drug_id ?? undefined,
    }));

    const orderRequest = {
      patient_id: patient_id,
      book_user_id: user_id,
      items: order_items,
      delivery_info: {
        address: deliveryInfo.address,
        phone: deliveryInfo.receiverPhone,
        note: deliveryInfo.note,
        method: shippingMethod === "delivery" ? ("HOME_DELIVERY" as const) : ("PICKUP" as const),
        city: selectedCity?.name,
        district: selectedDistrict?.name,
        ward: wardText || undefined, // Sử dụng wardText thay vì selectedWard
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
      delivery_district: selectedDistrict?.name || "",
      delivery_ward: wardText,
    };

    // Nếu thanh toán bằng ATM, lưu thông tin email vào localStorage để gửi sau khi thanh toán thành công
    if (paymentMethod === "atm") {
      localStorage.setItem("pendingEmailData", JSON.stringify(emailData));
    } else {
      // Lưu dữ liệu email để gửi sau khi order thành công (thanh toán COD)
      setPendingEmailData(emailData);
    }

    // Tạo order - email sẽ được gửi trong onSuccess callback
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
                <FaArrowLeft className="mr-2" /> {t("paymentPage.backButton")}
              </button>
            </div>

            <h2 className="text-xl font-semibold mb-4">
              {type === "booking" ? t("paymentPage.bookingInfo") : t("paymentPage.productList")}
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
                                  {t("paymentPage.originalPrice")} {item.price.toLocaleString()}₫
                                </span>
                                <span className="text-red-500 font-bold">
                                  {t("paymentPage.salePrice")} {item.sale_price.toLocaleString()}₫
                                </span>
                              </>
                            ) : (
                              <span className="text-blue-500 font-bold">
                                {item.price.toLocaleString()}₫
                              </span>
                            )}
                          </>
                        )}
                        {type === "booking" && (
                          <span className="text-red-500 font-bold">
                            {item.price.toLocaleString()}₫
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600">
                        x{item.quantity}{" "}
                        {type === "thuoc" ? t("paymentPage.bottle") : t("paymentPage.service")}
                      </p>
                    </div>
                    {type === "booking" && bookingInfo && bookingInfo.slot && (
                      <p>
                        <span>
                          {t("paymentPage.doctor")} {bookingInfo.doctor.name}
                        </span>{" "}
                        <br />
                        <span>
                          {t("paymentPage.hospital")} {bookingInfo.hospital.name}
                        </span>{" "}
                        <br />
                        <span>
                          {t("paymentPage.time")}{" "}
                          {dayjs(bookingInfo.slot.start_time).format("DD/MM/YYYY HH:mm")} -{" "}
                          {dayjs(bookingInfo.slot.end_time).format("HH:mm")}
                        </span>
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {type === "booking" && bookingInfo?.patient && (
              <div className="mt-6 p-4 border rounded-md bg-gray-50">
                <h3 className="font-semibold mb-2">{t("paymentPage.patientInfo")}</h3>
                <p>
                  {t("paymentPage.fullName")} {bookingInfo.patient.full_name}
                </p>
                <p>
                  {t("paymentPage.phone")} {bookingInfo.patient.phone}
                </p>
                <p>
                  {t("paymentPage.email")} {bookingInfo.patient.email}
                </p>
              </div>
            )}
          </div>

          {type === "thuoc" && (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">{t("paymentPage.shippingMethod")}</h2>
              <div className="flex space-x-2 mb-6">
                <button
                  className={`py-2 px-4 rounded-full font-medium ${
                    shippingMethod === "delivery"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-700"
                  }`}
                  onClick={() => setShippingMethod("delivery")}
                >
                  {t("paymentPage.delivery")}
                </button>
                {/* <button
                  className={`py-2 px-4 rounded-full font-medium ${
                    shippingMethod === "pickup"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-700"
                  }`}
                  onClick={() => setShippingMethod("pickup")}
                >
                  Nhận tại nhà thuốc
                </button> */}
              </div>

              {shippingMethod === "delivery" && (
                <>
                  <h3 className="text-lg font-semibold mb-2">{t("paymentPage.deliveryAddress")}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder={t("paymentPage.receiverName")}
                      value={deliveryInfo.receiverName}
                      onChange={(e) =>
                        setDeliveryInfo({ ...deliveryInfo, receiverName: e.target.value })
                      }
                      className="p-3 border border-gray-600 rounded-md col-span-2"
                    />
                    <input
                      type="text"
                      placeholder={t("paymentPage.receiverPhone")}
                      className="p-3 border border-gray-600 rounded-md"
                      onChange={(e) =>
                        setDeliveryInfo({ ...deliveryInfo, receiverPhone: e.target.value })
                      }
                    />
                    <input
                      type="email"
                      placeholder={t("paymentPage.receiverEmail")}
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
                        {t("paymentPage.selectProvince")}
                      </option>
                      {cities.map((city) => (
                        <option key={city.code} value={city.code}>
                          {city.name}
                        </option>
                      ))}
                    </select>
                    <select
                      value={selectedDistrictCode || ""}
                      onChange={(e) => setSelectedDistrictCode(Number(e.target.value))}
                      disabled={!selectedCityCode}
                      className="p-3 border border-gray-600 rounded-md appearance-none bg-white cursor-pointer disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      <option value="" disabled>
                        {t("paymentPage.selectDistrict")}
                      </option>
                      {districts.map((district) => (
                        <option key={district.code} value={district.code}>
                          {district.name}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      placeholder={t("paymentPage.enterWard")}
                      value={wardText}
                      onChange={(e) => setWardText(e.target.value)}
                      disabled={!selectedDistrictCode}
                      className="p-3 border border-gray-600 rounded-md disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                    <input
                      type="text"
                      placeholder={t("paymentPage.enterAddress")}
                      value={deliveryInfo.address}
                      onChange={(e) =>
                        setDeliveryInfo({ ...deliveryInfo, address: e.target.value })
                      }
                      className="md:col-span-2 p-3 border border-gray-600 rounded-md"
                    />
                  </div>
                  <div className="flex items-center text-gray-500 mt-4 mb-2">
                    <FaRegPaperPlane className="mr-2" />
                    <p className="text-sm">{t("paymentPage.note")}</p>
                  </div>
                  <textarea
                    placeholder={t("paymentPage.notePlaceholder")}
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
                    {t("paymentPage.freeShippingMessage")}{" "}
                    <span className="font-bold">
                      {(SHIPPING_CONFIG.freeShippingThreshold - subtotal).toLocaleString()}₫
                    </span>{" "}
                    {t("paymentPage.freeShippingMessage2")}{" "}
                    <span className="font-bold">{t("paymentPage.freeShipping")}</span>!
                  </p>
                </div>
              )}
            <div className="space-y-2 mb-4 text-base">
              <div className="flex justify-between">
                <p className="font-semibold">{t("paymentPage.total")}</p>
                <p>{subtotal.toLocaleString()}₫</p>
              </div>
              {directDiscount > 0 && (
                <div className="flex justify-between">
                  <p className="font-semibold">{t("paymentPage.directDiscount")}</p>
                  <p className="text-red-500">-{directDiscount.toLocaleString()}₫</p>
                </div>
              )}
              {voucherDiscount > 0 && (
                <div className="flex justify-between">
                  <p className="font-semibold">{t("paymentPage.voucherDiscount")}</p>
                  <p className="text-red-500">-{voucherDiscount.toLocaleString()}₫</p>
                </div>
              )}
              <div className="flex justify-between items-center">
                <div className="flex flex-col">
                  {type === "thuoc" && (
                    <p className="font-semibold">{t("paymentPage.shippingFee")}</p>
                  )}
                  {type === "thuoc" && shippingMethod === "delivery" && (
                    <p className="text-xs text-gray-500">
                      {subtotal >= SHIPPING_CONFIG.freeShippingThreshold ? (
                        t("paymentPage.freeForOrderOver")
                      ) : selectedProvince ? (
                        <>
                          {SHIPPING_CONFIG.innerCity.provinces.includes(selectedProvince)
                            ? t("paymentPage.innerCity")
                            : SHIPPING_CONFIG.nearby.provinces.includes(selectedProvince)
                              ? t("paymentPage.nearbyProvince")
                              : t("paymentPage.farProvince")}
                        </>
                      ) : (
                        t("paymentPage.selectProvinceToSeeFee")
                      )}
                    </p>
                  )}
                </div>
                {shippingFee === 0 && type === "thuoc" ? (
                  <p className="text-green-500 font-semibold">{t("paymentPage.free")}</p>
                ) : (
                  <p className="text-blue-500 font-semibold">+{shippingFee.toLocaleString()}₫</p>
                )}
              </div>
            </div>
            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold">{t("paymentPage.totalAmount")}</h3>
                <h3 className="text-xl font-bold text-blue-500">{total.toLocaleString()}₫</h3>
              </div>
            </div>
          </div>

          {/* Phương thức thanh toán + hóa đơn */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">{t("paymentPage.invoiceRequest")}</h3>
              <div
                className={`relative inline-block w-12 h-6 rounded-full cursor-pointer transition-colors duration-200 ease-in-out ${hoadon ? "bg-blue-500" : "bg-gray-300"}`}
                onClick={() => setHoadon(!hoadon)}
              >
                <div
                  className={`absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200 ease-in-out ${hoadon ? "translate-x-6" : "translate-x-0"}`}
                ></div>
              </div>
            </div>

            <h3 className="text-lg font-semibold mb-2">{t("paymentPage.selectPaymentMethod")}</h3>
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

          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <button
              className="bg-blue-500 text-white text-lg font-bold py-3 px-6 rounded-full w-full"
              onClick={handleCompleteOrder}
            >
              {isPending
                ? t("paymentPage.processing")
                : paymentMethod === "atm"
                  ? t("paymentPage.pay")
                  : type === "booking"
                    ? t("paymentPage.bookAppointment")
                    : t("paymentPage.placeOrder")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderPage;
