import { ProductCard } from "@/app/modules/shop/components/ProductCard";
import { Product } from "@/app/modules/shop/types/product";

export default function ShopPage() {
  const mockProducts: Product[] = [
    {
      product_id: 1,
      name: "Paracetamol 500mg",
      brand: "DHG Pharma",
      specification: "Hộp 10 vỉ x 10 viên",
      country: "Vietnam",
      short_description: "Thuốc giảm đau, hạ sốt",
      manufacturer: "DHG Pharma",
      registration_number: "VN-12345-67",
      description_html: "<p>Paracetamol là thuốc giảm đau, hạ sốt thông dụng...</p>",
      slug: "paracetamol-500mg",
      image_url:
        "https://cdn.nhathuoclongchau.com.vn/unsafe/768x0/filters:quality(90)/https://cms-prod.s3-sgn09.fptcloud.com/00022530_paracetamol_500mg_quang_binh_10x10_9179_60ee_large_faab5afd12.jpg",
      discount_percentage: 10,
      category: {
        category_id: 1,
        name: "Giảm đau - Hạ sốt",
        slug: "giam-dau-ha-sot",
        image: null,
      },
      variants: [
        { unit: "Hộp", price: 30000 },
        { unit: "Vỉ", price: 3500 },
      ],
    },
    {
      product_id: 2,
      name: "Vitamin C 1000mg",
      brand: "OPC Pharma",
      specification: "Hộp 10 viên sủi",
      country: "Vietnam",
      short_description: "Tăng sức đề kháng",
      manufacturer: "OPC Pharma",
      registration_number: "VN-98765-43",
      description_html: "<p>Vitamin C giúp tăng cường hệ miễn dịch...</p>",
      slug: "vitamin-c-1000mg",
      image_url:
        "https://cdn.nhathuoclongchau.com.vn/unsafe/768x0/filters:quality(90)/https://cms-prod.s3-sgn09.fptcloud.com/DSC_09324_db795e136a.jpg",
      discount_percentage: 0,
      category: {
        category_id: 2,
        name: "Vitamin - Khoáng chất",
        slug: "vitamin-khoang-chat",
        image: null,
      },
      variants: [{ unit: "Hộp", price: 50000 }],
    },
    {
      product_id: 3,
      name: "Amoxicillin 500mg",
      brand: "Mekophar",
      specification: "Hộp 10 vỉ x 10 viên",
      country: "Vietnam",
      short_description: "Kháng sinh phổ rộng",
      manufacturer: "Mekophar",
      registration_number: "VN-24680-12",
      description_html: "<p>Amoxicillin thuộc nhóm kháng sinh beta-lactam...</p>",
      slug: "amoxicillin-500mg",
      image_url:
        "https://cdn.nhathuoclongchau.com.vn/unsafe/768x0/filters:quality(90)/https://cms-prod.s3-sgn09.fptcloud.com/IMG_1604_5cee949270.jpg",
      discount_percentage: 15,
      category: {
        category_id: 3,
        name: "Kháng sinh",
        slug: "khang-sinh",
        image: null,
      },
      variants: [
        { unit: "Hộp", price: 60000 },
        { unit: "Vỉ", price: 7000 },
      ],
    },
  ];
  return (
    <div className="py-5 px-10">
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-6 xl:grid-cols-6 2xl:grid-cols-6 gap-3">
        {mockProducts?.map((product) => (
          <ProductCard key={product.product_id} data={product} />
        ))}
      </div>
    </div>
  );
}
