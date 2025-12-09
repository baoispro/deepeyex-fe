"use client";
import { Button } from "antd";
import Image from "next/image";
import { Drug } from "../../hospital/types/drug";
import Link from "next/link";
import { useLocale } from "next-intl";
import { useCart } from "@/app/shares/hooks/carts/useCart";
import { toast } from "react-toastify";
import { useTranslations } from "next-intl";

type Props = {
  data: Drug;
};

const ProductCard = ({ data }: Props) => {
  const locale = useLocale();
  const t = useTranslations("product");
  const { addToCart } = useCart();

  return (
    <div className="bg-white rounded-2xl flex flex-col relative p-4 hover:border hover:border-[#1250dc] cursor-pointer">
      {data.discount_percent > 0 && (
        <div className="bg-[linear-gradient(295deg,#CD1A0C_0%,#FF5246_98.45%)] absolute rounded-tl-xl rounded-br-xl p-1 top-0 left-0">
          <p className="text-white text-sm font-bold">-{data.discount_percent}%</p>
        </div>
      )}
      <Link
        href={`/${locale}/shop/${data.drug_id}`}
        className="pt-4 px-2 pb-2 flex flex-col h-full justify-between"
      >
        <div className="flex justify-center items-center w-full h-[140px]">
          <Image
            src={data.image || "https://via.placeholder.com/300x300?text=No+Image"}
            alt={t("productCard.imageAlt")}
            className="mb-3 object-contain w-[140px] h-[140px] rounded-lg"
            width={140}
            height={140}
          />
        </div>
        <p className="text-sm font-semibold">{data.name}</p>

        <div className="flex items-center gap-2">
          <p className="font-bold text-[#1250DC]">
            {(data.price - (data.price * data.discount_percent) / 100).toLocaleString("vi-VN")}đ
          </p>
          {data.discount_percent > 0 && (
            <p className="line-through text-sm text-[#657384]">
              {data.price.toLocaleString("vi-VN")}đ
            </p>
          )}
        </div>
      </Link>

      {/* Nút thêm giỏ hàng */}
      <Button
        className="!bg-gradient-to-tr from-[#1250dc] to-[#306de4] !text-white !font-medium !text-sm !w-full !rounded-2xl !mt-2"
        onClick={(e) => {
          e.preventDefault();
          addToCart({
            drug_id: data.drug_id,
            name: data.name,
            image: data.image || "",
            price: data.price,
            sale_price:
              data.discount_percent > 0
                ? data.price - (data.price * data.discount_percent) / 100
                : 0,
            discount_percent: data.discount_percent,
            quantity: 1,
          });
          toast.success(t("productCard.addToCartSuccess"));
        }}
      >
        {t("addToCart")}
      </Button>
    </div>
  );
};

export { ProductCard };
