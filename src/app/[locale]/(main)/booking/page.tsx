"use client";

import { useGetHospitalsbyWardAndCityQuery } from "@/app/modules/hospital/hooks/queries/hospitals/use-get-hospitals-by-ward-and-city.query";
import { useGetAllCitiesQuery } from "@/app/modules/hospital/hooks/queries/hospitals/use-get-list-cities.query";
import { useGetAllHospitalsQuery } from "@/app/modules/hospital/hooks/queries/hospitals/use-get-list-hospital.query";
import { useGetWardsbyCityQuery } from "@/app/modules/hospital/hooks/queries/hospitals/use-get-list-wards-by-city.query";
import { useRouter } from "@/app/shares/locales/navigation";
import {
  Button,
  GetProps,
  Input,
  Radio,
  RadioChangeEvent,
  Select,
  Skeleton,
  Tabs,
  TabsProps,
} from "antd";
import Search from "antd/es/input/Search";
import Image from "next/image";
import { useEffect, useState } from "react";
import type { Hospital } from "@/app/modules/hospital/types/hospital";
import { useGetHospitalbyAddressQuery } from "@/app/modules/hospital/hooks/queries/hospitals/use-get-hospital-by address.query";
import { useFindHospitalByNearbyMutation } from "@/app/modules/hospital/hooks/mutations/hospitals/use-find-nearby.mutation";
import BookingTypeModal from "@/app/modules/hospital/components/BookingTypeModal";
import FollowUpBooking from "@/app/modules/hospital/components/FollowUpBooking";
import { useTranslations } from "next-intl";

