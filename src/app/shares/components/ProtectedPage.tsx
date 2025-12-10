"use client";

import { useAppSelector } from "@/app/shares/stores";
import { useRouter } from "@/app/shares/locales/navigation";
import { useEffect } from "react";
import { toast } from "react-toastify";

export default function ProtectedPage({ children }: { children: React.ReactNode }) {
  const isLoggedIn = useAppSelector((s) => !!s.auth.accessToken);
  const router = useRouter();

  useEffect(() => {
    if (!isLoggedIn) {
      toast.warning("Hãy đăng nhập để sử dụng chức năng này!");
      router.push("/signin");
    }
  }, [isLoggedIn]);

  if (!isLoggedIn) return null;

  return <>{children}</>;
}
