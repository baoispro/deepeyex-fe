"use client";

import { useEffect, useState } from "react";
import { Popover, Button, Badge, List, Typography, Image, Divider } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import { FaShoppingCart } from "react-icons/fa";
import { useCart } from "../hooks/carts/useCart";
import { useRouter } from "../locales/navigation";
import { useTranslations } from "next-intl";

const { Text } = Typography;

export default function CartPopover() {
  const { cartItems: hookCartItems, removeFromCart } = useCart();
  const [cartItems, setCartItems] = useState(hookCartItems);
  const [count, setCount] = useState(0);
  const router = useRouter();

  const t = useTranslations("cart.popover");

  useEffect(() => {
    setCartItems(hookCartItems);
    const total = hookCartItems.reduce((sum, item) => sum + item.quantity, 0);
    setCount(total);
  }, [hookCartItems]);

  const handleRemove = (product_id: number, variant_unit: string) => {
    removeFromCart(product_id, variant_unit);
  };

  const content = (
    <div style={{ width: 320, maxHeight: 400, overflowY: "auto" }}>
      <Typography.Title level={5} style={{ margin: "8px 12px" }}>
        {t("viewCart")}
      </Typography.Title>

      {cartItems.length === 0 ? (
        <div style={{ padding: "0 12px 12px", color: "#888", fontSize: 14 }}>{t("empty")}</div>
      ) : (
        <>
          <List
            dataSource={cartItems}
            renderItem={(item) => (
              <List.Item
                key={`${item.product_id}-${item.variant_unit}`}
                actions={[
                  <Button
                    key={item.product_id}
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleRemove(item.product_id, item.variant_unit)}
                  />,
                ]}
              >
                <List.Item.Meta
                  avatar={
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={40}
                      height={40}
                      style={{ objectFit: "cover", borderRadius: 4 }}
                      preview={false}
                    />
                  }
                  title={
                    <Text ellipsis style={{ maxWidth: 200 }}>
                      {item.name}
                    </Text>
                  }
                  description={
                    <>
                      <div>
                        <Text strong style={{ color: "#03c0b4" }}>
                          {item.sale_price && item.sale_price < item.price
                            ? `${item.sale_price.toLocaleString("vi-VN")}đ`
                            : `${item.price.toLocaleString("vi-VN")}đ`}
                        </Text>
                      </div>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        x{item.quantity} {item.variant_unit}
                      </Text>
                    </>
                  }
                />
              </List.Item>
            )}
          />

          <Divider style={{ margin: "8px 0" }} />

          <div
            style={{
              padding: "0 12px 12px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: 14,
            }}
          >
            <span>
              {cartItems.length} {t("products")}
            </span>

            <Button
              onClick={() => {
                router.push("/cart");
              }}
              type="primary"
              size="small"
              className="!p-2 !bg-[#03c0b4]"
            >
              {t("viewCart")}
            </Button>
          </div>
        </>
      )}
    </div>
  );

  return (
    <Popover content={content} trigger="hover" placement="bottomRight">
      <Button
        onClick={() => router.push("/cart")}
        className="relative text-gray-600 hover:!border-[#03c0b4] transition cursor-pointer pt-1 !h-10"
      >
        <Badge count={count} size="small" offset={[0, 6]}>
          <FaShoppingCart size={22} />
        </Badge>
      </Button>
    </Popover>
  );
}
