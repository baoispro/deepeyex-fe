import { home_en, home_vi } from "@/app/modules/home/locales";

export const messages = {
  en: {
    home: home_en,
  },
  vi: {
    home: home_vi,
  },
};

export const locales = ["en", "vi"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "vi";
