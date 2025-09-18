"use client";

import React, { useState } from "react";
import {
  Button,
  Card,
  Checkbox,
  Col,
  Divider,
  Image,
  InputNumber,
  Row,
  Space,
  Table,
  Typography,
} from "antd";
import { DeleteOutlined, RightOutlined } from "@ant-design/icons";
import { useCart } from "@/app/shares/hooks/carts/useCart";
const { Title, Text } = Typography;

interface CartItemWithKey {
  key: string;
  name: string;
  image: string;
  price: number;
  sale_price?: number;
  quantity: number;
  variant_unit: string;
  selected: boolean;
  product_id: number;
}

export default function CartInfo() {
  const { cartItems: cartFromHook, removeFromCart, updateQuantity } = useCart();

  // map hook cart items sang state với key + selected
  const [cartItems, setCartItems] = useState<CartItemWithKey[]>(
    cartFromHook.map((item) => ({
      ...item,
      key: `${item.product_id}-${item.variant_unit}`,
      selected: true,
    })),
  );

  const [selectAll, setSelectAll] = useState(true);

  // đồng bộ cartItems khi hook thay đổi
  React.useEffect(() => {
    setCartItems(
      cartFromHook.map((item) => ({
        ...item,
        key: `${item.product_id}-${item.variant_unit}`,
        selected: true,
      })),
    );
  }, [cartFromHook]);

  const handleQuantityChange = (value: number | null, record: CartItemWithKey) => {
    if (!value) return;
    updateQuantity(record.product_id, record.variant_unit, value);
    setCartItems((prev) =>
      prev.map((item) => (item.key === record.key ? { ...item, quantity: value } : item)),
    );
  };

  const handleRemove = (record: CartItemWithKey) => {
    removeFromCart(record.product_id, record.variant_unit);
    setCartItems((prev) => prev.filter((item) => item.key !== record.key));
  };

  const handleSelectItem = (checked: boolean, record: CartItemWithKey) => {
    setCartItems((prev) =>
      prev.map((item) => (item.key === record.key ? { ...item, selected: checked } : item)),
    );
    setSelectAll(cartItems.every((item) => (item.key === record.key ? checked : item.selected)));
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    setCartItems((prev) => prev.map((item) => ({ ...item, selected: checked })));
  };

  const selectedItems = cartItems.filter((item) => item.selected);
  const totalOriginal = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalFinal = selectedItems.reduce(
    (sum, item) =>
      sum +
      (item.sale_price && item.sale_price < item.price ? item.sale_price : item.price) *
        item.quantity,
    0,
  );
  const discount = totalOriginal - totalFinal;

  const columns = [
    {
      title: <Checkbox checked={selectAll} onChange={(e) => handleSelectAll(e.target.checked)} />,
      dataIndex: "selected",
      render: (_: boolean, record: CartItemWithKey) => (
        <Checkbox
          checked={record.selected}
          onChange={(e) => handleSelectItem(e.target.checked, record)}
          style={{
            color: record.selected ? "#03c0b4" : undefined,
          }}
        />
      ),
      width: 50,
    },
    {
      title: "Sản phẩm",
      dataIndex: "name",
      render: (_: string, record: CartItemWithKey) => (
        <Space align="start">
          <Image src={record.image} width={50} height={50} preview={false} />
          <Text strong>{record.name}</Text>
        </Space>
      ),
    },
    {
      title: "Đơn giá",
      dataIndex: "price",
      align: "center" as const,
      render: (_: number, record: CartItemWithKey) => (
        <div>
          {record.sale_price && record.sale_price < record.price ? (
            <div>
              <Text type="danger">
                {(record.sale_price * record.quantity).toLocaleString("vi-VN")}đ
              </Text>
              <br />
              <Text delete type="secondary">
                {(record.price * record.quantity).toLocaleString("vi-VN")}đ
              </Text>
            </div>
          ) : (
            <Text strong>{(record.price * record.quantity).toLocaleString("vi-VN")}đ</Text>
          )}
        </div>
      ),
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      align: "center" as const,
      render: (_: number, record: CartItemWithKey) => (
        <InputNumber
          min={1}
          className="hover:!border-[#03c0b4]"
          value={record.quantity}
          onChange={(value) => handleQuantityChange(value, record)}
        />
      ),
    },
    {
      title: "Đơn vị",
      dataIndex: "variant_unit",
      align: "center" as const,
    },
    {
      title: "Xóa",
      dataIndex: "actions",
      align: "center" as const,
      render: (record: CartItemWithKey) => (
        <Button type="text" icon={<DeleteOutlined />} danger onClick={() => handleRemove(record)} />
      ),
    },
  ];

  return cartItems.length > 0 ? (
    <Row gutter={24} className="p-10">
      <Col xs={24} lg={16}>
        <Card title={`Giỏ hàng (${cartItems.length} sản phẩm)`}>
          <Table
            dataSource={cartItems}
            columns={columns}
            pagination={false}
            rowKey="key"
            scroll={{ x: true }}
          />
        </Card>
      </Col>

      <Col xs={24} lg={8}>
        <Card bordered>
          <Button block type="default" className="mb-3 flex justify-between items-center">
            <span>Áp dụng ưu đãi để được giảm giá</span>
            <RightOutlined />
          </Button>

          <div className="flex flex-col gap-4 mt-4">
            <Row justify="space-between">
              <Text className="text-base">Tổng tiền</Text>
              <Text className="text-base" strong>
                {totalOriginal.toLocaleString("vi-VN")}đ
              </Text>
            </Row>

            <Row justify="space-between">
              <Text className="text-base">Giảm giá trực tiếp</Text>
              <Text className="text-base" type="danger">
                {discount > 0 ? `-${discount.toLocaleString("vi-VN")}đ` : "0đ"}
              </Text>
            </Row>

            <Row justify="space-between">
              <Text className="text-base">Giảm giá voucher</Text>
              <Text className="text-base" type="danger">
                0đ
              </Text>
            </Row>

            <Divider style={{ margin: "12px 0" }} />

            <Row justify="space-between" align="middle">
              <Title level={5}>Thành tiền</Title>
              <div style={{ textAlign: "right" }}>
                {discount > 0 && (
                  <Text delete type="secondary" style={{ display: "block" }}>
                    {totalOriginal.toLocaleString("vi-VN")}đ
                  </Text>
                )}
                <Text strong style={{ fontSize: 18, color: "#03c0b4" }}>
                  {totalFinal.toLocaleString("vi-VN")}đ
                </Text>
              </div>
            </Row>
          </div>

          <Button
            type="primary"
            block
            className="mt-4 !bg-[#03c0b4]"
            onClick={() => console.log("Mua hàng")}
          >
            Mua hàng
          </Button>

          <Text
            style={{ display: "block", textAlign: "center" as const, marginTop: 12, fontSize: 12 }}
          >
            Bằng việc tiến hành đặt mua hàng, bạn đồng ý với Điều khoản dịch vụ và Chính sách xử lý
            dữ liệu cá nhân.
          </Text>
        </Card>
      </Col>
    </Row>
  ) : (
    <Card>
      <Text>Giỏ hàng của bạn đang trống</Text>
    </Card>
  );
}
