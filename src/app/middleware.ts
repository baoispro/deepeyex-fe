import createMiddleware from "next-intl/middleware";
import { locales, defaultLocale } from "./i18n";

export default createMiddleware({
  locales,
  defaultLocale,
  localePrefix: "always",
});

export const config = {
  matcher: [
    "/", // 👈 thêm dòng này
    "/((?!_next|.*\\..*).*)", // giữ nguyên
  ],
};
