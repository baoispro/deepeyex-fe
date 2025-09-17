"use client";

import { useState, FormEvent, ChangeEvent } from "react";
import Image from "next/image";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { setPatient } from "@/app/shares/stores/authSlice";
import { useCreatePatientMutation } from "@/app/modules/hospital/hooks/mutations/patients/use-create-patient.mutation";
import { Gender } from "@/app/modules/hospital/enums/gender";
import { useAppSelector } from "@/app/shares/stores";
import { useRouter } from "@/app/shares/locales/navigation";

export default function PatientForm({ onSuccess }: { onSuccess?: () => void }) {
  const dispatch = useDispatch();
  const [fullName, setFullName] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState<Gender>(Gender.Male);
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const email = localStorage.getItem("email") || "";
  const userId = localStorage.getItem("user_id") || "";
  const router = useRouter();
  const accessToken = useAppSelector((state) => state.auth.accessToken);

  const createPatientMutation = useCreatePatientMutation({
    onSuccess: (res) => {
      localStorage.removeItem("email");
      localStorage.removeItem("user_id");
      toast.success("Thông tin bệnh nhân được tạo thành công!");
      dispatch(
        setPatient({
          patientId: res.data?.patient_id ?? null,
          fullName: res.data?.full_name ?? null,
          dob: res.data?.dob ?? null,
          gender: res.data?.gender ?? null,
          phone: res.data?.phone ?? null,
          address: res.data?.address ?? null,
          email: res.data?.email ?? null,
          image: res.data?.image ?? null,
        }),
      );
      if (!accessToken || accessToken == "") {
        router.push("/signin");
      } else {
        router.push("/");
      }
      onSuccess?.();
    },
    onError: () => {
      toast.error("Tạo thông tin bệnh nhân thất bại.");
    },
  });

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setAvatar(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setAvatarPreview(null);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Chuyển null thành undefined cho avatar
    const formData = {
      user_id: userId,
      full_name: fullName,
      dob,
      gender,
      phone,
      address,
      email,
      avatar: avatar ?? undefined,
    };

    await createPatientMutation.mutateAsync(formData);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="flex w-full max-w-7xl h-full flex-col overflow-hidden rounded-2xl bg-white shadow-xl md:flex-row">
        <div
          className="hidden flex-[2] bg-cover bg-center md:block"
          style={{ backgroundImage: "url('/login_img_deepeyex.png')" }}
        />
        <div className="flex w-full flex-shrink-0 flex-col items-center p-6 md:w-1/2 md:flex-[1]">
          <div className="mb-3 text-center w-full">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full overflow-hidden">
              <Image
                src="/logoDeepEyeX.png"
                alt="Logo"
                width={100}
                height={100}
                className="object-cover rounded-full"
              />
            </div>
            <h2 className="text-3xl font-bold text-gray-800">Chỉ còn vài bước nữa thôi!</h2>
            <p className="mt-2 text-gray-600">
              Vui lòng điền thông tin bên dưới để hoàn tất hồ sơ và bắt đầu sử dụng dịch vụ.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={email}
                readOnly
                className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-gray-100 rounded-md shadow-sm sm:text-sm cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Ảnh đại diện</label>
              <div className="mt-1 flex items-center space-x-4">
                {avatarPreview ? (
                  <Image
                    src={avatarPreview}
                    alt="Ảnh đại diện"
                    width={96}
                    height={96}
                    className="h-24 w-24 rounded-full object-cover"
                  />
                ) : (
                  <span className="inline-block h-24 w-24 overflow-hidden rounded-full bg-gray-100" />
                )}
                <label className="cursor-pointer rounded-md bg-white font-medium text-cyan-600 hover:text-cyan-500">
                  <span>Chọn ảnh</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={handleAvatarChange}
                  />
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Họ và tên đầy đủ</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Ngày sinh</label>
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Giới tính</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as Gender)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm"
              >
                {Object.values(Gender).map((g) => (
                  <option key={g} value={g}>
                    {g === Gender.Male ? "Nam" : g === Gender.Female ? "Nữ" : "Khác"}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Số điện thoại</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Ví dụ: 0912345678"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Địa chỉ</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Ví dụ: 123 Đường ABC, Quận 1, TP. HCM"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={createPatientMutation.isPending}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 ${
                createPatientMutation.isPending ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {createPatientMutation.isPending ? "Đang xử lý..." : "Hoàn tất hồ sơ"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
