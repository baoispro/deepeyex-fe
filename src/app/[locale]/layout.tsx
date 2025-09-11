import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import Providers from "../providers";
import {
  messages,
  locales as supportedLocales,
  defaultLocale,
  Locale,
} from "../shares/locales/messages";

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;

  const locale = (
    supportedLocales.includes(rawLocale as Locale) ? rawLocale : defaultLocale
  ) as Locale;

  if (!supportedLocales.includes(rawLocale as Locale)) {
    redirect(`/${defaultLocale}`);
  }

  return (
    <Providers locale={locale} messages={messages[locale]}>
      {children}
    </Providers>
  );
}
