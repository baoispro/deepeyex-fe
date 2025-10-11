import { useCallback } from "react";

export type CartItem = {
  drug_id: string;
  name: string;
  image: string;
  price: number;
  sale_price: number;
  quantity: number;
  discount_percent: number;
};

const STORAGE_KEY = "deep-cart";

export const useCart = () => {
  const getCart = (): CartItem[] => {
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    } catch {
      return [];
    }
  };

  const setCart = (cart: CartItem[]) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
      window.dispatchEvent(new Event("cartUpdated")); // 🔔 báo cho toàn app biết
    }
  };

  const addToCart = useCallback((item: CartItem) => {
    const cart = getCart();

    const index = cart.findIndex((c) => c.drug_id === item.drug_id);

    if (index !== -1) {
      // nếu sp đã có trong cart thì cộng thêm số lượng
      cart[index].quantity += item.quantity;
    } else {
      // chưa có thì thêm mới
      cart.push(item);
    }

    setCart(cart);
  }, []);

  const updateQuantity = useCallback((drug_id: string, quantity: number) => {
    const cart = getCart().map((c) => (c.drug_id === drug_id ? { ...c, quantity } : c));
    setCart(cart);
  }, []);

  const removeFromCart = useCallback((drug_id: string) => {
    const cart = getCart().filter((c) => c.drug_id !== drug_id);
    setCart(cart);
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    getCart,
    addToCart,
    removeFromCart,
    clearCart,
    updateQuantity,
  };
};
