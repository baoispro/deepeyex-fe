// app/page.tsx
import { redirect } from "next/navigation";
import { defaultLocale } from "./shares/locales/messages";

export default function RootPage() {
  redirect(`/${defaultLocale}`);
}
