"use client";

import { useEffect, useState } from "react";
import { Popover, Badge, List, Typography, Image } from "antd";
import { FaShoppingCart, FaTrashAlt } from "react-icons/fa";
import { useCart } from "../hooks/carts/useCart";
import { Link, useRouter } from "../locales/navigation";
import { useTranslations } from "next-intl";

const { Text } = Typography;

export default function CartPopover() {
  const { cartItems: hookCartItems, removeFromCart } = useCart();
  const [cartItems, setCartItems] = useState(hookCartItems);
  const [count, setCount] = useState(0);
  const router = useRouter();

  const t = useTranslations("cart");

  useEffect(() => {
    setCartItems(hookCartItems);
    const total = hookCartItems.reduce((sum, item) => sum + item.quantity, 0);
    setCount(total);
  }, [hookCartItems]);

  const handleRemove = (product_id: number, variant_unit: string) => {
    removeFromCart(product_id, variant_unit);
  };

  const content = (
    <div className="w-80 max-h-96 overflow-y-auto">
      <Typography.Title level={5} className="m-2.5">
        {t("cart")}
      </Typography.Title>

      {cartItems.length === 0 ? (
        <div className="px-3 pb-3 text-gray-500 text-sm">{t("empty")}</div>
      ) : (
        <>
          <List
            dataSource={cartItems}
            renderItem={(item) => (
              <List.Item
                key={`${item.product_id}-${item.variant_unit}`}
                actions={[
                  <button
                    key={item.product_id}
                    className="text-gray-500 hover:text-red-600 cursor-pointer"
                    onClick={() => handleRemove(item.product_id, item.variant_unit)}
                    aria-label="Remove item"
                  >
                    <FaTrashAlt size={18} />
                  </button>,
                ]}
              >
                <List.Item.Meta
                  avatar={
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={44}
                      height={46}
                      style={{ objectFit: "cover" }}
                      className="border p-2 border-[#e4e8ed] rounded-lg"
                      preview={false}
                    />
                  }
                  title={
                    <Text
                      ellipsis
                      style={{ maxWidth: 200 }}
                      className="text-sm text-[#020b27] font-semibold"
                    >
                      {item.name}
                    </Text>
                  }
                  description={
                    <div className="flex items-center justify-between">
                      <Text style={{ color: "#1250dc" }} className="font-semibold text-sm">
                        {item.sale_price && item.sale_price < item.price
                          ? `${item.sale_price.toLocaleString("vi-VN")}đ`
                          : `${item.price.toLocaleString("vi-VN")}đ`}
                      </Text>
                      <Text type="secondary" className="text-xs text-[#657384] font-medium">
                        x{item.quantity} {item.variant_unit}
                      </Text>
                    </div>
                  }
                />
              </List.Item>
            )}
          />

          <div className="px-3 pb-3 flex justify-between items-center text-sm text-[#657384] font-bold">
            <span>
              {cartItems.length} {t("products")}
            </span>

            <button
              onClick={() => router.push("/cart")}
              className="px-3 py-2 bg-gradient-to-br from-[#1250dc] to-[#306de4] text-white font-medium rounded-4xl transition duration-300 ease-in-out hover:brightness-110 hover:shadow-lg cursor-pointer"
            >
              {t("viewCart")}
            </button>
          </div>
        </>
      )}
    </div>
  );

  return (
    <Popover content={content} trigger="hover" placement="bottomRight">
      <Link href={"/cart"} className="mt-1">
        <Badge count={count} size="small" offset={[0, 6]}>
          <FaShoppingCart size={22} className="cursor-pointer text-gray-600 hover:text-[#1250dc]" />
        </Badge>
      </Link>
    </Popover>
  );
}
