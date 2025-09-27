"use client";

import React, { useState } from "react";
import {
  Card,
  Row,
  Col,
  Button,
  Space,
  Steps,
  Typography,
  Input,
  Radio,
  Avatar,
  Select,
  Spin,
  Breadcrumb,
  Calendar,
  Form,
} from "antd";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import { useParams } from "next/navigation";
import { Link, useRouter } from "@/app/shares/locales/navigation";
import { Doctor } from "@/app/modules/hospital/types/doctor";
import { useGetDoctorBySlugQuery } from "@/app/modules/hospital/hooks/queries/doctors/use-get-doctor-by slug.query";
import { useSelector } from "react-redux";
import { RootState } from "@/app/shares/stores";
import { HomeOutlined } from "@ant-design/icons";
import { useGetTimeSlotsByDoctorAndMonthQuery } from "@/app/modules/hospital/hooks/queries/timeslots/use-get-time-slots-by-doctor-and-month.query";
import { useGetTimeSlotsByDoctorAndDateQuery } from "@/app/modules/hospital/hooks/queries/timeslots/use-get-time-slots-by-doctor-and-date.query";
import { s } from "framer-motion/client";

interface PatientFormValues {
  patientType: "Bản thân" | "Người khác";
  fullName: string;
  phoneNumber: string;
  email: string;
  dob: string;
  gender: "male" | "female" | "";
  address: string;
}

const { Title, Paragraph, Text } = Typography;
const { Step } = Steps;

// ---------------- DỊCH VỤ CHUYÊN KHOA ----------------
const specialtyServices: Record<string, { name: string; price: number }[]> = {
  ophthalmology: [
    { name: "Khám mắt", price: 100000 },
    { name: "Phẫu thuật laser", price: 2500000 },
  ],
  internal_medicine: [
    { name: "Khám tổng quát", price: 80000 },
    { name: "Điện tâm đồ", price: 120000 },
  ],
  neurology: [
    { name: "Điện não đồ", price: 150000 },
    { name: "Chụp MRI não", price: 3000000 },
  ],
  endocrinology: [
    { name: "Khám tiểu đường", price: 110000 },
    { name: "Xét nghiệm hormone", price: 140000 },
  ],
  pediatrics: [
    { name: "Khám nhi", price: 90000 },
    { name: "Tiêm chủng", price: 70000 },
  ],
};

