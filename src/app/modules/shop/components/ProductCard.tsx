"use client";
import { Button } from "antd";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Product } from "../types/product";
// import { useCart } from "../hook/useCart";
// import { productApi } from "../lib/apis/product";
// import { RootState } from "../lib/store";

type Props = {
  data: Product;
};

const ProductCard = ({ data }: Props) => {
  // const user = useSelector((state: RootState) => state.auth.user);

  // const { addToCart } = useCart(user?.id.toString());

  const [active, setActive] = useState(data.variants[0]);
  useEffect(() => {
    setActive(data.variants[0]);
  }, [data]);

  // const router = useRouter();
  // async function navigateToDetailProduct(id: number, slugLV3: string, slugProduct: string) {
  //   const categories = await productApi.getCategoryRelated(id);
  //   const levelMap = categories.data.map((item: { parent: { parent: Category } }) => {
  //     let level = 1;
  //     if (item.parent) {
  //       level = 2;
  //       if (item.parent.parent) {
  //         level = 3;
  //       }
  //     }
  //     return {
  //       ...item,
  //       level,
  //     };
  //   });
  //   const lv1 = levelMap.find((c: { level: number }) => c.level === 1);
  //   const lv2 = levelMap.find((c: { level: number }) => c.level === 2);
  //   router.push(`${lv1.slug}/${lv2.slug}/${slugLV3}/${slugProduct}`);
  // }
  return (
    <div className="bg-white rounded-2xl flex flex-col relative p-4 hover:border hover:border-[#1250dc] cursor-pointer">
      {data.discount_percentage > 0 && (
        <div className="bg-[linear-gradient(295deg,#CD1A0C_0%,#FF5246_98.45%)] absolute rounded-tl-xl rounded-br-xl p-1 top-0 left-0">
          <p className="text-white text-sm font-bold">-{data.discount_percentage}%</p>
        </div>
      )}
      <div className="pt-4 px-2 pb-2 flex flex-col gap-1 h-full justify-between">
        <div
          className="flex justify-center items-center"
          // onClick={() =>
          //   navigateToDetailProduct(data.category.category_id, data.category.slug, data.slug)
          // }
        >
          <Image
            src={data.image_url?.split(",")[0]?.trim()}
            alt="hình ảnh sản phẩm"
            className="mb-3"
            width={140}
            height={140}
          />
        </div>
        <p
          className="line-clamp-3 text-sm font-semibold"
          // onClick={() =>
          //   navigateToDetailProduct(data.category.category_id, data.category.slug, data.slug)
          // }
        >
          {data.name}
        </p>
        {data.variants && data.variants.length > 1 && (
          <div className="flex w-full bg-[#f6f7f9] rounded-xl text-sm text-[#4a4f63]">
            {data.variants && data.variants.length > 1 && (
              <div className="flex w-full bg-[#f6f7f9] rounded-xl text-sm text-[#4a4f63]">
                {data.variants.map((variant, index) => (
                  <div
                    key={index}
                    onClick={() => setActive(variant)}
                    className={`flex-1 text-center p-1 rounded-xl cursor-pointer transition-all duration-100 ${
                      variant === active
                        ? "bg-white text-[#1250DC] border border-[#1250DC]"
                        : "hover:bg-[#eaeffa] hover:text-[#1250DC]"
                    }`}
                  >
                    <p>{variant.unit}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        <p className="font-bold text-[#1250DC]">
          {(active.price - (active.price * data.discount_percentage) / 100).toLocaleString("vi-VN")}
          đ/ {active.unit}
        </p>
        {data.discount_percentage > 0 && (
          <p className="line-through text-sm text-[#657384]">
            {active.price.toLocaleString("vi-VN")}đ
          </p>
        )}
        <div className="text-sm text-[#4a4f63] inline-flex w-auto">
          <p className="bg-[#f6f7f9] p-2 rounded-xl text-center">{active.unit}</p>
        </div>
        <Button
          className="!bg-gradient-to-tr from-[#1250dc] to-[#306de4] !text-white !font-medium !text-sm !w-full !rounded-2xl !mt-2"
          // onClick={() => {
          //   addToCart({
          //     product_id: data.product_id,
          //     name: data.name,
          //     image: data.image_url?.split(",")[0]?.trim(),
          //     variant_unit: active.unit,
          //     sale_price: active.price - (active.price * data.discount_percentage) / 100,
          //     price: active.price,
          //     discount_percentage: data.discount_percentage,
          //     slug: data.slug,
          //   });
          //   toast.success("Thêm vào giỏ hàng thành công");
          // }}
        >
          Chọn mua
        </Button>
      </div>
    </div>
  );
};

export { ProductCard };
