import { signIn_en, signIn_vi, signUp_en, signUp_vi } from "@/app/modules/auth/locales";
import { home_en, home_vi } from "@/app/modules/home/locales";

export const messages = {
  en: {
    home: home_en,
    signin: signIn_en,
    signup: signUp_en,
  },
  vi: {
    home: home_vi,
    signin: signIn_vi,
    signup: signUp_vi,
  },
};

export const locales = ["en", "vi"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "vi";
