import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "vi"], // danh sách ngôn ngữ được hỗ trợ
  defaultLocale: "vi", // ngôn ngữ mặc định
});
