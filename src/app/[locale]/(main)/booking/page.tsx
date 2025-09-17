"use client";

import { useRouter } from "@/app/shares/locales/navigation";
import { Button, GetProps, Input, Radio, RadioChangeEvent, Select, Tabs, TabsProps } from "antd";
import Search from "antd/es/input/Search";
import Image from "next/image";
import { useEffect, useState } from "react";

interface District {
  name: string;
  code: number;
}

interface Province {
  name: string;
  code: number;
  wards: District[];
}

interface Hospital {
  hospital_id: number;
  name: string;
  address_street: string;
  ward: string;
  district: string;
  city: string;
  slug: string;
  phone: string;
  email: string;
}

const NhaThuocPage = () => {
  const router = useRouter();
  type SearchProps = GetProps<typeof Input.Search>;
  const onSearch: SearchProps["onSearch"] = (value, _e, info) => console.log(info?.source, value);

  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [selectedProvinceCode, setSelectedProvinceCode] = useState<number | null>(null);
  const [visibleCount, setVisibleCount] = useState(5);

  const [hospitalOptions, setHospitalOptions] = useState<Hospital[]>([]);
  const [selectedHospital, setSelectedHospital] = useState<number | null>(null);

  const onRadioChange = (e: RadioChangeEvent) => {
    setSelectedHospital(e.target.value);
  };

  // Mock hospital data
  useEffect(() => {
    const mockData: Hospital[] = [
      {
        hospital_id: 1,
        name: "Bệnh viện Quân Y 175",
        address_street: "786 Nguyễn Kiệm",
        ward: "Phường 3",
        district: "Gò Vấp",
        city: "TP. HCM",
        slug: "benh-vien-quan-y-175",
        phone: "18006928",
        email: "banctxhbenhvienquany175@gmail.com",
      },
      {
        hospital_id: 2,
        name: "Bệnh viện Mắt TP.HCM",
        address_street: "280 Điện Biên Phủ",
        ward: "Phường 7",
        district: "Quận 3",
        city: "TP. HCM",
        slug: "benh-vien-mat-tphcm",
        phone: "02839326732",
        email: "info@mat-hcm.vn",
      },
      {
        hospital_id: 3,
        name: "Bệnh viện Chợ Rẫy",
        address_street: "201B Nguyễn Chí Thanh",
        ward: "Phường 12",
        district: "Quận 5",
        city: "TP. HCM",
        slug: "benh-vien-cho-ray",
        phone: "02838554137",
        email: "contact@choray.vn",
      },
    ];
    setHospitalOptions(mockData);
  }, []);

  useEffect(() => {
    fetch("https://provinces.open-api.vn/api/v2/?depth=2")
      .then((res) => res.json())
      .then((data) => {
        setProvinces(data);
      });
  }, []);

  const handleProvinceChange = (provinceCode: number) => {
    setSelectedProvinceCode(provinceCode);
    const selectedProvince = provinces.find((p) => p.code === provinceCode);
    setDistricts(selectedProvince?.wards || []);
  };

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 5);
  };

  const tabItems: TabsProps["items"] = [
    {
      key: "1",
      label: "Tìm kiếm bệnh viện",
      children: (
        <div className="flex flex-col gap-2">
          <Search placeholder="Tìm bằng tên đường và tỉnh thành" allowClear onSearch={onSearch} />
          <div className="flex items-center justify-center gap-2">
            <div className="border w-2/3 border-[#e4e8ed]"></div>
            <p className="text-center text-sm">Hoặc</p>
            <div className="border w-2/3 border-[#e4e8ed]"></div>
          </div>
          <Select
            placeholder="Chọn Tỉnh/Thành"
            onChange={handleProvinceChange}
            options={provinces.map((province) => ({ label: province.name, value: province.code }))}
          />
          <Select
            placeholder="Chọn Phường/Xã"
            disabled={!selectedProvinceCode}
            options={districts.map((ward) => ({ label: ward.name, value: ward.code }))}
          />
          <div>
            <p>Bệnh viện gợi ý</p>
            <Radio.Group
              onChange={onRadioChange}
              value={selectedHospital}
              style={{ display: "flex", flexDirection: "column", gap: 8 }}
            >
              {hospitalOptions.slice(0, visibleCount).map((hospital) => (
                <Radio key={hospital.hospital_id} value={hospital.hospital_id}>
                  <div className="flex flex-col mt-1">
                    <span className="font-semibold">{hospital.name}</span>
                    <span>
                      {hospital.address_street}, {hospital.ward}, {hospital.district},{" "}
                      {hospital.city}
                    </span>
                  </div>
                </Radio>
              ))}
              {visibleCount < hospitalOptions.length && (
                <Button type="link" onClick={handleLoadMore} style={{ padding: 0 }}>
                  Xem thêm bệnh viện
                </Button>
              )}
            </Radio.Group>
          </div>
        </div>
      ),
    },
    {
      key: "2",
      label: "Bệnh viện gần bạn",
      children: (
        <div>
          <p>Hiển thị bệnh viện gần vị trí của bạn (sắp tới có thể tích hợp GPS)</p>
        </div>
      ),
    },
  ];

  const hospitalDetail =
    hospitalOptions.find((h) => h.hospital_id === selectedHospital) || hospitalOptions[0];

  return (
    <div className="p-10">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-semibold">Hệ thống bệnh viện trên toàn quốc</h1>
          <p className="text-[#4a4f63] text-sm">
            Thời gian hoạt động: 6:00 - 23:00 hằng ngày (Thay đổi tùy theo từng bệnh viện)
          </p>
        </div>
        <div className="flex gap-5">
          <div className="bg-white w-1/3 p-5 rounded-2xl">
            <Tabs defaultActiveKey="1" items={tabItems} />
          </div>
          <div className="bg-white w-2/3 p-5 rounded-2xl">
            <h2 className="font-semibold">Bệnh viện Quân Y 175</h2>
            <div className="flex gap-5">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3918.918941142445!2d106.67808657326465!3d10.817515158438107!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x317528e2324759b7%3A0x6c91974ff86f05e3!2zQuG7h25oIHZp4buHbiBRdcOibiBZIDE3NQ!5e0!3m2!1svi!2s!4v1757917057537!5m2!1svi!2s"
                width="300"
                height="150"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
              <div className="flex flex-col gap-2">
                <p>
                  <span className="font-semibold">Địa chỉ:</span> 786 Nguyễn Kiệm, Gò Vấp, TP. HCM
                </p>
                <p className="flex items-center gap-2">
                  <span className="text-green-600 font-medium">Đang mở</span>
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-600">Đóng cửa lúc 21:00</span>
                </p>
                <p>
                  <span className="font-semibold">Điện thoại:</span>{" "}
                  <a href="tel:18006928" className="text-blue-600 hover:underline">
                    1800 6928
                  </a>
                </p>
                <p>
                  <span className="font-semibold">Email:</span>{" "}
                  <a
                    href="mailto:banctxhbenhvienquany175@gmail.com"
                    className="text-blue-600 hover:underline"
                  >
                    banctxhbenhvienquany175@gmail.com
                  </a>
                </p>
                <div className="flex gap-5 items-center">
                  <Button
                    shape="round"
                    size="large"
                    className="!bg-gradient-to-tr from-[#1250dc] to-[#306de4]"
                    onClick={() => {
                      const hospital = hospitalOptions.find(
                        (h) => h.hospital_id === (selectedHospital ?? 1),
                      );
                      if (hospital) {
                        router.push(`/booking/${hospital.slug}`);
                      }
                    }}
                  >
                    <p className="text-white text-base font-medium">Chọn bệnh viện</p>
                  </Button>
                  <Button shape="round" size="large" className="!bg-[#eaeffa]">
                    <p className="text-[#1250dc]">Gọi để tư vấn</p>
                  </Button>
                </div>
              </div>
            </div>
            <h3>Hình ảnh bệnh viện:</h3>
            <Image
              src="https://acihome.vn/uploads/15/thiet-ke-benh-vien-quan-y-175-rong-66000m2-tai-sai-gon-quy-mo-500-giuong-1.jpg"
              alt="Ảnh bệnh viện"
              width={156}
              height={88}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default NhaThuocPage;
