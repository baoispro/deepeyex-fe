"use client";
import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { toast } from "react-toastify";
import { auth } from "@/app/shares/configs/firebase";
import { Link } from "@/app/shares/locales/navigation";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success("Reset email sent! Check your inbox.");
    } catch (error: any) {
      toast.error(error.message || "Failed to send reset email");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm bg-white p-6 rounded-xl shadow-md">
        <h2 className="mb-4 text-2xl font-bold">Forgot Password</h2>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full rounded-md border p-2 mb-4"
        />
        <button
          type="submit"
          className="w-full bg-cyan-600 text-white py-2 rounded-md hover:bg-cyan-500"
        >
          Send Reset Link
        </button>
        <p className="mt-4 text-sm text-gray-500">
          Remember password?{" "}
          <Link href="/signin" className="text-cyan-600 hover:text-cyan-500">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}
