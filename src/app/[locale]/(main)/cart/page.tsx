"use client";

import React, { useState, useEffect } from "react";
import {
  Button,
  Card,
  Checkbox,
  Col,
  Image,
  InputNumber,
  Row,
  Space,
  Table,
  Typography,
} from "antd";
import { RightOutlined } from "@ant-design/icons";
import { useCart } from "@/app/shares/hooks/carts/useCart";
import { useTranslations } from "next-intl";
import { MdOutlineKeyboardArrowLeft } from "react-icons/md";
import { Link, useRouter } from "@/app/shares/locales/navigation";
import { FaTrashCan } from "react-icons/fa6";

const { Text } = Typography;

export interface CartItemWithKey {
  key: string;
  selected: boolean;
  drug_id: string;
  name: string;
  image: string;
  price: number;
  sale_price?: number;
  quantity: number;
  variant_unit?: string;
}

export default function CartInfo() {
  const t = useTranslations("cart");
  const router = useRouter();

  const { getCart, removeFromCart, updateQuantity } = useCart();

  const [localItems, setLocalItems] = useState<CartItemWithKey[]>([]);
  const [selectAll, setSelectAll] = useState(true);

  useEffect(() => {
    const mapped = getCart().map((item) => ({
      ...item,
      key: `${item.drug_id}`,
      selected: true,
    }));
    setLocalItems(mapped);
    setSelectAll(mapped.length > 0);
  }, []);

  const handleQuantityChange = (value: number | null, record: CartItemWithKey) => {
    if (!value) return;
    updateQuantity(record.drug_id, value);
    setLocalItems((prev) =>
      prev.map((i) => (i.key === record.key ? { ...i, quantity: value } : i)),
    );
  };

  const handleRemove = (record: CartItemWithKey) => {
    removeFromCart(record.drug_id);
  };

  const handleSelectItem = (checked: boolean, record: CartItemWithKey) => {
    const updated = localItems.map((i) => (i.key === record.key ? { ...i, selected: checked } : i));
    setLocalItems(updated);
    setSelectAll(updated.every((i) => i.selected));
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    setLocalItems((prev) => prev.map((i) => ({ ...i, selected: checked })));
  };

  const selectedItems = localItems.filter((i) => i.selected);

  const totalOriginal = selectedItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const totalFinal = selectedItems.reduce((sum, i) => {
    const price = i.sale_price && i.sale_price < i.price ? i.sale_price : i.price;
    return sum + price * i.quantity;
  }, 0);

  const discount = totalOriginal - totalFinal;
  const formatCurrency = (v: number) => new Intl.NumberFormat("vi-VN").format(v) + "đ";

  const columns = [
    {
      title: (
        <Space>
          <Checkbox checked={selectAll} onChange={(e) => handleSelectAll(e.target.checked)} />
          <Text>Chọn tất cả ({selectedItems.length})</Text>
        </Space>
      ),
      dataIndex: "selected",
      render: (_: boolean, record: CartItemWithKey) => (
        <Checkbox
          checked={record.selected}
          onChange={(e) => handleSelectItem(e.target.checked, record)}
        />
      ),
      width: 180,
    },
    {
      title: t("product"),
      dataIndex: "name",
      render: (_: string, record: CartItemWithKey) => (
        <Space align="start">
          <Image
            src={record.image}
            width={48}
            height={48}
            preview={false}
            alt="product"
            className="border border-[#e4e8ed] p-1 rounded-xl"
          />
          <Text strong className="text-sm text-[#020b27]">
            {record.name}
          </Text>
        </Space>
      ),
    },
    {
      title: t("price"),
      dataIndex: "price",
      align: "center" as const,
      width: 95,
      render: (_: number, record: CartItemWithKey) => {
        const hasDiscount = record.sale_price && record.sale_price < record.price;
        return hasDiscount ? (
          <div>
            <Text className="!text-sm !text-[#1250dc] !font-semibold">
              {formatCurrency(record.sale_price! * record.quantity)}
            </Text>
            <br />
            <Text delete type="secondary">
              {formatCurrency(record.price * record.quantity)}
            </Text>
          </div>
        ) : (
          <Text strong>{formatCurrency(record.price * record.quantity)}</Text>
        );
      },
    },
    {
      title: t("quantity"),
      dataIndex: "quantity",
      align: "center" as const,
      render: (_: number, record: CartItemWithKey) => (
        <InputNumber
          min={1}
          value={record.quantity}
          onChange={(value) => handleQuantityChange(value, record)}
          className="hover:!border-[#03c0b4]"
        />
      ),
    },
    // {
    //   title: t("unit"),
    //   dataIndex: "variant_unit",
    //   align: "center" as const,
    // },
    {
      title: t("delete"),
      dataIndex: "actions",
      align: "center" as const,
      render: (_: unknown, record: CartItemWithKey) => (
        <Button
          type="text"
          icon={<FaTrashCan />}
          onClick={() => handleRemove(record)}
          className="!text-[#657384]"
        />
      ),
    },
  ];

  return localItems.length > 0 ? (
    <>
      <Link
        href={"/shop"}
        className="px-10 flex gap-1 items-center text-[#1250dc] font-medium hover:text-[#5979c4]"
      >
        <MdOutlineKeyboardArrowLeft size={20} /> <p>Tiếp tục mua sắm</p>
      </Link>

      <Row gutter={24} className="px-10 pb-10 pt-2">
        <Col xs={24} lg={16}>
          <Table
            dataSource={localItems}
            columns={columns}
            pagination={false}
            rowKey="key"
            scroll={{ x: true }}
            className="rounded-2xl overflow-hidden border border-gray-200"
          />
        </Col>

        <Col xs={24} lg={8}>
          <Card className="!rounded-2xl">
            <Button
              block
              className="mb-3 !flex !justify-between items-center !bg-[#eaeffa] !text-[#1250dc] !border-none p-1 !font-semibold"
            >
              <span>{t("applyDiscount")}</span>
              <RightOutlined />
            </Button>

            <div className="flex flex-col gap-4 mt-4">
              <Row justify="space-between">
                <Text className="!text-base !text-[#4a4f63]">{t("totalPrice")}</Text>
                <Text className="!text-base" strong>
                  {formatCurrency(totalOriginal)}
                </Text>
              </Row>

              <Row justify="space-between">
                <Text className="!text-base !text-[#4a4f63]">{t("directDiscount")}</Text>
                <Text className="!text-base !text-[#f79009] !font-semibold">
                  {discount > 0 ? `-${formatCurrency(discount)}` : "0đ"}
                </Text>
              </Row>

              <Row justify="space-between">
                <Text className="!text-base !text-[#4a4f63]">{t("voucherDiscount")}</Text>
                <Text className="!text-base !text-[#f79009] !font-semibold">0đ</Text>
              </Row>

              <Row justify="space-between" align="middle">
                <p className="!text-xl font-semibold">{t("finalAmount")}</p>
                <div className="flex items-center gap-1 text-right">
                  {discount > 0 && (
                    <Text delete type="secondary">
                      {formatCurrency(totalOriginal)}
                    </Text>
                  )}
                  <Text strong style={{ fontSize: 20, color: "#1250dc" }}>
                    {formatCurrency(totalFinal)}
                  </Text>
                </div>
              </Row>
            </div>

            <Button
              type="primary"
              block
              className="mt-4 !bg-gradient-to-tr from-[#1250dc] to-[#306de4] hover:brightness-110 hover:shadow-lg"
              onClick={() => {
                router.push("/payment");
                localStorage.setItem("type", "thuoc");
                localStorage.setItem("cartItems", JSON.stringify(localItems));
              }}
            >
              {t("buyNow")}
            </Button>

            <Text
              style={{
                display: "block",
                textAlign: "center",
                marginTop: 12,
                fontSize: 12,
              }}
            >
              {t("agreeTerms")}
            </Text>
          </Card>
        </Col>
      </Row>
    </>
  ) : (
    <Card className="!mx-10 !mb-10 !mt-2 !flex !justify-center !items-center">
      <Text className="!text-center !text-base !text-[#4a4f63] !font-semibold">
        {t("emptyCart")}
      </Text>
    </Card>
  );
}
