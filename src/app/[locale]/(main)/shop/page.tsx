"use client";
import { ProductCard } from "@/app/modules/shop/components/ProductCard";
import { useGetAllDrugsQuery } from "@/app/modules/hospital/hooks/queries/drugs/use-get-list-drug.query";
import { Breadcrumb, Spin } from "antd";
import { HomeOutlined } from "@ant-design/icons";
import Link from "next/link";
import { useLocale } from "next-intl";

export default function ShopPage() {
  const { data: drugsResponse, isLoading, error } = useGetAllDrugsQuery();
  const locale = useLocale();

  // Xử lý loading state
  if (isLoading) {
    return (
      <div className="py-5 px-10">
        <div className="flex justify-center items-center h-64">
          <Spin />
        </div>
      </div>
    );
  }

  // Xử lý error state
  if (error) {
    return (
      <div className="py-5 px-10">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-red-500">Có lỗi xảy ra khi tải dữ liệu: {error.message}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-5 px-10">
      <Breadcrumb
        className="!pb-2"
        items={[
          {
            href: `/${locale}`,
            title: <HomeOutlined />,
          },
          {
            title: (
              <Link href={`/${locale}/shop`}>
                <span>Cửa hàng</span>
              </Link>
            ),
          },
        ]}
      />
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-6 xl:grid-cols-6 2xl:grid-cols-6 gap-3">
        {drugsResponse?.data?.map((drug) => (
          <ProductCard key={drug.drug_id} data={drug} />
        ))}
      </div>
    </div>
  );
}
