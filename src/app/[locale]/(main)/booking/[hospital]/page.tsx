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
import { useEffect, useState } from "react";
import { FaUser, FaSearch, FaMapMarkerAlt, FaEye } from "react-icons/fa";

type Doctor = {
  id: number;
  name: string;
  specialty: string;
  position: string;
  experience: string;
  gender: string;
  avatarUrl: string;
  slug: string;
};

export default function BookingDoctorPage() {
  const router = useRouter();
  const params = useParams();
  const hospitalSlug = params.hospital;
  const { Title, Paragraph, Text } = Typography;
  const { Option } = Select;

  // Danh sách bác sĩ chuyên khoa mắt
  const mockDoctors: Doctor[] = [
    {
      id: 1,
      name: "BS. Nguyễn Văn An",
      specialty: "Nhãn khoa",
      position: "Giáo sư",
      experience: "20 năm kinh nghiệm điều trị bệnh mắt",
      gender: "Nam",
      avatarUrl: "https://via.placeholder.com/150/0000FF/FFFFFF?text=BS+An",
      slug: "bs-nguyen-van-an",
    },
    {
      id: 2,
      name: "BS. Trần Thị Bình",
      specialty: "Phẫu thuật mắt",
      position: "Tiến sĩ",
      experience: "12 năm kinh nghiệm phẫu thuật đục thủy tinh thể",
      gender: "Nữ",
      avatarUrl: "https://via.placeholder.com/150/FF0000/FFFFFF?text=BS+Binh",
      slug: "bs-tran-thi-binh",
    },
    {
      id: 3,
      name: "BS. Lê Văn Cường",
      specialty: "Tư vấn mắt & khúc xạ",
      position: "Thạc sĩ",
      experience: "10 năm kinh nghiệm khám và điều trị tật khúc xạ",
      gender: "Nam",
      avatarUrl: "https://via.placeholder.com/150/008000/FFFFFF?text=BS+Cuong",
      slug: "bs-le-van-cuong",
    },
    {
      id: 4,
      name: "BS. Phạm Thị Dung",
      specialty: "Phẫu thuật mắt",
      position: "Phó giáo sư",
      experience: "15 năm kinh nghiệm phẫu thuật giác mạc",
      gender: "Nữ",
      avatarUrl: "https://via.placeholder.com/150/800080/FFFFFF?text=BS+Dung",
      slug: "bs-pham-thi-dung",
    },
  ];

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [nameFilter, setNameFilter] = useState("");
  const [specialtyFilter, setSpecialtyFilter] = useState("");
  const [positionFilter, setPositionFilter] = useState("");
  const [genderFilter, setGenderFilter] = useState("");

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      let filteredDoctors = mockDoctors;

      if (nameFilter) {
        filteredDoctors = filteredDoctors.filter((doc) =>
          doc.name.toLowerCase().includes(nameFilter.toLowerCase()),
        );
      }

      if (specialtyFilter) {
        filteredDoctors = filteredDoctors.filter((doc) => doc.specialty === specialtyFilter);
      }

      if (positionFilter) {
        filteredDoctors = filteredDoctors.filter((doc) => doc.position === positionFilter);
      }

      if (genderFilter) {
        filteredDoctors = filteredDoctors.filter((doc) => doc.gender === genderFilter);
      }

      setDoctors(filteredDoctors);
      setLoading(false);
    }, 500);
  }, [nameFilter, specialtyFilter, positionFilter, genderFilter]);

  return (
    <section>
      <div style={{ padding: "24px" }}>
        <Title level={3} style={{ textAlign: "center" }}>
          Chọn Bác Sĩ Chuyên Khoa Mắt
        </Title>
        <Paragraph style={{ textAlign: "center" }} className="flex justify-center items-center">
          <FaMapMarkerAlt />
          <Text strong style={{ marginLeft: "8px" }}>
            Bệnh viện Mắt TP. HCM – 280 Điện Biên Phủ, Quận 3
          </Text>
        </Paragraph>

        <Row gutter={[16, 16]}>
          {/* Bộ lọc */}
          <Col xs={24} lg={6}>
            <Card title="Bộ lọc bác sĩ mắt">
              <Space direction="vertical" style={{ width: "100%" }}>
                <Input
                  placeholder="Tìm theo tên bác sĩ"
                  prefix={<FaSearch />}
                  onChange={(e) => setNameFilter(e.target.value)}
                />
                <div>
                  <Text strong>Chuyên khoa:</Text>
                  <Select
                    placeholder="Chọn chuyên khoa mắt"
                    style={{ width: "100%" }}
                    onChange={(value) => setSpecialtyFilter(value)}
                    allowClear
                  >
                    <Option value="Nhãn khoa">Nhãn khoa</Option>
                    <Option value="Phẫu thuật mắt">Phẫu thuật mắt</Option>
                    <Option value="Tư vấn mắt & khúc xạ">Tư vấn mắt & khúc xạ</Option>
                  </Select>
                </div>
                <div>
                  <Text strong>Chức vụ:</Text>
                  <Radio.Group
                    onChange={(e) => setPositionFilter(e.target.value)}
                    value={positionFilter}
                  >
                    <Radio value="">Tất cả</Radio>
                    <Radio value="Giáo sư">Giáo sư</Radio>
                    <Radio value="Phó giáo sư">Phó giáo sư</Radio>
                    <Radio value="Tiến sĩ">Tiến sĩ</Radio>
                    <Radio value="Thạc sĩ">Thạc sĩ</Radio>
                  </Radio.Group>
                </div>
                <div>
                  <Text strong>Giới tính:</Text>
                  <Radio.Group
                    onChange={(e) => setGenderFilter(e.target.value)}
                    value={genderFilter}
                  >
                    <Radio value="">Tất cả</Radio>
                    <Radio value="Nam">Nam</Radio>
                    <Radio value="Nữ">Nữ</Radio>
                  </Radio.Group>
                </div>
              </Space>
            </Card>
          </Col>

          {/* Danh sách bác sĩ */}
          <Col xs={24} lg={18}>
            <Spin spinning={loading} tip="Đang tải danh sách bác sĩ...">
              <List
                grid={{
                  gutter: 16,
                  xs: 1,
                  sm: 2,
                  md: 2,
                  lg: 3,
                  xl: 3,
                }}
                dataSource={doctors}
                locale={{ emptyText: "Không tìm thấy bác sĩ mắt nào." }}
                renderItem={(item) => (
                  <List.Item>
                    <Card
                      hoverable
                      actions={[
                        <Button
                          key={`book-appointment-${item.id}`}
                          type="primary"
                          style={{ width: "90%" }}
                          onClick={() => router.push(`${hospitalSlug}/${item.slug}/`)}
                        >
                          Đặt lịch khám
                        </Button>,
                      ]}
                    >
                      <Card.Meta
                        avatar={<Avatar size={64} src={item.avatarUrl} icon={<FaUser />} />}
                        title={
                          <Space>
                            <FaEye className="text-blue-500" />
                            {item.name}
                          </Space>
                        }
                        description={
                          <Space direction="vertical">
                            <Tag color="blue">{item.specialty}</Tag>
                            <Paragraph style={{ margin: 0 }}>
                              <Text strong>Chức vụ:</Text> {item.position}
                            </Paragraph>
                            <Paragraph style={{ margin: 0 }}>
                              <Text strong>Kinh nghiệm:</Text> {item.experience}
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
