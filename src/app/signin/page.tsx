"use client"; // cần client component để handle form

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { FaGoogle } from "react-icons/fa";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // gọi API login
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (res.ok) {
      alert("Login success!");
      // redirect về home hoặc dashboard
      window.location.href = "/";
    } else {
      alert("Invalid credentials");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="flex w-full max-w-6xl h-full flex-col overflow-hidden rounded-2xl bg-white shadow-xl md:flex-row">
        {/* Left Side (Image) - Đã làm cho hình ảnh rộng hơn */}
        <div className="hidden flex-[1] bg-[url('/login_img_deepeyex.png')] bg-cover bg-center md:block"></div>

        {/* Right Side (Form) - Đã điều chỉnh để nhỏ lại tương ứng */}
        <div className="flex w-full flex-shrink-0 flex-col items-center p-6 md:w-1/2 md:flex-[1]">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full overflow-hidden">
              <Image
                src="/logoDeepEyeX.png"
                alt="Logo"
                width={100}
                height={100}
                className="object-cover rounded-full"
              />
            </div>
            <h2 className="text-3xl font-bold text-gray-800">
              Welcome Back To DeepEyeX
            </h2>
            <p className="text-gray-500">Please sign in to continue.</p>
          </div>

          <form className="w-full max-w-sm space-y-4" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="username"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                placeholder="Enter your username"
                required
                className="w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-cyan-500 focus:ring-cyan-500"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="Enter your password"
                required
                className="w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-cyan-500 focus:ring-cyan-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-end text-sm">
              <Link
                href="/forgot-password"
                className="font-medium text-cyan-600 hover:text-cyan-500"
              >
                Forgot your password?
              </Link>
            </div>

            <div>
              <button
                type="submit"
                className="w-full rounded-md bg-cyan-600 p-2 font-semibold text-white shadow-sm transition-colors hover:bg-cyan-500"
              >
                Sign In
              </button>
            </div>
          </form>

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
              className="flex w-full items-center justify-center gap-2 rounded-md bg-red-500 px-4 py-2 font-medium text-white shadow-md transition-all hover:bg-red-600 focus:ring-2 focus:ring-red-400 focus:ring-offset-1"
            >
              <FaGoogle className="text-white" />
              Google
            </button>
          </div>

          <p className="mt-6 text-center text-sm text-gray-500">
            Don't have an account?{" "}
            <Link
              href="/register"
              className="font-semibold text-cyan-600 hover:text-cyan-500"
            >
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
