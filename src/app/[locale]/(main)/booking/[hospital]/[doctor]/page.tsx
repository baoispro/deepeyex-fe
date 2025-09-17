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
  Select,
  Checkbox,
  Input,
  DatePicker,
  Radio,
  Avatar,
} from "antd";
import { FaMapMarkerAlt, FaClinicMedical, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";

const { Title, Paragraph, Text } = Typography;
const { Option } = Select;
const { Step } = Steps;
const { RangePicker } = DatePicker;

// Dữ liệu giả định
const mockDoctor = {
  name: "Dr. Darren Elder",
  specialty: "Cardiologist",
  location: "Scottsdale, Arizona, United States, Arizona, United States, 20005",
  avatar: "/doctor-avatar.jpg",
};

const mockClinics = [
  {
    name: "The Family Dentistry Clinic",
    address: "213 Old Trafford UK, New York",
    icon: <FaClinicMedical />,
  },
  {
    name: "Apollo Hospital",
    address: "456 Healthcare Blvd, Los Angeles",
    icon: <FaClinicMedical />,
  },
];

const mockServices = [
  { name: "Aerospace medicine", price: 100 },
  { name: "Oncology", price: 120 },
  { name: "Neurology", price: 150 },
];

const mockTimeSlots = [
  "9:00 am",
  "10:10 am",
  "11:20 am",
  "12:30 pm",
  "1:40 pm",
  "2:50 pm",
  "4:00 pm",
  "5:10 pm",
  "6:20 pm",
  "7:30 pm",
  "8:40 pm",
];

// Bước 1
const SelectClinicStep = ({ onNext }: { onNext: () => void }) => {
  const [selectedClinic, setSelectedClinic] = useState<string | null>(null);

  return (
    <Card>
      <Title level={4}>Select Clinics</Title>
      <Radio.Group
        onChange={(e) => setSelectedClinic(e.target.value)}
        value={selectedClinic}
        style={{ width: "100%" }}
      >
        <Space direction="vertical" style={{ width: "100%" }}>
          {mockClinics.map((clinic) => (
            <Card
              key={clinic.name}
              style={{
                cursor: "pointer",
                borderColor: selectedClinic === clinic.name ? "#1890ff" : "#f0f0f0",
              }}
            >
              <Radio value={clinic.name} style={{ marginRight: "8px" }} />
              <div style={{ display: "inline-block" }}>
                <Paragraph style={{ marginBottom: 0 }}>
                  <Text strong>{clinic.name}</Text>
                </Paragraph>
                <Paragraph style={{ marginBottom: 0 }}>{clinic.address}</Paragraph>
              </div>
            </Card>
          ))}
        </Space>
      </Radio.Group>
      <Row justify="end" style={{ marginTop: "24px" }}>
        <Col>
          <Button type="primary" onClick={onNext} disabled={!selectedClinic}>
            Select Specialty & Services <FaChevronRight style={{ marginLeft: "8px" }} />
          </Button>
        </Col>
      </Row>
    </Card>
  );
};

// Bước 2
const SelectSpecialtyStep = ({ onNext, onBack }: { onNext: () => void; onBack: () => void }) => {
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const total = selectedServices.reduce((sum, service) => {
    const servicePrice = mockServices.find((s) => s.name === service)?.price || 0;
    return sum + servicePrice;
  }, 150);

  return (
    <Card>
      <Title level={4}>Booking Info.</Title>
      <Paragraph>
        <Text strong>Clinic Name:</Text> The Family Dentistry Clinic
      </Paragraph>

      <div style={{ marginBottom: "24px" }}>
        <Paragraph>
          <Text strong>Select Speciality</Text>
        </Paragraph>
        <Select
          placeholder="Cardiologist"
          style={{ width: "100%" }}
          onChange={(value) => setSelectedSpecialty(value)}
          defaultValue="Cardiologist"
          disabled
        >
          <Option value="Cardiologist">Cardiologist</Option>
        </Select>
      </div>

      <div style={{ marginBottom: "24px" }}>
        <Paragraph>
          <Text strong>Services</Text>
        </Paragraph>
        <Checkbox.Group
          onChange={(values) => setSelectedServices(values as string[])}
          style={{ width: "100%" }}
        >
          <Space direction="vertical" style={{ width: "100%" }}>
            {mockServices.map((service) => (
              <div
                key={service.name}
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
              >
                <Checkbox value={service.name}>{service.name}</Checkbox>
                <Text>${service.price.toFixed(2)}</Text>
              </div>
            ))}
          </Space>
        </Checkbox.Group>
      </div>

      <div style={{ marginBottom: "24px" }}>
        <Paragraph>
          <Text strong>Payment Info</Text>
        </Paragraph>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <Text>Consultation fee</Text>
          <Text>$150.00</Text>
        </div>
      </div>

      <Button type="primary" size="large" style={{ width: "100%", marginBottom: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Text style={{ color: "#fff" }}>Total</Text>
          <Text style={{ color: "#fff" }}>${total.toFixed(2)}</Text>
        </div>
      </Button>

      <Row justify="space-between">
        <Col>
          <Button onClick={onBack}>
            <FaChevronLeft style={{ marginRight: "8px" }} /> Back
          </Button>
        </Col>
        <Col>
          <Button type="primary" onClick={onNext}>
            Select Date & Time <FaChevronRight style={{ marginLeft: "8px" }} />
          </Button>
        </Col>
      </Row>
    </Card>
  );
};

// Bước 3
const SelectDateTimeStep = ({ onNext, onBack }: { onNext: () => void; onBack: () => void }) => {
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  return (
    <Card>
      <Title level={4}>Booking Info.</Title>
      <Paragraph>
        <Text strong>Clinic Name:</Text> The Family Dentistry Clinic
      </Paragraph>
      <Paragraph>
        <Text strong>Speciality:</Text> Cardiologist
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
                <Col key={slot} xs={8}>
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
            <FaChevronLeft style={{ marginRight: "8px" }} /> Back
          </Button>
        </Col>
        <Col>
          <Button type="primary" onClick={onNext} disabled={!selectedDate || !selectedSlot}>
            Add Basic Information <FaChevronRight style={{ marginLeft: "8px" }} />
          </Button>
        </Col>
      </Row>
    </Card>
  );
};

// Bước 4
const BasicInfoStep = ({ onBack }: { onBack: () => void }) => {
  const [patientInfo, setPatientInfo] = useState({
    patientType: "Myself",
    firstName: "Emily Rival",
    phoneNumber: "454545435",
    email: "patient@example.com",
  });

  return (
    <Card>
      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Text strong>Select Patient</Text>
          <Select
            placeholder="Myself"
            style={{ width: "100%" }}
            onChange={(value) => setPatientInfo({ ...patientInfo, patientType: value })}
            defaultValue="Myself"
          >
            <Option value="Myself">Myself</Option>
            <Option value="SomeoneElse">Someone else</Option>
          </Select>
        </Col>
        <Col xs={24} md={12}>
          <Text strong>First Name</Text>
          <Input
            placeholder="First Name"
            defaultValue={patientInfo.firstName}
            onChange={(e) => setPatientInfo({ ...patientInfo, firstName: e.target.value })}
          />
        </Col>
        <Col xs={24} md={12}>
          <Text strong>Phone Number</Text>
          <Input
            placeholder="Phone Number"
            defaultValue={patientInfo.phoneNumber}
            onChange={(e) => setPatientInfo({ ...patientInfo, phoneNumber: e.target.value })}
          />
        </Col>
        <Col xs={24} md={12}>
          <Text strong>Email Address</Text>
          <Input
            placeholder="Email Address"
            defaultValue={patientInfo.email}
            onChange={(e) => setPatientInfo({ ...patientInfo, email: e.target.value })}
          />
        </Col>
      </Row>
      <Row justify="space-between" style={{ marginTop: "24px" }}>
        <Col>
          <Button onClick={onBack}>
            <FaChevronLeft style={{ marginRight: "8px" }} /> Back
          </Button>
        </Col>
        <Col>
          <Button type="primary">
            Select Payment <FaChevronRight style={{ marginLeft: "8px" }} />
          </Button>
        </Col>
      </Row>
    </Card>
  );
};

// Component chính
export default function BookAppointmentPage() {
  const [currentStep, setCurrentStep] = useState(1);

  const nextStep = () => setCurrentStep(currentStep + 1);
  const prevStep = () => setCurrentStep(currentStep - 1);

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <SelectClinicStep onNext={nextStep} />;
      case 2:
        return <SelectSpecialtyStep onNext={nextStep} onBack={prevStep} />;
      case 3:
        return <SelectDateTimeStep onNext={nextStep} onBack={prevStep} />;
      case 4:
        return <BasicInfoStep onBack={prevStep} />;
      default:
        return null;
    }
  };

  return (
    <div style={{ padding: "24px", maxWidth: "900px", margin: "auto" }}>
      <Title level={2} style={{ textAlign: "center", marginBottom: "8px" }}>
        Book Appointment
      </Title>
      <Paragraph style={{ textAlign: "center", marginBottom: "24px", color: "#888" }}>
        Home &gt; Book Appointment
      </Paragraph>

      <Steps current={currentStep - 1} style={{ marginBottom: "32px" }}>
        <Step title="Appointment Type" />
        <Step title="Specialty" />
        <Step title="Date & Time" />
        <Step title="Basic Information" />
      </Steps>

      <Card style={{ marginBottom: "24px" }}>
        <Row align="middle" gutter={16}>
          <Col>
            <Avatar size={72} src={mockDoctor.avatar} />
          </Col>
          <Col>
            <Title level={4} style={{ marginBottom: 0 }}>
              {mockDoctor.name}
            </Title>
            <Paragraph style={{ marginBottom: 0, color: "#1890ff" }}>
              <Text type="secondary">{mockDoctor.specialty}</Text>
            </Paragraph>
            <Space align="center" style={{ marginTop: "4px" }}>
              <FaMapMarkerAlt style={{ color: "#888" }} />
              <Paragraph style={{ marginBottom: 0, color: "#888" }}>
                {mockDoctor.location}
              </Paragraph>
            </Space>
          </Col>
        </Row>
      </Card>

      {renderStep()}
    </div>
  );
}
