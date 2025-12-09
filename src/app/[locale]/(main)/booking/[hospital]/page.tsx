"use client";

import { useRouter } from "@/app/shares/locales/navigation";
import {
  Avatar,
  Button,
  Card,
  Col,
  Input,
  List,
  Radio,
  Row,
  Select,
  Space,
  Spin,
  Tag,
  Typography,
} from "antd";
import { useParams } from "next/navigation";
import { useState } from "react";
import { FaUser, FaSearch, FaMapMarkerAlt, FaEye } from "react-icons/fa";
import { useGetHospitalbySlugQuery } from "@/app/modules/hospital/hooks/queries/hospitals/use-get-hospital-by-slug.query";
import { Doctor } from "@/app/modules/hospital/types/doctor";
import { useTranslations } from "next-intl";
import { Specialty } from "@/app/modules/hospital/enums/specialty";

export default function BookingDoctorPage() {
  const router = useRouter();
  const params = useParams();
  const hospitalSlug = params.hospital as string;
  const t = useTranslations("booking");
  const { Title, Paragraph, Text } = Typography;
  const { Option } = Select;

  // Gọi API hospital + doctors
  const { data, isLoading } = useGetHospitalbySlugQuery(hospitalSlug, {
    enabled: !!hospitalSlug,
  });

  const hospital = data?.data;
  const doctors: Doctor[] = hospital?.Doctors || [];

  // Danh sách các specialty hợp lệ (loại bỏ receptionist)
  const validSpecialties = Object.values(Specialty);

  // State lọc
  const [nameFilter, setNameFilter] = useState("");
  const [specialtyFilter, setSpecialtyFilter] = useState<Specialty | "">("");
  const [genderFilter, setGenderFilter] = useState("");

  // Lọc theo input
  const filteredDoctors = doctors.filter((doc) => {
    // Loại bỏ receptionist - chỉ lấy doctor có specialty hợp lệ
    if (!validSpecialties.includes(doc.specialty as Specialty)) {
      return false;
    }

    let match = true;

    // Lọc theo tên
    if (nameFilter && !doc.full_name.toLowerCase().includes(nameFilter.toLowerCase())) {
      match = false;
    }

    // Lọc theo specialty (so sánh với giá trị enum)
    if (specialtyFilter && doc.specialty !== specialtyFilter) {
      match = false;
    }

    // Lọc theo giới tính (tạm thời bỏ qua vì backend chưa có)
    if (genderFilter && doc.image !== "" && genderFilter) {
      // giả sử backend sau có giới tính thì check, còn giờ bỏ qua
    }

    return match;
  });

  return (
    <section>
      <div style={{ padding: "24px" }}>
        <Title level={3} style={{ textAlign: "center" }}>
          {t("doctorPage.title")} {hospital?.name}
        </Title>
        <Paragraph style={{ textAlign: "center" }} className="flex justify-center items-center">
          <FaMapMarkerAlt />
          <Text strong style={{ marginLeft: "8px" }}>
            {hospital?.address}, {hospital?.ward}, {hospital?.city}
          </Text>
        </Paragraph>

        <Row gutter={[16, 16]}>
          {/* Bộ lọc */}
          <Col xs={24} lg={6}>
            <Card title={t("doctorPage.filter.title")}>
              <Space direction="vertical" style={{ width: "100%" }}>
                <Input
                  placeholder={t("doctorPage.filter.searchPlaceholder")}
                  prefix={<FaSearch />}
                  onChange={(e) => setNameFilter(e.target.value)}
                />
                <div>
                  <Text strong>{t("doctorPage.filter.specialty")}</Text>
                  <Select
                    placeholder={t("doctorPage.filter.selectSpecialty")}
                    style={{ width: "100%" }}
                    value={specialtyFilter || undefined}
                    onChange={(value) => setSpecialtyFilter(value as Specialty | "")}
                    allowClear
                    onClear={() => setSpecialtyFilter("")}
                  >
                    <Option value={Specialty.SpecialtyOphthalmology}>
                      {t("doctorPage.specialties.NHAN_KHOA")}
                    </Option>
                    <Option value={Specialty.SpecialtyInternalMedicine}>
                      {t("doctorPage.specialties.PHAU_THUAT")}
                    </Option>
                    <Option value={Specialty.SpecialtyNeurology}>
                      {t("doctorPage.specialties.KHUC_XA")}
                    </Option>
                  </Select>
                </div>
                <div>
                  <Text strong>{t("doctorPage.filter.gender")}</Text>
                  <Radio.Group
                    onChange={(e) => setGenderFilter(e.target.value)}
                    value={genderFilter}
                  >
                    <Radio value="">{t("doctorPage.filter.genderAll")}</Radio>
                    <Radio value="Nam">{t("doctorPage.filter.genderMale")}</Radio>
                    <Radio value="Nữ">{t("doctorPage.filter.genderFemale")}</Radio>
                  </Radio.Group>
                </div>
              </Space>
            </Card>
          </Col>

          {/* Danh sách bác sĩ */}
          <Col xs={24} lg={18}>
            <Spin spinning={isLoading} tip={t("doctorPage.loading")}>
              <List
                grid={{
                  gutter: 16,
                  xs: 1,
                  sm: 2,
                  md: 2,
                  lg: 3,
                  xl: 3,
                }}
                dataSource={filteredDoctors}
                locale={{ emptyText: t("doctorPage.emptyText") }}
                renderItem={(item) => (
                  <List.Item>
                    <Card
                      hoverable
                      actions={[
                        <Button
                          key={`book-appointment-${item.doctor_id}`}
                          type="primary"
                          style={{ width: "90%" }}
                          onClick={() => {
                            localStorage.setItem("doctor_id", item.doctor_id);
                            localStorage.setItem("doctor_name", item.full_name);
                            router.push(`${hospitalSlug}/${item.slug}`);
                          }}
                        >
                          {t("doctorPage.bookButton")}
                        </Button>,
                      ]}
                    >
                      <Card.Meta
                        avatar={<Avatar size={64} src={item.image} icon={<FaUser />} />}
                        title={
                          <Space>
                            <FaEye className="text-blue-500" />
                            {item.full_name}
                          </Space>
                        }
                        description={
                          <Space direction="vertical">
                            <Tag color="blue">
                              {item.specialty === Specialty.SpecialtyOphthalmology
                                ? t("doctorPage.specialties.NHAN_KHOA")
                                : item.specialty}
                            </Tag>
                            <Paragraph style={{ margin: 0 }}>
                              <Text strong>{t("doctorPage.phone")}</Text> {item.phone}
                            </Paragraph>
                            <Paragraph style={{ margin: 0 }}>
                              <Text strong>{t("doctorPage.email")}</Text> {item.email}
                            </Paragraph>
                          </Space>
                        }
                      />
                    </Card>
                  </List.Item>
                )}
              />
            </Spin>
          </Col>
        </Row>
      </div>
    </section>
  );
}