const NhaThuocPage = () => {
  const router = useRouter();
  const t = useTranslations("booking");
  type SearchProps = GetProps<typeof Input.Search>;
  const onSearch: SearchProps["onSearch"] = (value) => setSearchKeyword(value);

  const [visibleCount, setVisibleCount] = useState(5);
  const [selectedHospital, setSelectedHospital] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<string | undefined>();
  const [selectedWard, setSelectedWard] = useState<string | undefined>();
  const [searchKeyword, setSearchKeyword] = useState<string>("");
  const [nearbyHospitals, setNearbyHospitals] = useState<Hospital[]>([]);
  const [findingNearby, setFindingNearby] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [bookingType, setBookingType] = useState<"new" | "reexam" | null>(null); // 🟩 Thêm trạng thái loại đặt lịch

  const onRadioChange = (e: RadioChangeEvent) => setSelectedHospital(e.target.value);

  // Queries
  const { data: hospitalData, isLoading } = useGetAllHospitalsQuery();
  const { data: citiesData } = useGetAllCitiesQuery();
  const { data: wardsData } = useGetWardsbyCityQuery(selectedCity ?? "", {
    enabled: !!selectedCity,
  });
  const { data: hospitalsByAddress } = useGetHospitalbyAddressQuery(searchKeyword, {
    enabled: !!searchKeyword,
  });
  const { data: hospitalsByCityAndWard } = useGetHospitalsbyWardAndCityQuery(
    selectedCity,
    selectedWard,
    { enabled: !!selectedCity || !!selectedWard },
  );

  const findNearbyMutation = useFindHospitalByNearbyMutation({
    onSuccess: (res) => {
      setNearbyHospitals(res.data || []);
      setFindingNearby(false);
    },
    onError: () => setFindingNearby(false),
  });

  const handleFindNearby = () => {
    if (!navigator.geolocation) {
      alert(t("page.nearby.noLocationSupport"));
      return;
    }

    setFindingNearby(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        findNearbyMutation.mutate({ lat: latitude, lng: longitude, radiusKm: 5 });
      },
      () => {
        alert(t("page.nearby.locationError"));
        setFindingNearby(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  };

  // Filter logic
  let filteredHospitals: Hospital[] = [];
  if (searchKeyword && hospitalsByAddress?.data) {
    filteredHospitals = hospitalsByAddress.data;
  } else if ((selectedCity || selectedWard) && hospitalsByCityAndWard?.data) {
    filteredHospitals = hospitalsByCityAndWard.data;
  } else {
    filteredHospitals = hospitalData?.data || [];
  }

  const handleLoadMore = () => setVisibleCount((prev) => prev + 5);

  const tabItems: TabsProps["items"] = [
    {
      key: "1",
      label: t("page.tabs.search"),
      children: (
        <div className="flex flex-col gap-2">
          <Search placeholder={t("page.search.placeholder")} allowClear onSearch={onSearch} />
          <div className="flex items-center justify-center gap-2">
            <div className="border w-2/3 border-[#e4e8ed]"></div>
            <p className="text-center text-sm">{t("page.search.or")}</p>
            <div className="border w-2/3 border-[#e4e8ed]"></div>
          </div>
          <Select
            placeholder={t("page.search.selectCity")}
            onChange={(value) => {
              setSelectedCity(value);
              setSelectedWard(undefined);
            }}
            options={citiesData?.data?.map((city: string) => ({
              label: city,
              value: city,
            }))}
          />
          <Select
            placeholder={t("page.search.selectWard")}
            disabled={!selectedCity}
            onChange={(value) => setSelectedWard(value)}
            options={wardsData?.data?.map((ward: string) => ({
              label: ward,
              value: ward,
            }))}
          />
          <div>
            <p>{t("page.search.suggestions")}</p>
            <Skeleton active loading={isLoading}>
              <Radio.Group
                onChange={onRadioChange}
                value={selectedHospital}
                style={{ display: "flex", flexDirection: "column", gap: 8 }}
              >
                {filteredHospitals.slice(0, visibleCount).map((hospital) => (
                  <Radio key={hospital.hospital_id} value={hospital.hospital_id}>
                    <div className="flex flex-col mt-1">
                      <span className="font-semibold">{hospital.name}</span>
                      <span>
                        {hospital.address}, {hospital.ward}, {hospital.city}
                      </span>
                    </div>
                  </Radio>
                ))}
                {visibleCount < filteredHospitals.length && (
                  <Button type="link" onClick={handleLoadMore} style={{ padding: 0 }}>
                    {t("page.search.loadMore")}
                  </Button>
                )}
              </Radio.Group>
            </Skeleton>
          </div>
        </div>
      ),
    },
    {
      key: "2",
      label: t("page.tabs.nearby"),
      children: (
        <div className="flex flex-col gap-2">
          <Button type="primary" onClick={handleFindNearby} loading={findingNearby}>
            {t("page.nearby.findButton")}
          </Button>

          <div>
            {nearbyHospitals.length === 0 && !findingNearby && <p>{t("page.nearby.noResults")}</p>}
            {nearbyHospitals.length > 0 && (
              <Radio.Group
                onChange={onRadioChange}
                value={selectedHospital}
                style={{ display: "flex", flexDirection: "column", gap: 8 }}
              >
                {nearbyHospitals.map((hospital) => (
                  <Radio key={hospital.hospital_id} value={hospital.hospital_id}>
                    <div className="flex flex-col mt-1">
                      <span className="font-semibold">{hospital.name}</span>
                      <span>
                        {hospital.address}, {hospital.ward}, {hospital.city}
                      </span>
                    </div>
                  </Radio>
                ))}
              </Radio.Group>
            )}
          </div>
        </div>
      ),
    },
  ];

  const hospitalDetail =
    filteredHospitals.find((h) => h.hospital_id === selectedHospital) || filteredHospitals[0];

  useEffect(() => {
    setIsModalOpen(true);
    setBookingType(null);
  }, []);

  return (
    <div className="p-10">
      {/* Modal chọn loại lịch */}
      <BookingTypeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelect={(type) => {
          setBookingType(type);
          setIsModalOpen(false);
        }}
      />

      {/* Giao diện đặt khám mới */}
      {bookingType === "new" && (
        <div className="flex flex-col gap-4 animate-fadeIn">
          <div className="flex flex-col gap-1">
            <h1 className="text-xl font-semibold">{t("page.title")}</h1>
            <p className="text-[#4a4f63] text-sm">{t("page.workingHours")}</p>
          </div>

          <div className="flex gap-5">
            <div className="bg-white w-1/3 p-5 rounded-2xl">
              <Tabs defaultActiveKey="1" items={tabItems} />
            </div>

            <div className="bg-white w-2/3 p-5 rounded-2xl">
              {hospitalDetail ? (
                <>
                  <h2 className="font-semibold">{hospitalDetail.name}</h2>
                  <div className="flex gap-5">
                    <iframe
                      src={hospitalDetail.url_map}
                      width="300"
                      height="150"
                      style={{ border: 0 }}
                      allowFullScreen={true}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                    <div className="flex flex-col gap-2">
                      <p>
                        <span className="font-semibold">{t("page.hospitalDetail.address")}</span>{" "}
                        {hospitalDetail.address}, {hospitalDetail.ward}, {hospitalDetail.city}
                      </p>
                      <p>
                        <span className="font-semibold">{t("page.hospitalDetail.phone")}</span>{" "}
                        <a
                          href={`tel:${hospitalDetail.phone}`}
                          className="text-blue-600 hover:underline"
                        >
                          {hospitalDetail.phone}
                        </a>
                      </p>
                      <p>
                        <span className="font-semibold">{t("page.hospitalDetail.email")}</span>{" "}
                        <a
                          href={`mailto:${hospitalDetail.email}`}
                          className="text-blue-600 hover:underline"
                        >
                          {hospitalDetail.email}
                        </a>
                      </p>
                      <div className="flex gap-5 items-center">
                        <Button
                          shape="round"
                          size="large"
                          className="!bg-gradient-to-tr from-[#1250dc] to-[#306de4]"
                          onClick={() => {
                            if (hospitalDetail) {
                              localStorage.setItem("hospital_id", hospitalDetail.hospital_id);
                              localStorage.setItem("hospital_name", hospitalDetail.name);
                              router.push(`/booking/${hospitalDetail.slug}`);
                            }
                          }}
                        >
                          <p className="text-white text-base font-medium">
                            {t("page.hospitalDetail.selectButton")}
                          </p>
                        </Button>
                        <Button shape="round" size="large" className="!bg-[#eaeffa]">
                          <p className="text-[#1250dc]">{t("page.hospitalDetail.callButton")}</p>
                        </Button>
                      </div>
                    </div>
                  </div>
                  {hospitalDetail.image && (
                    <>
                      <h3>{t("page.hospitalDetail.images")}</h3>
                      <Image
                        src={hospitalDetail.image}
                        alt="Ảnh bệnh viện"
                        width={156}
                        height={88}
                      />
                    </>
                  )}
                </>
              ) : (
                <p>{t("page.hospitalDetail.selectHospital")}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Giao diện tái khám */}
      {bookingType === "reexam" && <FollowUpBooking />}
    </div>
  );
};

export default NhaThuocPage;
