"use client";

import { useLoginFirebaseMutation } from "@/app/modules/auth/hooks/mutations/use-login-by-google.mutation";
import { useLoginMutation } from "@/app/modules/auth/hooks/mutations/use-login.mutation";
import { CallApi } from "@/app/modules/hospital/apis/call/callApi";
import { PatientApi } from "@/app/modules/hospital/apis/patient/patientApi";
import { auth, googleProvider } from "@/app/shares/configs/firebase";
import { initPatientSocket } from "@/app/shares/configs/socket";
import { Link, usePathname, useRouter } from "@/app/shares/locales/navigation";
import { setPatient } from "@/app/shares/stores/authSlice";
import { connectToStringee } from "@/app/shares/utils/stringee";
import { loadStringeeSdk } from "@/app/shares/utils/stringee-sdk-loader";
import { Button, Dropdown, Input, MenuProps } from "antd";
import { signInWithPopup } from "firebase/auth";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { useState } from "react";
import { AiOutlineGlobal } from "react-icons/ai";
import { FaGoogle } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";

export default function LoginPage() {
  const t = useTranslations("signin");
  const dispatch = useDispatch();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");

  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const [language, setLanguage] = useState<"vi" | "en">(locale as "vi" | "en");

  const loginMutation = useLoginMutation({
    onSuccess: async (data) => {
      toast.success(t("toast.success"));
      localStorage.setItem("email", email);
      localStorage.setItem("user_id", data.data?.user_id || "");
      try {
        const patient = await PatientApi.getByUserID(data.data?.user_id || "");
        // Map GetPatientResponse to PatientInfo
        const patientInfo = {
          patientId: patient.data?.patient_id ?? null,
          fullName: patient.data?.full_name ?? null,
          dob: patient.data?.dob ?? null,
          gender: patient.data?.gender ?? null,
          phone: patient.data?.phone ?? null,
          address: patient.data?.address ?? null,
          email: patient.data?.email ?? null,
          image: patient.data?.image ?? null,
        };
        dispatch(setPatient(patientInfo));
        localStorage.removeItem("email");
        localStorage.removeItem("user_id");
        const res = await CallApi.getStringeeToken(data.data?.user_id || "");
        const stringeeToken = res.data.token;
        await loadStringeeSdk();
        connectToStringee(stringeeToken);
        initPatientSocket(patient.data?.patient_id || "");
        router.push("/");
      } catch (err) {
        toast.warning("Vui lòng hoàn thành hồ sơ bệnh nhân của bạn.");
        router.push("/create-patient");
      }
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || t("toast.error"));
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ username, password });
  };

  const handleChangeLanguage: MenuProps["onClick"] = (e) => {
    const newLocale = e.key as "vi" | "en";
    setLanguage(newLocale);
    router.push(pathname, { locale: newLocale });
  };

  const items: MenuProps["items"] = [
    { label: t("language.vi"), key: "vi" },
    { label: t("language.en"), key: "en" },
  ];

  const loginFirebaseMutation = useLoginFirebaseMutation({
    onSuccess: async (data) => {
      localStorage.setItem("email", email);
      toast.success("Login Google thành công!");

      try {
        const patient = await PatientApi.getByUserID(data.data?.user_id || "");
        const patientInfo = {
          patientId: patient.data?.patient_id ?? null,
          fullName: patient.data?.full_name ?? null,
          dob: patient.data?.dob ?? null,
          gender: patient.data?.gender ?? null,
          phone: patient.data?.phone ?? null,
          address: patient.data?.address ?? null,
          email: patient.data?.email ?? null,
          image: patient.data?.image ?? null,
        };
        dispatch(setPatient(patientInfo));
        localStorage.removeItem("email");
        const res = await CallApi.getStringeeToken(data.data?.user_id || "");
        const stringeeToken = res.data.token;
        await loadStringeeSdk();
        connectToStringee(stringeeToken);
        initPatientSocket(patient.data?.patient_id || "");
        router.push("/");
      } catch (err) {
        toast.warning("Vui lòng hoàn thành hồ sơ bệnh nhân của bạn.");
        router.push("/create-patient");
      }
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Login Google thất bại");
    },
  });

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      setEmail(user.email || "");

      loginFirebaseMutation.mutate({
        firebase_uid: user.uid,
        email: user.email || "",
      });
    } catch (error: unknown) {
      console.error("Google login error:", error);
      toast.error("Login Google thất bại");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="flex w-full max-w-6xl h-full flex-col overflow-hidden rounded-2xl bg-white shadow-xl md:flex-row">
        {/* Left Side (Image) - Đã làm cho hình ảnh rộng hơn */}
        <div className="hidden flex-[2] bg-[url('/login_img_deepeyex.png')] bg-cover bg-center lg:block"></div>

        {/* Right Side (Form) - Đã điều chỉnh để nhỏ lại tương ứng */}
        <div className="flex w-full flex-shrink-0 flex-col items-center p-6 md:w-1/2 md:flex-[1]">
          <div className="mb-3 text-center">
            <div className="flex justify-end">
              <Dropdown menu={{ items, onClick: handleChangeLanguage }} placement="bottomRight">
                <Button
                  icon={<AiOutlineGlobal />}
                  style={{ display: "flex", alignItems: "center", gap: 4 }}
                >
                  {language}
                </Button>
              </Dropdown>
            </div>
            <div className="mx-auto mb-1 h-12 w-12 rounded-full overflow-hidden">
              <Link href={"/"}>
                <Image
                  src="/logoDeepEyeX.png"
                  alt="Logo"
                  width={100}
                  height={100}
                  className="object-cover rounded-full"
                />
              </Link>
            </div>

            <h2 className="text-3xl font-bold text-gray-800">{t("login.title")}</h2>
            <p className="text-gray-500">{t("login.subtitle")}</p>
          </div>

          <form className="w-full max-w-sm space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="username" className="mb-1 block text-sm font-medium text-gray-700">
                {t("login.username")}
              </label>
              <Input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                placeholder={t("login.enterUsername")}
                required
                className="w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-cyan-500 focus:ring-cyan-500"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                size="large"
              />
            </div>
            <div>
              <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700">
                {t("login.password")}
              </label>
              <Input.Password
                placeholder={t("login.enterPassword")}
                className="w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-cyan-500 focus:ring-cyan-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                size="large"
              />
            </div>

            <div className="flex items-center justify-end text-sm">
              <Link
                href="/forgot-password"
                className="font-medium text-cyan-600 hover:text-cyan-500"
              >
                {t("login.forgot")}
              </Link>
            </div>

            <div>
              <button
                type="submit"
                className="w-full rounded-md bg-cyan-600 p-2 font-semibold text-white shadow-sm transition-colors hover:bg-cyan-500 cursor-pointer"
              >
                {t("login.signin")}
              </button>
            </div>
          </form>

          <div className="relative my-4 w-full max-w-sm text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative inline-block bg-white px-2 text-sm text-gray-500">
              {t("login.or")}
            </div>
          </div>

          <div className="flex w-full max-w-sm items-center justify-center">
            <button
              type="button"
              className="flex w-full items-center justify-center gap-2 rounded-md bg-red-500 px-4 py-2 font-medium text-white shadow-md transition-all hover:bg-red-600 focus:ring-2 focus:ring-red-400 focus:ring-offset-1 cursor-pointer"
              onClick={handleGoogleLogin}
            >
              <FaGoogle className="text-white" />
              Google
            </button>
          </div>

          <p className="mt-6 text-center text-sm text-gray-500">
            {t("login.noAccount")}{" "}
            <Link href="/signup" className="font-semibold text-cyan-600 hover:text-cyan-500">
              {t("login.register")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
