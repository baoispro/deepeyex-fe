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
  Checkbox,
  Input,
  DatePicker,
  Radio,
  Avatar,
  Select,
  Spin,
} from "antd";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import { useParams } from "next/navigation";
import { useRouter } from "@/app/shares/locales/navigation";
import { Doctor } from "@/app/modules/hospital/types/doctor";
import { useGetDoctorBySlugQuery } from "@/app/modules/hospital/hooks/queries/doctors/use-get-doctor-by slug.query";
import { useSelector } from "react-redux";
import { RootState } from "@/app/shares/stores";

const { Title, Paragraph, Text } = Typography;
const { Step } = Steps;

// ---------------- MAP SERVICES ----------------
const specialtyServices: Record<string, { name: string; price: number }[]> = {
  ophthalmology: [
    { name: "Eye Exam", price: 100 },
    { name: "Laser Surgery", price: 250 },
  ],
  internal_medicine: [
    { name: "General Consultation", price: 80 },
    { name: "ECG Test", price: 120 },
  ],
  neurology: [
    { name: "EEG Test", price: 150 },
    { name: "Brain MRI", price: 300 },
  ],
  endocrinology: [
    { name: "Diabetes Checkup", price: 110 },
    { name: "Hormone Test", price: 140 },
  ],
  pediatrics: [
    { name: "Child Consultation", price: 90 },
    { name: "Vaccination", price: 70 },
  ],
};

