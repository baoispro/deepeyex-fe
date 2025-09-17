"use client";
import { useSearchParams } from "next/navigation";
import { confirmPasswordReset, verifyPasswordResetCode } from "firebase/auth";
import { auth } from "@/app/shares/configs/firebase";
import { toast } from "react-toastify";
import { Input, Button, Card, Typography, Form } from "antd";
import { Link, useRouter } from "@/app/shares/locales/navigation";
import { useResetPasswordMutation } from "@/app/modules/auth/hooks/mutations/use-update-password.mutation";
import { isValidPassword } from "@/app/shares/utils/password";

const { Title, Text } = Typography;

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const oobCode = searchParams.get("oobCode");
  const mode = searchParams.get("mode");
  const router = useRouter();

  const { mutate: resetPassword, isPending } = useResetPasswordMutation({
    onSuccess: () => {
      toast.success("Password reset successfully! Please login.");
      setTimeout(() => router.push("/signin"), 2000);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to reset password");
    },
  });

  const handleReset = async (values: { newPassword: string; confirmPassword: string }) => {
    if (!oobCode || mode !== "resetPassword") {
      toast.error("Invalid or expired reset link.");
      return;
    }

    try {
      const email = await verifyPasswordResetCode(auth, oobCode);
      await confirmPasswordReset(auth, oobCode, values.newPassword);
      resetPassword({ email, password: values.newPassword });
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message || "Failed to reset password");
      } else {
        toast.error("Failed to reset password");
      }
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-sm rounded-xl shadow-md">
        <Title level={3} className="mb-4 text-center">
          Reset Password
        </Title>

        <Form onFinish={handleReset} layout="vertical">
          <Form.Item
            name="newPassword"
            label="New Password"
            rules={[
              { required: true, message: "Please enter your new password" },
              { min: 8, message: "Password must be at least 8 characters long" },
              {
                validator: (_, value) =>
                  value && !isValidPassword(value)
                    ? Promise.reject(
                        "Must contain uppercase, lowercase, number, and special character",
                      )
                    : Promise.resolve(),
              },
            ]}
          >
            <Input.Password placeholder="Enter new password" />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Confirm Password"
            dependencies={["newPassword"]}
            rules={[
              { required: true, message: "Please confirm your password" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("newPassword") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Passwords do not match"));
                },
              }),
            ]}
          >
            <Input.Password placeholder="Confirm new password" />
          </Form.Item>

          <Button type="primary" htmlType="submit" block loading={isPending} className="mb-3">
            Reset Password
          </Button>
        </Form>

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
