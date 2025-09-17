// pages/products/[slug].tsx
"use client";

import React from "react";
import {
  Breadcrumb,
  Row,
  Col,
  Layout,
  Typography,
  Tag,
  Rate,
  Button,
  InputNumber,
  Divider,
  Tabs,
  Image,
  Space,
} from "antd";
import type { NextPage } from "next";
import { AiOutlineCheckCircle } from "react-icons/ai";

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const ProductPage: NextPage = () => {
  const product = {
    name: "Viên sủi KUDOS Vitamin C 1000mg hương chanh giúp bổ sung Vitamin C cho cơ thể (20 viên)",
    brand: "KUDOS",
    rating: 4.5,
    reviews: 42,
    price: 107100,
    originalPrice: 126000,
    shippingInfo: "Vận chuyển đến vị trí: Vị trí của bạn",
    details: [
      { label: "Danh mục", value: "Vitamin & Khoáng chất" },
      { label: "Số đăng ký", value: "3813/2023/BKSP" },
      { label: "Đóng bao chế", value: "Viên sủi" },
      { label: "Quy cách", value: "Tuýp 20 Viên" },
    ],
    images: [
      "https://i.imgur.com/71bb67.png",
      "https://i.imgur.com/e5p46h.png",
      "https://i.imgur.com/c9mG7j.png",
      "https://i.imgur.com/k2e4f0.png",
    ],
    description:
      "Nguyên cung cấp Vitamin C chất lượng cao cho cơ thể mỗi ngày. KUDOS Vitamin C 1000mg bổ sung vitamin C cho cơ thể giúp tăng cường sức đề kháng và giảm các triệu chứng cảm cúm. Với mỗi một viên sủi Kudos Vitamin C 1000mg có vị chanh tươi, dễ uống, rất thích hợp cho trẻ trên 14 tuổi và người lớn có nhu cầu bổ sung vitamin C. Sản phẩm đạt tiêu chuẩn GMP.",
    disclaimer:
      "Thực phẩm bảo vệ sức khoẻ, không phải là thuốc, không có tác dụng thay thế thuốc chữa bệnh.",
    attentionNote:
      "*Sản phẩm đang được chú ý, có 8 người thêm vào giỏ hàng & 3 người đang xem",
  };

  return (
    <Layout className="bg-gray-100 min-h-screen">
      <Layout.Content className="p-4 md:p-8 container mx-auto">
        {/* Breadcrumb */}
        <Breadcrumb className="mb-4">
          <Breadcrumb.Item>Trang chủ</Breadcrumb.Item>
          <Breadcrumb.Item>Sản phẩm</Breadcrumb.Item>
          <Breadcrumb.Item>Vitamin C 1000mg</Breadcrumb.Item>
        </Breadcrumb>

        {/* Product Info */}
        <div className="bg-white rounded-lg shadow-sm p-4 md:p-8">
          <Row gutter={[32, 32]}>
            {/* Product Gallery */}
            <Col xs={24} md={10}>
              <div className="flex flex-col">
                <div className="mb-4">
                  <Image
                    src={product.images[0]}
                    alt="Sản phẩm chính"
                    preview={false}
                    className="rounded-lg w-full h-auto"
                  />
                </div>
                <Space size="middle" className="overflow-x-auto">
                  {product.images.map((img, index) => (
                    <div
                      key={index}
                      className="w-24 h-24 border border-gray-300 rounded-lg overflow-hidden flex-shrink-0"
                    >
                      <Image
                        src={img}
                        alt={`Sản phẩm ${index + 1}`}
                        preview={false}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  ))}
                </Space>
                <p className="text-sm text-gray-500 mt-4">
                  Mẫu mã sản phẩm có thể thay đổi theo lô hàng
                </p>
              </div>
            </Col>

            {/* Product Details */}
            <Col xs={24} md={14}>
              <div className="p-4">
                <div className="flex items-center mb-2">
                  <Title level={5} className="mr-2 mb-0">
                    {product.name}
                  </Title>
                  <Tag color="volcano">{product.brand}</Tag>
                </div>

                <div className="flex items-center mb-4">
                  <Rate allowHalf defaultValue={product.rating} disabled className="mr-2" />
                  <Text strong className="text-blue-500">
                    {product.rating}/5
                  </Text>
                  <Text type="secondary" className="ml-2">
                    ({product.reviews} đánh giá)
                  </Text>
                </div>

                <div className="flex items-center mb-4">
                  <Text delete className="text-xl mr-2">
                    {product.originalPrice.toLocaleString("vi-VN")}đ
                  </Text>
                  <Text strong className="text-3xl text-red-500">
                    {product.price.toLocaleString("vi-VN")}đ
                  </Text>
                  <Text type="secondary">/ Tuýp</Text>
                </div>

                <div className="mb-4">
                  <div className="flex items-center">
                    <AiOutlineCheckCircle className="text-green-500 mr-2" />
                    <Text type="secondary">{product.shippingInfo}</Text>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                  {product.details.map((detail, index) => (
                    <div key={index}>
                      <Text type="secondary">{detail.label}:</Text> <Tag>{detail.value}</Tag>
                    </div>
                  ))}
                </div>

                <Divider />

                <div className="flex items-center justify-between my-4">
                  <div className="flex items-center">
                    <Text type="secondary" className="mr-2">
                      Chọn số lượng:
                    </Text>
                    <InputNumber min={1} defaultValue={1} />
                  </div>
                  <div>
                    <Button type="primary" size="large" className="bg-blue-600 rounded-lg mr-2">
                      Chọn mua
                    </Button>
                    <Button size="large">Tìm nhà thuốc</Button>
                  </div>
                </div>

                <p className="text-red-500 text-sm italic">{product.attentionNote}</p>
              </div>
            </Col>
          </Row>
        </div>

        {/* Product Description */}
        <div className="mt-8 bg-white rounded-lg shadow-sm">
          <Tabs defaultActiveKey="1">
            <TabPane tab="Mô tả sản phẩm" key="1">
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-2">Viên sủi Vitamin C là gì?</h3>
                <p>{product.description}</p>
                <div className="my-4">
                  <Image
                    src="https://i.imgur.com/kK5yK6m.png"
                    alt="Mô tả sản phẩm"
                    className="rounded-lg w-full h-auto"
                    preview={false}
                  />
                </div>
              </div>
            </TabPane>
            <TabPane tab="Thành phần" key="2">
              <div className="p-4">Nội dung về thành phần sản phẩm.</div>
            </TabPane>
            <TabPane tab="Công dụng" key="3">
              <div className="p-4">Nội dung về công dụng sản phẩm.</div>
            </TabPane>
          </Tabs>

          <div className="bg-blue-100 border-l-4 border-blue-500 p-4 mt-4 text-sm italic">
            <p>{product.disclaimer}</p>
          </div>
        </div>
      </Layout.Content>
    </Layout>
  );
};

export default ProductPage;