// ---------------- BƯỚC 1: CHỌN DỊCH VỤ ----------------
const SelectSpecialtyStep = ({ doctor, onNext }: { doctor: Doctor; onNext: () => void }) => {
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const specialty = doctor.specialty;
  const services = specialtyServices[specialty] || [];
  const baseFee = 0;

  const total = services.find((s) => s.name === selectedService)?.price || baseFee;

  const handleNext = () => {
    if (!selectedService) return;
    // Lưu service đã chọn vào localStorage
    localStorage.setItem(
      "bookingService",
      JSON.stringify(services.find((s) => s.name === selectedService)),
    );
    onNext();
  };

  return (
    <Card>
      <Title level={4}>Thông tin đặt khám</Title>
      <Paragraph>
        <Text strong>Chuyên khoa:</Text> {specialty}
      </Paragraph>

      <div style={{ marginBottom: "24px" }}>
        <Paragraph>
          <Text strong>Dịch vụ</Text>
        </Paragraph>
        <Radio.Group
          onChange={(e) => setSelectedService(e.target.value)}
          value={selectedService}
          style={{ width: "100%" }}
        >
          <Space direction="vertical" style={{ width: "100%" }}>
            {services.map((service) => (
              <div
                key={service.name}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Radio value={service.name}>{service.name}</Radio>
                <Text>{service.price.toLocaleString()} ₫</Text>
              </div>
            ))}
          </Space>
        </Radio.Group>
      </div>

      <Button type="primary" size="large" style={{ width: "100%", marginBottom: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between" }} className="gap-1">
          <Text style={{ color: "#fff" }}>Tổng cộng:</Text>
          <Text style={{ color: "#fff" }}>{total.toLocaleString()} ₫</Text>
        </div>
      </Button>

      <Row justify="end">
        <Col>
          <Button
            type="primary"
            onClick={handleNext}
            disabled={!selectedService} // 🔒 Không chọn thì disable
          >
            Chọn ngày & giờ <FaChevronRight />
          </Button>
        </Col>
      </Row>
    </Card>
  );
};

// ---------------- BƯỚC 2: CHỌN NGÀY GIỜ ----------------
const SelectDateTimeStep = ({
  doctor,
  onNext,
  onBack,
}: {
  doctor: Doctor;
  onNext: () => void;
  onBack: () => void;
}) => {
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  // ---- Lấy slot theo tháng để disable ngày ----
  const { data: monthData } = useGetTimeSlotsByDoctorAndMonthQuery(
    doctor.doctor_id,
    dayjs().format("YYYY-MM"), // tháng hiện tại
    { enabled: !!doctor.doctor_id },
  );

  // Lấy tất cả ngày có slot trong tháng (convert sang string để so sánh)
  const availableDays =
    monthData?.data?.map((slot) => dayjs(slot.start_time).format("YYYY-MM-DD")) || [];

  // ---- Lấy slot theo ngày khi chọn ----
  const { data: dayData, isLoading: isDayLoading } = useGetTimeSlotsByDoctorAndDateQuery(
    doctor.doctor_id,
    selectedDate ? selectedDate.format("YYYY-MM-DD") : "",
    { enabled: !!selectedDate && !!doctor.doctor_id },
  );

  const timeSlots =
    dayData?.data?.map((slot) => {
      const start = dayjs(slot.start_time).format("HH:mm");
      const end = dayjs(slot.end_time).format("HH:mm");
      return `${start} - ${end}`;
    }) || [];

  const handleSelectDate = (date: Dayjs) => {
    setSelectedDate(date);
    setSelectedSlot(null);
  };

  const handleNext = () => {
    if (!selectedDate || !selectedSlot) return;

    const slotData = dayData?.data?.find((s) => {
      const start = dayjs(s.start_time).format("HH:mm");
      const end = dayjs(s.end_time).format("HH:mm");
      return `${start} - ${end}` === selectedSlot;
    });

    if (slotData) {
      localStorage.setItem(
        "bookingSlot",
        JSON.stringify({
          slot_id: slotData.id,
          start_time: slotData.start_time,
          end_time: slotData.end_time,
        }),
      );
    }

    onNext();
  };

  return (
    <Card>
      <Title level={4}>Thông tin đặt khám</Title>

      <div>
        <div>
          <Title level={5}>Chọn ngày</Title>
          <Calendar
            fullscreen={true}
            onSelect={handleSelectDate}
            disabledDate={(current) => {
              const today = dayjs().startOf("day");
              const isPast = current && current < today;

              const isAvailable = current && availableDays.includes(current.format("YYYY-MM-DD"));

              return isPast || !isAvailable; // disable ngày quá khứ + ngày không có lịch
            }}
          />
        </div>

        <div>
          <Title level={5}>Chọn giờ</Title>
          {selectedDate ? (
            isDayLoading ? (
              <Spin tip="Đang tải lịch..." fullscreen />
            ) : timeSlots.length > 0 ? (
              <Radio.Group
                onChange={(e) => setSelectedSlot(e.target.value)}
                value={selectedSlot}
                style={{ width: "100%" }}
              >
                <Row gutter={[8, 8]}>
                  {timeSlots.map((slot) => {
                    const slotTime = dayjs(`${selectedDate.format("YYYY-MM-DD")} ${slot}`);
                    const isPast = slotTime.isBefore(dayjs());

                    return (
                      <Col key={slot} xs={12}>
                        <Radio.Button value={slot} disabled={isPast} style={{ width: "100%" }}>
                          {slot}
                        </Radio.Button>
                      </Col>
                    );
                  })}
                </Row>
              </Radio.Group>
            ) : (
              <Text type="danger">Không có lịch cho ngày này</Text>
            )
          ) : (
            <Text>Vui lòng chọn ngày trước</Text>
          )}
        </div>
      </div>

      <Row justify="space-between" style={{ marginTop: "24px" }}>
        <Col>
          <Button onClick={onBack}>
            <FaChevronLeft /> Quay lại
          </Button>
        </Col>
        <Col>
          <Button type="primary" onClick={handleNext} disabled={!selectedDate || !selectedSlot}>
            Thêm thông tin bệnh nhân <FaChevronRight />
          </Button>
        </Col>
      </Row>
    </Card>
  );
};

// ---------------- BƯỚC 3: THÔNG TIN BỆNH NHÂN ----------------
const BasicInfoStep = ({ onBack }: { onBack: () => void }) => {
  const patient = useSelector((state: RootState) => state.auth.patient);
  const [form] = Form.useForm();
  const router = useRouter();

  const handleFinish = (values: PatientFormValues) => {
    localStorage.setItem("bookingPatient", JSON.stringify(values));
    localStorage.setItem("type", "booking");
    router.push("/payment");
  };

  return (
    <Card>
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          patientType: "Bản thân",
          fullName: patient?.fullName || "",
          phoneNumber: patient?.phone || "",
          email: patient?.email || "",
          dob: patient?.dob ? patient.dob.split("T")[0] : "",
          gender: patient?.gender || "",
          address: patient?.address || "",
        }}
        onValuesChange={(changed) => {
          if (changed.patientType === "Người khác") {
            form.setFieldsValue({
              fullName: "",
              phoneNumber: "",
              email: "",
              dob: "",
              gender: "",
              address: "",
            });
          } else if (changed.patientType === "Bản thân") {
            form.setFieldsValue({
              fullName: patient?.fullName || "",
              phoneNumber: patient?.phone || "",
              email: patient?.email || "",
              dob: patient?.dob ? patient.dob.split("T")[0] : "",
              gender: patient?.gender || "",
              address: patient?.address || "",
            });
          }
        }}
        onFinish={handleFinish}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Form.Item label="Chọn bệnh nhân" name="patientType">
              <Select>
                <Select.Option value="Bản thân">Bản thân</Select.Option>
                <Select.Option value="Người khác">Người khác</Select.Option>
              </Select>
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              label="Họ và tên"
              name="fullName"
              rules={[{ required: true, message: "Vui lòng nhập họ và tên" }]}
            >
              <Input placeholder="Nhập họ và tên" />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              label="Số điện thoại"
              name="phoneNumber"
              rules={[
                { required: true, message: "Vui lòng nhập số điện thoại" },
                {
                  pattern: /^(0|\+84)(\d{9})$/,
                  message: "Số điện thoại không hợp lệ (VD: 0912345678)",
                },
              ]}
            >
              <Input placeholder="Nhập số điện thoại" />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: "Vui lòng nhập email" },
                { type: "email", message: "Email không hợp lệ" },
              ]}
            >
              <Input placeholder="Nhập email" />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              label="Ngày sinh"
              name="dob"
              rules={[
                { required: true, message: "Vui lòng chọn ngày sinh" },
                {
                  validator: (_, value) => {
                    if (!value) return Promise.resolve();
                    const age = dayjs().diff(dayjs(value), "year");
                    return age > 0 && age <= 100
                      ? Promise.resolve()
                      : Promise.reject("Tuổi phải từ 1 đến 100");
                  },
                },
              ]}
            >
              <Input type="date" />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              label="Giới tính"
              name="gender"
              rules={[{ required: true, message: "Vui lòng chọn giới tính" }]}
            >
              <Select>
                <Select.Option value="male">Nam</Select.Option>
                <Select.Option value="female">Nữ</Select.Option>
              </Select>
            </Form.Item>
          </Col>

          <Col xs={24}>
            <Form.Item
              label="Địa chỉ"
              name="address"
              rules={[{ required: true, message: "Vui lòng nhập địa chỉ" }]}
            >
              <Input placeholder="Nhập địa chỉ" />
            </Form.Item>
          </Col>
        </Row>

        <Row justify="space-between" style={{ marginTop: "24px" }}>
          <Col>
            <Button onClick={onBack}>
              <FaChevronLeft /> Quay lại
            </Button>
          </Col>
          <Col>
            <Button type="primary" htmlType="submit">
              Chọn hình thức thanh toán <FaChevronRight />
            </Button>
          </Col>
        </Row>
      </Form>
    </Card>
  );
};

