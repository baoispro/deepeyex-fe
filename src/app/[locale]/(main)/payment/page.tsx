"use client";

import Image from "next/image";
import React, { useState } from "react";
import {
  FaArrowLeft,
  FaMapMarkerAlt,
  FaRegCreditCard,
  FaMoneyBill,
  FaMobileAlt,
  FaBarcode,
  FaRegPaperPlane,
} from "react-icons/fa";

// Dữ liệu giả định
const mockCartItems = [
  {
    key: "1",
    name: "Sữa Nutrifood Varna Colostrum 237ml hỗ trợ tăng cường sức đề kháng (24 Chai)",
    image: "/milk-product.png", // Thay bằng đường dẫn ảnh thật
    price: 35000,
    oldPrice: 38500,
    quantity: 1,
  },
];

const mockPaymentMethods = [
  {
    key: "cash",
    icon: <FaMoneyBill className="text-blue-500" />,
    name: "Thanh toán tiền mặt khi nhận hàng",
  },
  {
    key: "bankTransfer",
    icon: <FaBarcode className="text-blue-500" />,
    name: "Thanh toán bằng chuyển khoản (QR Code)",
  },
  {
    key: "atm",
    icon: <FaRegCreditCard className="text-blue-500" />,
    name: "Thanh toán bằng thẻ ATM nội địa và tài khoản ngân hàng",
  },
  {
    key: "creditCard",
    icon: <FaRegCreditCard className="text-blue-500" />,
    name: "Thanh toán bằng thẻ quốc tế Visa, Master, JCB, AMEX (GooglePay, ApplePay)",
  },
  {
    key: "zalopay",
    icon: <FaMobileAlt className="text-blue-500" />,
    name: "Thanh toán bằng ví ZaloPay",
  },
  {
    key: "momo",
    icon: <FaMobileAlt className="text-blue-500" />,
    name: "Thanh toán bằng ví MoMo",
  },
  {
    key: "vnpay",
    icon: <FaMobileAlt className="text-blue-500" />,
    name: "Thanh toán bằng VNPay",
  },
];

