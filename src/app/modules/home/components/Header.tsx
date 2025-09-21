"use client";
import { Link, usePathname, useRouter } from "@/app/shares/locales/navigation";
import { persistor, useAppDispatch, useAppSelector } from "@/app/shares/stores";
import { clearTokens } from "@/app/shares/stores/authSlice";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { useState } from "react";
import { Dropdown, MenuProps } from "antd";
import Avatar from "react-avatar";
import CartPopover from "@/app/shares/components/CartPopover";

export default function Header() {
  const t = useTranslations("home");
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const [language, setLanguage] = useState<"vi" | "en">(locale as "vi" | "en");
  const auth = useAppSelector((state) => state.auth);
  const image = auth.patient?.image;
  const isLoggedIn = !!auth.accessToken;
  const dispatch = useAppDispatch();
  const name = auth.patient?.fullName;

  // Flags
  const flags = {
    vi: {
      src: "https://flagcdn.com/36x27/vn.png",
      alt: "Vietnam",
    },
    en: {
      src: "https://flagcdn.com/36x27/gb.png",
      alt: "United Kingdom",
    },
  };

  const handleChangeLanguage = (locale: "vi" | "en") => {
    router.push(pathname, { locale });
  };

  // Sub menu Services
  const serviceItems: MenuProps["items"] = [
    {
      key: "booking",
      label: <Link href="/booking">{t("booking")}</Link>,
    },
    {
      key: "diagnosis",
      label: <Link href="/predict">{t("diagnosis")}</Link>,
    },
    {
      key: "consultation",
      label: <Link href="/consultation">{t("consultation")}</Link>,
    },
  ];

  return (
    <header className="bg-white shadow-md py-4 px-6 md:px-12 fixed top-0 w-full z-50">
      <nav className="flex justify-between items-center max-w-7xl mx-auto">
        {/* Logo */}
        <div className="flex items-center gap-5">
          <div className="flex-shrink-0 flex items-center space-x-2">
            <Link
              href="/"
              className="text-2xl font-bold bg-gradient-to-r from-[#03c0b4] to-[#1250dc] bg-clip-text text-transparent flex items-center"
            >
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

          {/* Menu */}
          <ul className="hidden md:flex space-x-6 lg:space-x-8">
            <li>
              <Link
                href="/"
                className="text-gray-600 hover:text-[#1250dc] transition-colors duration-300"
              >
                {t("home")}
              </Link>
            </li>

            {/* Services dropdown */}
            <li>
              <Dropdown menu={{ items: serviceItems }} trigger={["hover"]}>
                <span className="cursor-pointer text-gray-600 hover:text-[#1250dc] transition-colors duration-300">
                  {t("services")}
                </span>
              </Dropdown>
            </li>

            <li>
              <Link
                href="/shop"
                className="text-gray-600 hover:text-[#1250dc] transition-colors duration-300"
              >
                {t("shop")}
              </Link>
            </li>

            <li>
              <Link
                href="#contact"
                className="text-gray-600 hover:text-[#1250dc] transition-colors duration-300"
              >
                {t("contact")}
              </Link>
            </li>
          </ul>
        </div>

        {/* Right section */}
        <div className="flex items-center space-x-4">
          {/* Language Selector */}
          <div className="relative group">
            <button className="flex items-center space-x-2 px-3 py-2 border rounded-4xl text-gray-700 hover:bg-gray-50 transition cursor-pointer">
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
              <button
                className="px-4 py-2 text-[#1250dc] border border-[#1250dc] rounded-4xl hover:bg-indigo-50 transition cursor-pointer"
                onClick={() => router.push("/signin")}
              >
                {t("login")}
              </button>
              <button
                className="px-4 py-2 bg-gradient-to-br from-[#1250dc] to-[#306de4] text-white rounded-4xl transition duration-300 ease-in-out hover:brightness-110 hover:shadow-lg cursor-pointer"
                onClick={() => router.push("/signup")}
              >
                {t("signup")}
              </button>
            </>
          ) : (
            <div className="relative group">
              <Avatar name={name || ""} src={image || ""} size="40" round={true} />
              <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition p-2">
                <Link
                  href="/profile"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 rounded-md"
                >
                  {t("profile")}
                </Link>
                <button
                  onClick={() => {
                    dispatch(clearTokens());
                    persistor.purge();
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-red-50 rounded-md"
                >
                  {t("logout")}
                </button>
              </div>
            </div>
          )}
          {/* Cart */}

          <CartPopover />
        </div>
      </nav>
    </header>
  );
}