// ---------------- MAIN ----------------
export default function BookAppointmentPage() {
  const params = useParams();
  const slug = params.doctor as string;

  const { data, isLoading } = useGetDoctorBySlugQuery(slug, { enabled: !!slug });
  const doctor = data?.data;

  const [currentStep, setCurrentStep] = useState(1);

  if (isLoading) return <Spin tip="Đang tải thông tin bác sĩ..." fullscreen />;

  if (!doctor) return <Paragraph>Không tìm thấy bác sĩ</Paragraph>;

  return (
    <div style={{ padding: "24px", maxWidth: "900px", margin: "auto" }}>
      <Breadcrumb
        className="!pb-2"
        items={[
          {
            href: "/",
            title: <HomeOutlined />,
          },
          {
            title: (
              <Link href={"/booking"}>
                <span>Đặt khám</span>
              </Link>
            ),
          },
          {
            title: "Đặt lịch hẹn",
          },
        ]}
      />

      {/* Thông tin bác sĩ */}
      <Card style={{ marginBottom: "24px" }}>
        <Row align="middle" gutter={16}>
          <Col>
            <Avatar size={72} src={doctor.image} />
          </Col>
          <Col>
            <Title level={4} style={{ marginBottom: 0 }}>
              {doctor.full_name}
            </Title>
            <Paragraph style={{ marginBottom: 0, color: "#1890ff" }}>
              <Text type="secondary">{doctor.specialty}</Text>
            </Paragraph>
          </Col>
        </Row>
      </Card>

      {/* Các bước */}
      <Steps current={currentStep - 1} style={{ marginBottom: "32px" }}>
        <Step title="Chuyên khoa & Dịch vụ" />
        <Step title="Ngày & Giờ" />
        <Step title="Thông tin bệnh nhân" />
      </Steps>

      {currentStep === 1 && (
        <SelectSpecialtyStep doctor={doctor} onNext={() => setCurrentStep(2)} />
      )}
      {currentStep === 2 && (
        <SelectDateTimeStep
          doctor={doctor}
          onNext={() => setCurrentStep(3)}
          onBack={() => setCurrentStep(1)}
        />
      )}
      {currentStep === 3 && <BasicInfoStep onBack={() => setCurrentStep(2)} />}
    </div>
  );
}