const OrderPage = () => {
  const [shippingMethod, setShippingMethod] = useState("delivery");
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [hoadon, setHoadon] = useState(false);

  const subtotal = mockCartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = mockCartItems.reduce(
    (sum, item) => sum + (item.oldPrice - item.price) * item.quantity,
    0,
  );
  const voucherDiscount = 3500;
  const shippingFee = 0; // Miễn phí vận chuyển

  const total = subtotal - voucherDiscount - shippingFee;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Order Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
              <button className="flex items-center text-gray-600 hover:text-blue-500">
                <FaArrowLeft className="mr-2" />
                Quay lại giỏ hàng
              </button>
              <p className="text-sm text-gray-500">
                Miễn phí vận chuyển đối với đơn hàng trên 300.000đ
              </p>
            </div>

            <h2 className="text-xl font-semibold mb-4">Danh sách sản phẩm</h2>
            <div className="space-y-4">
              {mockCartItems.map((item) => (
                <div key={item.key} className="flex items-center space-x-4">
                  <Image
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded"
                    width={16}
                    height={16}
                  />
                  <div className="flex-1">
                    <p className="font-bold">{item.name}</p>
                    <p>
                      <span className="line-through text-gray-500 mr-2">
                        {item.oldPrice.toLocaleString()}₫
                      </span>
                      <span className="text-red-500 font-bold">{item.price.toLocaleString()}₫</span>
                    </p>
                  </div>
                  <p className="text-gray-600">x{item.quantity} Chai</p>
                </div>
              ))}
            </div>
          </div>

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
              <button
                className={`py-2 px-4 rounded-full font-medium ${
                  shippingMethod === "pickup"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
                onClick={() => setShippingMethod("pickup")}
              >
                Nhận tại nhà thuốc
              </button>
            </div>

            <h3 className="text-lg font-semibold mb-2">Thông tin người đặt</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <input
                type="text"
                placeholder="Họ và tên người đặt"
                className="p-3 border rounded-md"
              />
              <input type="text" placeholder="Số điện thoại" className="p-3 border rounded-md" />
              <input
                type="email"
                placeholder="Email (không bắt buộc)"
                className="md:col-span-2 p-3 border rounded-md"
              />
            </div>

            {shippingMethod === "delivery" && (
              <>
                <h3 className="text-lg font-semibold mb-2">Địa chỉ nhận hàng</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Họ và tên người nhận"
                    className="p-3 border rounded-md"
                  />
                  <input
                    type="text"
                    placeholder="Số điện thoại"
                    className="p-3 border rounded-md"
                  />
                  <select className="p-3 border rounded-md appearance-none">
                    <option disabled selected hidden>
                      Chọn Tỉnh/Thành phố
                    </option>
                  </select>
                  <select className="p-3 border rounded-md appearance-none">
                    <option disabled selected hidden>
                      Chọn Quận/Huyện
                    </option>
                  </select>
                  <select className="p-3 border rounded-md appearance-none">
                    <option disabled selected hidden>
                      Chọn Phường/Xã
                    </option>
                  </select>
                  <input
                    type="text"
                    placeholder="Nhập địa chỉ cụ thể"
                    className="md:col-span-2 p-3 border rounded-md"
                  />
                </div>
                <div className="flex items-center text-gray-500 mt-4 mb-2">
                  <FaRegPaperPlane className="mr-2" />
                  <p className="text-sm">Ghi chú (không bắt buộc)</p>
                </div>
                <textarea
                  placeholder="Ví dụ: Hãy gọi cho tôi 15 phút trước khi giao"
                  rows={2}
                  className="w-full p-3 border rounded-md"
                ></textarea>
              </>
            )}
          </div>

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
                    className={`w-5 h-5 rounded-full border flex items-center justify-center ${paymentMethod === method.key ? "border-blue-500 bg-blue-500" : "border-gray-400"}`}
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

        {/* Right Column: Order Summary */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="bg-blue-100 text-blue-800 p-3 rounded-md mb-4 flex items-center">
              <FaRegCreditCard className="mr-2" /> Áp dụng ưu đãi để được giảm giá
            </div>
            <div className="space-y-2 mb-4 text-sm">
              <div className="flex justify-between">
                <p>Tổng tiền</p>
                <p>{subtotal.toLocaleString()}₫</p>
              </div>
              <div className="flex justify-between">
                <p>Giảm giá trực tiếp</p>
                <p className="text-red-500">-{discount.toLocaleString()}₫</p>
              </div>
              <div className="flex justify-between">
                <p>Giảm giá voucher</p>
                <p className="text-red-500">-{voucherDiscount.toLocaleString()}₫</p>
              </div>
              <div className="flex justify-between">
                <p>Phí vận chuyển</p>
                <p className="text-green-500">Miễn phí</p>
              </div>
            </div>
            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold">Thành tiền</h3>
                <h3 className="text-xl font-bold text-blue-500">{total.toLocaleString()}₫</h3>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <p className="text-xs text-gray-500 mb-4">
              Bằng việc xác nhận đặt hàng, bạn đồng ý với{" "}
              <a href="#" className="text-blue-500">
                Điều khoản và điều kiện
              </a>{" "}
              mua hàng của Nhà thuốc FPT Long Châu
            </p>
            <button className="bg-blue-500 text-white text-lg font-bold py-3 px-6 rounded-full w-full">
              Hoàn tất
            </button>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <h3 className="text-lg font-bold mb-2">
              Tải ứng dụng miễn phí vận chuyển với mọi đơn hàng
            </h3>
            <Image
              src="/qr-code.png"
              alt="QR Code"
              className="mx-auto my-4 w-32 h-32"
              width={32}
              height={32}
            />
            <a href="#" className="text-blue-500 font-medium">
              Tải ngay
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderPage;
