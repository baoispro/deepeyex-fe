"use client";

import { useLoginFirebaseMutation } from "@/app/modules/auth/hooks/mutations/use-login-by-google.mutation";
import { useRegisterMutation } from "@/app/modules/auth/hooks/mutations/use-register.mutation";
import { PatientApi } from "@/app/modules/hospital/apis/patient/patientApi";
import { auth, googleProvider } from "@/app/shares/configs/firebase";
import { Link, usePathname, useRouter } from "@/app/shares/locales/navigation";
import { setPatient } from "@/app/shares/stores/authSlice";
import { isValidPassword } from "@/app/shares/utils/password";
import { Button, Dropdown, Input, MenuProps } from "antd";
import { AxiosError } from "axios";
import { createUserWithEmailAndPassword, deleteUser, signInWithPopup, User } from "firebase/auth";
import { useLocale } from "next-intl";
import Image from "next/image";
import { useState, FormEvent } from "react";
import { AiOutlineGlobal } from "react-icons/ai";
import { FaGoogle } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";

export default function RegisterPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [username, setUsername] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [message, setMessage] = useState<string | null>(null);
  const pathname = usePathname();
  const locale = useLocale();
  const [language, setLanguage] = useState<"vi" | "en">(locale as "vi" | "en");

  type ErrorResponse = {
    status: number;
    message: string;
  };
  const registerMutation = useRegisterMutation({
    onSuccess: () => {
      toast.success("Đăng ký thành công! Vui lòng đăng nhập.");
      router.push("/signin");
    },
    onError: (error) => {
      const axiosError = error as AxiosError<ErrorResponse>;
      const backendMessage = axiosError.response?.data?.message;
      toast.error(backendMessage || "Đăng ký thất bại. Vui lòng thử lại.");
    },
  });

  const clearMessage = (): void => {
    setMessage(null);
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    if (!username) {
      newErrors.username = "Username không được để trống.";
    }
    if (!email) {
      newErrors.email = "Email không được để trống.";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email không hợp lệ.";
    }
    if (!password) {
      newErrors.password = "Mật khẩu không được để trống.";
    }
    if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters long.";
    } else if (!isValidPassword(password)) {
      newErrors.password =
        "Password must contain at least 1 uppercase, 1 lowercase, 1 digit, and 1 special character.";
    }
    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu nhập lại không khớp.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    let firebaseUser: User | null = null;
    e.preventDefault();
    clearMessage();

    if (!validateForm()) return;

    try {
      // Tạo user Firebase
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      firebaseUser = userCredential.user;

      // Gọi backend mutation
      await registerMutation.mutateAsync({
        username,
        email,
        password,
        firebase_uid: firebaseUser.uid,
      });
    } catch (error) {
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        (error as { code?: string }).code === "auth/email-already-in-use"
      ) {
        toast.error("Email is already in use.");
        return;
      }
      if (firebaseUser) {
        try {
          await deleteUser(firebaseUser);
        } catch (delError) {
          console.error("Failed to delete Firebase user:", delError);
        }
      }
    }
  };

  const handleChangeLanguage: MenuProps["onClick"] = (e) => {
    const newLocale = e.key as "vi" | "en";
    setLanguage(newLocale);
    router.push(pathname, { locale: newLocale });
  };

  const items: MenuProps["items"] = [
    { label: "Tiếng Việt", key: "vi" },
    { label: "English", key: "en" },
  ];

  const loginFirebaseMutation = useLoginFirebaseMutation({
    onSuccess: async (data) => {
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
      } catch (err) {
        console.error("Failed to fetch patient:", err);
      }

      router.push("/");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Login Google thất bại");
    },
  });

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

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
        {/* Left Side */}
        <div className="hidden flex-[2] bg-[url('/login_img_deepeyex.png')] bg-cover bg-center md:block"></div>

        {/* Right Side */}
        <div className="flex w-full flex-shrink-0 flex-col items-center p-6 md:w-1/2 md:flex-[1]">
          <div className="mb-3 text-center w-full">
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
            <div className="mx-auto mb-4 h-12 w-12 rounded-full overflow-hidden">
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
            <h2 className="text-3xl font-bold text-gray-800">Join DeepEyeX</h2>
            <p className="text-gray-500">Create an account to get started.</p>
          </div>

          <form className="w-full max-w-sm space-y-4" onSubmit={handleSubmit}>
            {/* Username */}
            <div>
              <label htmlFor="username" className="mb-1 block text-sm font-medium text-gray-700">
                Username
              </label>
              <Input
                id="username"
                name="username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                size="large"
              />
              {errors.username && <p className="text-red-500 text-sm">{errors.username}</p>}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                size="large"
              />
              {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700">
                Password
              </label>
              <Input.Password
                id="password"
                name="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                size="large"
              />
              {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Confirm Password
              </label>
              <Input.Password
                id="confirmPassword"
                name="confirmPassword"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                size="large"
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Submit */}
            <div>
              <button
                type="submit"
                disabled={registerMutation.status === "pending"}
                className="w-full rounded-md bg-cyan-600 p-2 font-semibold text-white shadow-sm transition-colors hover:bg-cyan-500 cursor-pointer"
              >
                {registerMutation.status === "pending" ? "Processing..." : "Sign Up"}
              </button>
            </div>
          </form>

          {/* Thông báo */}
          {message && <p className="mt-4 text-center text-sm text-red-500">{message}</p>}

          <div className="relative my-4 w-full max-w-sm text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative inline-block bg-white px-2 text-sm text-gray-500">
              Or continue with
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
            Already have an account?{" "}
            <Link href="/signin" className="font-semibold text-cyan-600 hover:text-cyan-500">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
