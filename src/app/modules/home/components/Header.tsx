"use client";
import { Link, usePathname, useRouter } from "@/app/shares/locales/navigation";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { useState } from "react";

export default function Header() {
  const t = useTranslations("home");
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const [language, setLanguage] = useState<"vi" | "en">(locale as "vi" | "en");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const flags = {
    vi: {
      src: "https://flagcdn.com/36x27/vn.png",
      srcSet: "https://flagcdn.com/72x54/vn.png 2x, https://flagcdn.com/108x81/vn.png 3x",
      alt: "Vietnam",
    },
    en: {
      src: "https://flagcdn.com/36x27/gb.png",
      srcSet: "https://flagcdn.com/72x54/gb.png 2x, https://flagcdn.com/108x81/gb.png 3x",
      alt: "United Kingdom",
    },
  };
  const handleChangeLanguage = (locale: "vi" | "en") => {
    router.push(pathname, { locale });
  };

  return (
    <header className="bg-white shadow-md py-4 px-6 md:px-12 fixed top-0 w-full z-50">
      <nav className="flex justify-between items-center max-w-7xl mx-auto">
        <div className="flex-shrink-0 flex items-center space-x-2">
          <Link href="/" className="text-2xl font-bold text-[#03c0b4] flex items-center">
            <Image
              src={"/logoDeepEyeX.png"}
              alt="Logo"
              width={40}
              height={40}
              className="rounded-md"
            />
            <span className="ml-2 hidden sm:inline">DeepEyeX</span>
          </Link>
        </div>
        <ul className="hidden md:flex space-x-6 lg:space-x-8">
          <li>
            <Link
              href="#home"
              className="text-gray-600 hover:text-[#03c0b4] transition-colors duration-300"
            >
              {t("home")}
            </Link>
          </li>
          <li>
            <Link
              href="#about"
              className="text-gray-600 hover:text-[#03c0b4] transition-colors duration-300"
            >
              {t("about")}
            </Link>
          </li>
          <li>
            <Link
              href="#services"
              className="text-gray-600 hover:text-[#03c0b4] transition-colors duration-300"
            >
              {t("services")}
            </Link>
          </li>
          <li>
            <Link
              href="#contact"
              className="text-gray-600 hover:text-[#03c0b4] transition-colors duration-300"
            >
              {t("contact")}
            </Link>
          </li>
        </ul>
        <div className="flex items-center space-x-4">
          {/* Language Selector */}
          <div className="relative group">
            <button className="flex items-center space-x-2 px-3 py-2 border rounded-lg text-gray-700 hover:bg-gray-50 transition cursor-pointer">
              <Image src={flags[language].src} width={24} height={18} alt={flags[language].alt} />
              <span>{language.toUpperCase()}</span>
            </button>
            <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition p-2">
              <button
                onClick={() => handleChangeLanguage("vi")}
                className="flex items-center space-x-2 w-full text-left px-2 py-1 text-sm hover:bg-indigo-50 rounded cursor-pointer"
              >
                <Image src={flags.vi.src} width={20} height={15} alt={flags.vi.alt} />
                <span>Tiếng Việt</span>
              </button>
              <button
                onClick={() => handleChangeLanguage("en")}
                className="flex items-center space-x-2 w-full text-left px-2 py-1 text-sm hover:bg-indigo-50 rounded"
              >
                <Image src={flags.en.src} width={20} height={15} alt={flags.en.alt} />
                <span>English</span>
              </button>
            </div>
          </div>
          {/* Auth */}
          {!isLoggedIn ? (
            <>
              <button className="px-4 py-2 text-[#03c0b4] border border-[#03c0b4] rounded-lg hover:bg-indigo-50 transition cursor-pointer">
                {t("login")}
              </button>
              <button
                className="px-4 py-2 bg-[#03c0b4] text-white rounded-lg hover:bg-[#029d91] transition cursor-pointer"
                onClick={() => router.push("/signup")}
              >
                {t("signup")}
              </button>
            </>
          ) : (
            <div className="relative group">
              <Image
                src="/user-avatar.png"
                alt="User Avatar"
                width={40}
                height={40}
                className="rounded-full cursor-pointer border-2 border-[#03c0b4]"
              />
              <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition p-2">
                <Link
                  href="#profile"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 rounded-md"
                >
                  {t("profile")}
                </Link>
                <button
                  onClick={() => setIsLoggedIn(false)}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-red-50 rounded-md"
                >
                  {t("logout")}
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
