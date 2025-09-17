"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { confirmPasswordReset } from "firebase/auth";
import { auth } from "@/app/shares/configs/firebase";
import { useState } from "react";
import { toast } from "react-toastify";
import { Input, Button, Card, Typography } from "antd";
import { Link } from "@/app/shares/locales/navigation";

const { Title, Text } = Typography;

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const oobCode = searchParams.get("oobCode");
  const mode = searchParams.get("mode");
  const router = useRouter();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oobCode || mode !== "resetPassword") {
      toast.error("Invalid or expired reset link.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }
    try {
      setLoading(true);
      await confirmPasswordReset(auth, oobCode, newPassword);
      toast.success("Password reset successfully! Please login.");
      setTimeout(() => router.push("/signin"), 2000); // redirect sau 2s
    } catch (error: any) {
      toast.error(error.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-sm rounded-xl shadow-md">
        <Title level={3} className="mb-4 text-center">
          Reset Password
        </Title>

        <form onSubmit={handleReset}>
          <Input.Password
            placeholder="Enter new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="mb-4"
          />
          <Input.Password
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="mb-4"
          />

          <Button type="primary" htmlType="submit" block loading={loading} className="mb-3">
            Reset Password
          </Button>
        </form>

        <Text type="secondary">
          Remember password?{" "}
          <Link href="/signin" className="text-cyan-600 hover:text-cyan-500">
            Sign in
          </Link>
        </Text>
      </Card>
    </div>
  );
}