// ---------------- STEP 1: Specialty & Services ----------------
const SelectSpecialtyStep = ({ doctor, onNext }: { doctor: Doctor; onNext: () => void }) => {
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const specialty = doctor.specialty;
  const services = specialtyServices[specialty] || [];
  const baseFee = 150;

  const total = selectedServices.reduce((sum, service) => {
    const price = services.find((s) => s.name === service)?.price || 0;
    return sum + price;
  }, baseFee);

  return (
    <Card>
      <Title level={4}>Booking Info.</Title>
      <Paragraph>
        <Text strong>Specialty:</Text> {specialty}
      </Paragraph>

      <div style={{ marginBottom: "24px" }}>
        <Paragraph>
          <Text strong>Services</Text>
        </Paragraph>
        <Checkbox.Group
          onChange={(values) => setSelectedServices(values as string[])}
          style={{ width: "100%" }}
        >
          <Space direction="vertical" style={{ width: "100%" }}>
            {services.map((service) => (
              <div key={service.name} style={{ display: "flex", justifyContent: "space-between" }}>
                <Checkbox value={service.name}>{service.name}</Checkbox>
                <Text>${service.price.toFixed(2)}</Text>
              </div>
            ))}
          </Space>
        </Checkbox.Group>
      </div>

      <Button type="primary" size="large" style={{ width: "100%", marginBottom: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <Text style={{ color: "#fff" }}>Total</Text>
          <Text style={{ color: "#fff" }}>${total.toFixed(2)}</Text>
        </div>
      </Button>

      <Row justify="end">
        <Col>
          <Button type="primary" onClick={onNext}>
            Select Date & Time <FaChevronRight />
          </Button>
        </Col>
      </Row>
    </Card>
  );
};

// ---------------- STEP 2: Date & Time ----------------
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

  const mockTimeSlots = [
    "9:00 am",
    "10:10 am",
    "11:20 am",
    "12:30 pm",
    "1:40 pm",
    "2:50 pm",
    "4:00 pm",
    "5:10 pm",
  ];

  return (
    <Card>
      <Title level={4}>Booking Info.</Title>
      <Paragraph>
        <Text strong>Specialty:</Text> {doctor.specialty}
      </Paragraph>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Title level={5}>Select a date</Title>
          <DatePicker
            onChange={(date) => setSelectedDate(date)}
            picker="date"
            style={{ width: "100%" }}
            cellRender={(current) => (
              <div style={{ textAlign: "center" }}>
                <div style={{ fontWeight: "bold" }}>
                  {dayjs.isDayjs(current) ? current.format("D") : current}
                </div>
                <div style={{ fontSize: "12px", color: "#888" }}>
                  {`Slots: ${Math.floor(Math.random() * 5) + 1}`}
                </div>
              </div>
            )}
          />
        </Col>
        <Col xs={24} md={12}>
          <Title level={5}>Select a time</Title>
          <Radio.Group onChange={(e) => setSelectedSlot(e.target.value)} value={selectedSlot}>
            <Row gutter={[8, 8]}>
              {mockTimeSlots.map((slot) => (
                <Col key={slot} xs={12}>
                  <Radio.Button value={slot} style={{ width: "100%" }}>
                    {slot}
                    <div style={{ fontSize: "12px", color: "#888" }}>Slots: 1</div>
                  </Radio.Button>
                </Col>
              ))}
            </Row>
          </Radio.Group>
        </Col>
      </Row>

      <Row justify="space-between" style={{ marginTop: "24px" }}>
        <Col>
          <Button onClick={onBack}>
            <FaChevronLeft /> Back
          </Button>
        </Col>
        <Col>
          <Button type="primary" onClick={onNext} disabled={!selectedDate || !selectedSlot}>
            Add Basic Information <FaChevronRight />
          </Button>
        </Col>
      </Row>
    </Card>
  );
};

// ---------------- STEP 3: Basic Info ----------------
const BasicInfoStep = ({ onBack }: { onBack: () => void }) => {
  const patient = useSelector((state: RootState) => state.auth.patient);

  const [patientInfo, setPatientInfo] = useState({
    patientType: "Myself",
    fullName: patient?.fullName || "",
    phoneNumber: patient?.phone || "",
    email: patient?.email || "",
    dob: patient?.dob || "",
    gender: patient?.gender || "",
    address: patient?.address || "",
  });

  const router = useRouter();

  return (
    <Card>
      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Text strong>Select Patient</Text>
          <Select
            placeholder="Myself"
            style={{ width: "100%" }}
            value={patientInfo.patientType}
            onChange={(value) => setPatientInfo({ ...patientInfo, patientType: value })}
          >
            <Select.Option value="Myself">Myself</Select.Option>
            <Select.Option value="SomeoneElse">Someone else</Select.Option>
          </Select>
        </Col>

        <Col xs={24} md={12}>
          <Text strong>Full Name</Text>
          <Input
            placeholder="Full Name"
            value={patientInfo.fullName}
            onChange={(e) => setPatientInfo({ ...patientInfo, fullName: e.target.value })}
          />
        </Col>

        <Col xs={24} md={12}>
          <Text strong>Phone Number</Text>
          <Input
            placeholder="Phone Number"
            value={patientInfo.phoneNumber}
            onChange={(e) => setPatientInfo({ ...patientInfo, phoneNumber: e.target.value })}
          />
        </Col>

        <Col xs={24} md={12}>
          <Text strong>Email Address</Text>
          <Input
            placeholder="Email Address"
            value={patientInfo.email}
            onChange={(e) => setPatientInfo({ ...patientInfo, email: e.target.value })}
          />
        </Col>

        <Col xs={24} md={12}>
          <Text strong>Date of Birth</Text>
          <Input
            type="date"
            value={patientInfo.dob?.split("T")[0] || ""}
            onChange={(e) => setPatientInfo({ ...patientInfo, dob: e.target.value })}
          />
        </Col>

        <Col xs={24} md={12}>
          <Text strong>Gender</Text>
          <Select
            value={patientInfo.gender}
            style={{ width: "100%" }}
            onChange={(value) => setPatientInfo({ ...patientInfo, gender: value })}
          >
            <Select.Option value="male">Male</Select.Option>
            <Select.Option value="female">Female</Select.Option>
            <Select.Option value="other">Other</Select.Option>
          </Select>
        </Col>

        <Col xs={24}>
          <Text strong>Address</Text>
          <Input
            placeholder="Address"
            value={patientInfo.address}
            onChange={(e) => setPatientInfo({ ...patientInfo, address: e.target.value })}
          />
        </Col>
      </Row>

      <Row justify="space-between" style={{ marginTop: "24px" }}>
        <Col>
          <Button onClick={onBack}>
            <FaChevronLeft /> Back
          </Button>
        </Col>
        <Col>
          <Button type="primary" onClick={() => router.push("/payment")}>
            Select Payment <FaChevronRight />
          </Button>
        </Col>
      </Row>
    </Card>
  );
};

// ---------------- MAIN COMPONENT ----------------
export default function BookAppointmentPage() {
  const params = useParams();
  const slug = params.doctor as string;

  const { data, isLoading } = useGetDoctorBySlugQuery(slug, { enabled: !!slug });
  const doctor = data?.data;

  const [currentStep, setCurrentStep] = useState(1);

  if (isLoading) return <Spin tip="Loading doctor..." />;

  if (!doctor) return <Paragraph>Doctor not found</Paragraph>;

  return (
    <div style={{ padding: "24px", maxWidth: "900px", margin: "auto" }}>
      <Title level={2} style={{ textAlign: "center", marginBottom: "8px" }}>
        Book Appointment
      </Title>
      <Paragraph style={{ textAlign: "center", marginBottom: "24px", color: "#888" }}>
        Home &gt; Book Appointment
      </Paragraph>

      {/* Doctor Info */}
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

      {/* Steps */}
      <Steps current={currentStep - 1} style={{ marginBottom: "32px" }}>
        <Step title="Specialty & Services" />
        <Step title="Date & Time" />
        <Step title="Basic Information" />
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
