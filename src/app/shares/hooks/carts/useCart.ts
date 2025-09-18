import { useState, useEffect, useCallback } from "react";
import { CartItem } from "../../types/types";

const initialCart: CartItem[] = [
  {
    product_id: 1,
    name: "Sữa rửa mặt dưỡng ẩm",
    image:
      "https://cdn.nhathuoclongchau.com.vn/unsafe/768x0/filters:quality(90)/https://cms-prod.s3-sgn09.fptcloud.com/DSC_09324_db795e136a.jpg",
    price: 120000,
    sale_price: 99000,
    quantity: 2,
    variant_unit: "chai",
  },
  {
    product_id: 2,
    name: "Serum vitamin C",
    image:
      "https://cdn.nhathuoclongchau.com.vn/unsafe/768x0/filters:quality(90)/https://cms-prod.s3-sgn09.fptcloud.com/DSC_09324_db795e136a.jpg",
    price: 250000,
    sale_price: 230000,
    quantity: 1,
    variant_unit: "lọ",
  },
];

export function useCart() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  useEffect(() => {
    setCartItems(initialCart);
  }, []);

  const getCart = useCallback(() => {
    return cartItems;
  }, [cartItems]);

  const addToCart = useCallback((item: CartItem) => {
    setCartItems((prev) => {
      const exists = prev.find(
        (c) => c.product_id === item.product_id && c.variant_unit === item.variant_unit,
      );
      if (exists) {
        return prev.map((c) =>
          c.product_id === item.product_id && c.variant_unit === item.variant_unit
            ? { ...c, quantity: c.quantity + item.quantity }
            : c,
        );
      }
      return [...prev, item];
    });
  }, []);

  const removeFromCart = useCallback((product_id: number, variant_unit: string) => {
    setCartItems((prev) =>
      prev.filter(
        (item) => !(item.product_id === product_id && item.variant_unit === variant_unit),
      ),
    );
  }, []);

  const updateQuantity = useCallback(
    (product_id: number, variant_unit: string, quantity: number) => {
      if (quantity <= 0) return;
      setCartItems((prev) =>
        prev.map((item) =>
          item.product_id === product_id && item.variant_unit === variant_unit
            ? { ...item, quantity }
            : item,
        ),
      );
    },
    [],
  );

  const totalOriginal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalFinal = cartItems.reduce((sum, item) => {
    const actualPrice = item.sale_price < item.price ? item.sale_price : item.price;
    return sum + actualPrice * item.quantity;
  }, 0);

  const discount = totalOriginal - totalFinal;

  return {
    cartItems,
    getCart,
    addToCart,
    removeFromCart,
    updateQuantity,
    totalOriginal,
    totalFinal,
    discount,
  };
}
