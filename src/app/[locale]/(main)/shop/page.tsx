"use client";
import { ProductCard } from "@/app/modules/shop/components/ProductCard";
import { useGetAllDrugsQuery } from "@/app/modules/hospital/hooks/queries/drugs/use-get-list-drug.query";
import { Spin } from "antd";
import { useTranslations } from "next-intl";

export default function ShopPage() {
  const t = useTranslations("product");
  const { data: drugsResponse, isLoading, error } = useGetAllDrugsQuery();

  // Xử lý loading state
  if (isLoading) {
    return (
      <div className="py-5 px-10">
        <div className="flex justify-center items-center h-64">
          <Spin tip={t("page.loading")} />
        </div>
      </div>
    );
  }

  // Xử lý error state
  if (error) {
    return (
      <div className="py-5 px-10">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-red-500">
            {t("page.error")} {error.message}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-5 px-10">
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-6 xl:grid-cols-6 2xl:grid-cols-6 gap-3">
        {drugsResponse?.data?.map((drug) => (
          <ProductCard key={drug.drug_id} data={drug} />
        ))}
      </div>
    </div>
  );
}
