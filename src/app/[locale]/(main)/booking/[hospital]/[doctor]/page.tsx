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
import { useGetAllServicesByDoctorIdQuery } from "@/app/modules/hospital/hooks/queries/services/use-get-list-service.query";
import { useTranslations } from "next-intl";

interface PatientFormValues {
  patientType: "self" | "other";
  full_name: string;
  phone: string;
  email: string;
  dob: string;
  gender: "male" | "female" | "";
  address: string;
}

const { Title, Paragraph, Text } = Typography;
const { Step } = Steps;

// ---------------- BƯỚC 1: CHỌN DỊCH VỤ ----------------
const SelectSpecialtyStep = ({ doctor, onNext }: { doctor: Doctor; onNext: () => void }) => {
  const t = useTranslations("booking");
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const specialty = doctor.specialty;
  const { data: dataServices } = useGetAllServicesByDoctorIdQuery(doctor.doctor_id);
  const services = dataServices?.data;
  const baseFee = 0;

  const total = services?.find((s) => s.name === selectedService)?.price || baseFee;

  const handleNext = () => {
    if (!selectedService) return;
    // Lưu service đã chọn vào localStorage
    localStorage.setItem(
      "bookingService",
      JSON.stringify(services?.find((s) => s.name === selectedService)),
    );
    onNext();
  };

  return (
    <Card>
      <Title level={4}>{t("appointmentPage.step1.title")}</Title>
      <Paragraph>
        <Text strong>{t("appointmentPage.step1.specialty")}</Text> {specialty}
      </Paragraph>

      <div style={{ marginBottom: "24px" }}>
        <Paragraph>
          <Text strong>{t("appointmentPage.step1.service")}</Text>
        </Paragraph>
        <Radio.Group
          onChange={(e) => setSelectedService(e.target.value)}
          value={selectedService}
          style={{ width: "100%" }}
        >
          <Space direction="vertical" style={{ width: "100%" }}>
            {services?.map((service) => (
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
          <Text style={{ color: "#fff" }}>{t("appointmentPage.step1.total")}</Text>
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
            {t("appointmentPage.step1.nextButton")} <FaChevronRight />
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
  const t = useTranslations("booking");
  const [selectedMonth, setSelectedMonth] = useState(dayjs());
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  // ---- Lấy slot theo tháng để disable ngày ----
  const { data: monthData } = useGetTimeSlotsByDoctorAndMonthQuery(
    doctor.doctor_id,
    selectedMonth.format("YYYY-MM"), // tháng hiện tại
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
  const availableSlots = dayData?.data?.filter((slot) => !slot.appointment_id) || [];
  const timeSlots =
    availableSlots?.map((slot) => {
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
          slot_id: slotData.slot_id,
          start_time: slotData.start_time,
          end_time: slotData.end_time,
        }),
      );
    }

    onNext();
  };

  return (
    <Card>
      <Title level={4}>{t("appointmentPage.step2.title")}</Title>

      <div>
        <div>
          <Title level={5}>{t("appointmentPage.step2.selectDate")}</Title>
          <Calendar
            fullscreen={true}
            onSelect={handleSelectDate}
            onPanelChange={(date, mode) => {
              if (mode === "month") {
                setSelectedMonth(date); // cập nhật tháng mới → hook tự reload
              }
            }}
            disabledDate={(current) => {
              const today = dayjs().startOf("day");
              const isPast = current && current < today;

              const isAvailable = current && availableDays.includes(current.format("YYYY-MM-DD"));

              return isPast || !isAvailable; // disable ngày quá khứ + ngày không có lịch
            }}
          />
        </div>

        <div>
          <Title level={5}>{t("appointmentPage.step2.selectTime")}</Title>
          {selectedDate ? (
            isDayLoading ? (
              <Spin tip={t("appointmentPage.step2.loadingSlots")} fullscreen />
            ) : timeSlots.length > 0 ? (
              <Radio.Group
                onChange={(e) => setSelectedSlot(e.target.value)}
                value={selectedSlot}
                style={{ width: "100%" }}
              >
                <Row gutter={[8, 8]}>
                  {availableSlots?.map((slot) => {
                    const start = dayjs(slot.start_time);
                    const end = dayjs(slot.end_time);
                    const slotLabel = `${start.format("HH:mm")} - ${end.format("HH:mm")}`;

                    const isPast = start.isBefore(dayjs()); // nếu giờ bắt đầu < hiện tại → disable

                    return (
                      <Col key={slot.slot_id} xs={12}>
                        <Radio.Button value={slotLabel} disabled={isPast} style={{ width: "100%" }}>
                          {slotLabel}
                        </Radio.Button>
                      </Col>
                    );
                  })}
                </Row>
              </Radio.Group>
            ) : (
              <Text type="danger">{t("appointmentPage.step2.noSlots")}</Text>
            )
          ) : (
            <Text>{t("appointmentPage.step2.selectDateFirst")}</Text>
          )}
        </div>
      </div>

      <Row justify="space-between" style={{ marginTop: "24px" }}>
        <Col>
          <Button onClick={onBack}>
            <FaChevronLeft /> {t("appointmentPage.step2.backButton")}
          </Button>
        </Col>
        <Col>
          <Button type="primary" onClick={handleNext} disabled={!selectedDate || !selectedSlot}>
            {t("appointmentPage.step2.nextButton")} <FaChevronRight />
          </Button>
        </Col>
      </Row>
    </Card>
  );
};

// ---------------- BƯỚC 3: THÔNG TIN BỆNH NHÂN ----------------
const BasicInfoStep = ({ onBack }: { onBack: () => void }) => {
  const t = useTranslations("booking");
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
          patientType: "self",
          full_name: patient?.fullName || "",
          phone: patient?.phone || "",
          email: patient?.email || "",
          dob: patient?.dob ? patient.dob.split("T")[0] : "",
          gender: patient?.gender || "",
          address: patient?.address || "",
        }}
        onValuesChange={(changed) => {
          if (changed.patientType === "other") {
            form.setFieldsValue({
              full_name: "",
              phone: "",
              email: "",
              dob: "",
              gender: "",
              address: "",
            });
          } else if (changed.patientType === "self") {
            form.setFieldsValue({
              full_name: patient?.fullName || "",
              phone: patient?.phone || "",
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
            <Form.Item label={t("appointmentPage.step3.patientType")} name="patientType">
              <Select>
                <Select.Option value="self">
                  {t("appointmentPage.step3.patientTypeSelf")}
                </Select.Option>
                <Select.Option value="other">
                  {t("appointmentPage.step3.patientTypeOther")}
                </Select.Option>
              </Select>
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              label={t("appointmentPage.step3.fullName")}
              name="full_name"
              rules={[{ required: true, message: t("appointmentPage.step3.fullNameRequired") }]}
            >
              <Input placeholder={t("appointmentPage.step3.fullNamePlaceholder")} />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              label={t("appointmentPage.step3.phone")}
              name="phone"
              rules={[
                { required: true, message: t("appointmentPage.step3.phoneRequired") },
                {
                  pattern: /^(0|\+84)(\d{9})$/,
                  message: t("appointmentPage.step3.phoneInvalid"),
                },
              ]}
            >
              <Input placeholder={t("appointmentPage.step3.phonePlaceholder")} />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              label={t("appointmentPage.step3.email")}
              name="email"
              rules={[
                { required: true, message: t("appointmentPage.step3.emailRequired") },
                { type: "email", message: t("appointmentPage.step3.emailInvalid") },
              ]}
            >
              <Input placeholder={t("appointmentPage.step3.emailPlaceholder")} />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              label={t("appointmentPage.step3.dob")}
              name="dob"
              rules={[
                { required: true, message: t("appointmentPage.step3.dobRequired") },
                {
                  validator: (_, value) => {
                    if (!value) return Promise.resolve();
                    const age = dayjs().diff(dayjs(value), "year");
                    return age > 0 && age <= 100
                      ? Promise.resolve()
                      : Promise.reject(t("appointmentPage.step3.ageInvalid"));
                  },
                },
              ]}
            >
              <Input type="date" />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              label={t("appointmentPage.step3.gender")}
              name="gender"
              rules={[{ required: true, message: t("appointmentPage.step3.genderRequired") }]}
            >
              <Select>
                <Select.Option value="male">{t("appointmentPage.step3.genderMale")}</Select.Option>
                <Select.Option value="female">
                  {t("appointmentPage.step3.genderFemale")}
                </Select.Option>
              </Select>
            </Form.Item>
          </Col>

          <Col xs={24}>
            <Form.Item
              label={t("appointmentPage.step3.address")}
              name="address"
              rules={[{ required: true, message: t("appointmentPage.step3.addressRequired") }]}
            >
              <Input placeholder={t("appointmentPage.step3.addressPlaceholder")} />
            </Form.Item>
          </Col>
        </Row>

        <Row justify="space-between" style={{ marginTop: "24px" }}>
          <Col>
            <Button onClick={onBack}>
              <FaChevronLeft /> {t("appointmentPage.step3.backButton")}
            </Button>
          </Col>
          <Col>
            <Button type="primary" htmlType="submit">
              {t("appointmentPage.step3.nextButton")} <FaChevronRight />
            </Button>
          </Col>
        </Row>
      </Form>
    </Card>
  );
};

// ---------------- MAIN ----------------
export default function BookAppointmentPage() {
  const t = useTranslations("booking");
  const params = useParams();
  const slug = params.doctor as string;

  const { data, isLoading } = useGetDoctorBySlugQuery(slug, { enabled: !!slug });
  const doctor = data?.data;

  const [currentStep, setCurrentStep] = useState(1);

  if (isLoading) return <Spin tip={t("appointmentPage.loading")} fullscreen />;

  if (!doctor) return <Paragraph>{t("appointmentPage.doctorNotFound")}</Paragraph>;

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
                <span>{t("appointmentPage.breadcrumb.booking")}</span>
              </Link>
            ),
          },
          {
            title: t("appointmentPage.breadcrumb.appointment"),
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
        <Step title={t("appointmentPage.steps.service")} />
        <Step title={t("appointmentPage.steps.datetime")} />
        <Step title={t("appointmentPage.steps.patient")} />
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
