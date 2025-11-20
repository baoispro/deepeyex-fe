import { signIn_en, signIn_vi, signUp_en, signUp_vi } from "@/app/modules/auth/locales";
import { booking_en, booking_vi } from "@/app/modules/booking/locales";
import { home_en, home_vi } from "@/app/modules/home/locales";
import { predict_en, predict_vi } from "@/app/modules/predict/locales";
import { cart_en, cart_vi, product_en, product_vi } from "@/app/modules/shop/locales";

export const messages = {
  en: {
    home: home_en,
    signin: signIn_en,
    signup: signUp_en,
    cart: cart_en,
    product: product_en,
    booking: booking_en,
    predict: predict_en,
  },
  vi: {
    home: home_vi,
    signin: signIn_vi,
    signup: signUp_vi,
    cart: cart_vi,
    product: product_vi,
    booking: booking_vi,
    predict: predict_vi,
  },
};

export const locales = ["en", "vi"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "vi";
