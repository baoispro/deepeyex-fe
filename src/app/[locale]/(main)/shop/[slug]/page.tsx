"use client";

import { useState, useEffect } from "react";
import { Button, Typography, InputNumber, message, Image, Spin, Tag, Divider } from "antd";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useCart } from "@/app/shares/hooks/carts/useCart";

const { Title, Text } = Typography;

interface Product {
  id: number;
  name: string;
  images: string[];
  description: string;
  price: number;
  sale_price?: number;
  stock: number;
  brand: string;
  category: string;
  form: string; // Dạng bào chế
  unit: string;
  origin: string;
  manufacturer: string;
  ingredient: string;
  registration_number: string;
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const t = useTranslations("product");
  const { addToCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedImage, setSelectedImage] = useState<string>("");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        // Mock Data
        const mockData: Product = {
          id: Number(params.id),
          name: "Dung dịch D3 Drops 10ml Dao Nordic Health bổ sung vitamin D3",
          images: [
            "https://cdn.nhathuoclongchau.com.vn/unsafe/768x0/filters:quality(90)/https://cms-prod.s3-sgn09.fptcloud.com/DSC_09324_db795e136a.jpg",
            "https://cdn.nhathuoclongchau.com.vn/unsafe/768x0/filters:quality(90)/https://cms-prod.s3-sgn09.fptcloud.com/DSC_09324_db795e136a.jpg",
            "https://cdn.nhathuoclongchau.com.vn/unsafe/768x0/filters:quality(90)/https://cms-prod.s3-sgn09.fptcloud.com/DSC_09324_db795e136a.jpg",
            "https://cdn.nhathuoclongchau.com.vn/unsafe/768x0/filters:quality(90)/https://cms-prod.s3-sgn09.fptcloud.com/DSC_09324_db795e136a.jpg",
          ],
          description:
            "Dung dịch bổ sung Vitamin D3, hỗ trợ phát triển xương và miễn dịch cho trẻ sơ sinh.",
          price: 270000,
          sale_price: 250000,
          stock: 12,
          brand: "DAO Nordic Health",
          category: "Tăng sức đề kháng, miễn dịch",
          form: "Dung dịch",
          unit: "Hộp",
          origin: "Đan Mạch",
          manufacturer: "Propharma A/S",
          ingredient: "Vitamin D3",
          registration_number: "7356/2023/ĐKSP",
        };

        setProduct(mockData);
        setSelectedImage(mockData.images[0]);
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [params.id]);

  const handleAddToCart = () => {
    if (!product) return;

    addToCart({
      product_id: product.id,
      name: product.name,
      image: selectedImage,
      price: product.price,
      sale_price: product.sale_price ?? 0,
      quantity,
      variant_unit: product.unit,
    });

    message.success(t("successAdd"));
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push("/cart");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <Spin size="large" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-10">
        <Text type="danger">{t("notFound")}</Text>
      </div>
    );
  }

  return (
    <div className="max-w-[1360px] mx-auto p-4 grid grid-cols-1 md:grid-cols-2 gap-8">
      <div>
        {/* Main Image */}
        <div className="flex justify-center mb-4">
          <Image
            src={selectedImage}
            alt={product.name}
            width={400}
            height={400}
            style={{ objectFit: "cover", borderRadius: 8 }}
            preview
          />
        </div>

        <div className="flex space-x-2 justify-center">
          {product.images.map((img, index) => (
            <div
              key={index}
              className={`border rounded-md cursor-pointer overflow-hidden ${
                selectedImage === img ? "border-[#03c0b4]" : "border-gray-300"
              }`}
              onClick={() => setSelectedImage(img)}
            >
              <Image
                src={img}
                alt={`Thumbnail ${index + 1}`}
                width={60}
                height={60}
                style={{ objectFit: "cover" }}
                preview={false}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <Text className="uppercase text-gray-500">{product.brand}</Text>

        <Title level={3}>{product.name}</Title>

        <Text className="text-gray-600">
          {t("registrationNumber")}: {product.registration_number}
        </Text>

        <div className="mt-2">
          {product.sale_price && product.sale_price < product.price ? (
            <>
              <Text strong style={{ fontSize: 24, color: "#03c0b4" }}>
                {product.sale_price.toLocaleString("vi-VN")}đ
              </Text>
              <Text delete style={{ marginLeft: 10, fontSize: 18, color: "#888" }}>
                {product.price.toLocaleString("vi-VN")}đ
              </Text>
              <Text className="ml-2">/ {product.unit}</Text>
            </>
          ) : (
            <Text strong style={{ fontSize: 24, color: "#03c0b4" }}>
              {product.price.toLocaleString("vi-VN")}đ / {product.unit}
            </Text>
          )}
        </div>

        <Divider className="!my-4" />

        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Text strong>{t("category")}:</Text>
            <Tag color="blue">{product.category}</Tag>
          </div>
          <div className="flex items-center space-x-2">
            <Text strong>{t("form")}:</Text>
            <Tag color="purple">{product.form}</Tag>
          </div>
          <div className="flex items-center space-x-2">
            <Text strong>{t("origin")}:</Text>
            <Tag color="green">{product.origin}</Tag>
          </div>
          <div className="flex items-center space-x-2">
            <Text strong>{t("manufacturer")}:</Text>
            <Tag color="geekblue">{product.manufacturer}</Tag>
          </div>
          <div className="flex items-center space-x-2">
            <Text strong>{t("ingredient")}:</Text>
            <Tag color="orange">{product.ingredient}</Tag>
          </div>
        </div>

        <Divider className="!my-4" />

        <div className="mt-2 flex items-center space-x-3">
          <Text strong>{t("quantity")}:</Text>
          <InputNumber
            min={1}
            max={product.stock}
            value={quantity}
            onChange={(val) => setQuantity(val || 1)}
          />
          {product.stock === 0 && (
            <Text type="danger" className="ml-2">
              {t("outOfStock")}
            </Text>
          )}
        </div>

        <div className="flex space-x-4 mt-4">
          <Button
            type="primary"
            className="!bg-[#03c0b4] !px-6"
            disabled={product.stock === 0}
            onClick={handleAddToCart}
          >
            {t("addToCart")}
          </Button>
          <Button
            type="default"
            className="!px-6"
            disabled={product.stock === 0}
            onClick={handleBuyNow}
          >
            {t("findStore")}
          </Button>
        </div>

        <Divider className="!my-4" />
        <div>
          <Title level={5}>{t("description")}</Title>
          <Text className="block text-gray-700 mt-2">{product.description}</Text>
        </div>
      </div>
    </div>
  );
}
