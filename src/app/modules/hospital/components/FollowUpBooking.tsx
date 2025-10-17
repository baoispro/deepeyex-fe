"use client";

import React, { useState, useMemo } from "react";
import {
  Card,
  Input,
  Select,
  Button,
  Typography,
  Form,
  message,
  Divider,
  Space,
  Spin,
  Descriptions,
  Radio,
  Row,
  Col,
  Calendar,
} from "antd";
import { FileTextOutlined, FileSearchOutlined } from "@ant-design/icons";
import { motion } from "framer-motion";
import dayjs, { Dayjs } from "dayjs";
import { useGetMedicalRecordsByPatientQuery } from "../hooks/queries/medical_records/use-get-medical-records-by-patient.query";
import { useAppSelector } from "@/app/shares/stores";
import { MedicalRecord } from "../types/medical_record";
import { useGetTimeSlotsByDoctorAndMonthQuery } from "../hooks/queries/timeslots/use-get-time-slots-by-doctor-and-month.query";
import { useGetTimeSlotsByDoctorAndDateQuery } from "../hooks/queries/timeslots/use-get-time-slots-by-doctor-and-date.query";
import { useCreateFollowUpAppointmentMutation } from "../hooks/mutations/appointments/use-create-follow-up-appointment.mutation";
import { toast } from "react-toastify";
import { CreateFollowUpRequest } from "../apis/appointment/appointmentApi";
import { useQueryClient } from "@tanstack/react-query";
import { QueryKeyEnum } from "@/app/shares/enums/queryKey";

const { Title, Text } = Typography;
const { Option } = Select;

const FollowUpBooking: React.FC = () => {
  const queryClient = useQueryClient();
  const patientId = useAppSelector((state) => state.auth.patient?.patientId || "");
  const userId = useAppSelector((state) => state.auth.userId || "");
  const {
    data: existingRecords,
    isLoading,
    isError,
  } = useGetMedicalRecordsByPatientQuery(patientId);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  const [step, setStep] = useState(1);

  const handleSelectRecord = (recordId?: string) => {
    if (!recordId) {
      setSelectedRecord(null);
      return;
    }
    const rec = existingRecords?.data?.records.find((r) => r.record_id === recordId);
    setSelectedRecord(rec ?? null);
  };

  const handleSubmitStep1 = () => {
    if (!selectedRecord) {
      message.warning("Vui lòng chọn hồ sơ để tiếp tục!");
      return;
    }
    setStep(2);
  };

  // ---------------- Lấy slot theo bác sĩ/bệnh viện của hồ sơ ----------------
  const doctorId = selectedRecord?.appointment?.doctor?.doctor_id;
  const { data: monthData } = useGetTimeSlotsByDoctorAndMonthQuery(
    doctorId || "",
    dayjs().format("YYYY-MM"),
    { enabled: !!doctorId && step === 2 },
  );

  const availableDays = useMemo(
    () => monthData?.data?.map((slot) => dayjs(slot.start_time).format("YYYY-MM-DD")) || [],
    [monthData],
  );

  const [selectedDate, setSelectedDate] = useState<Dayjs | undefined>(undefined);
  const { data: dayData, isLoading: isDayLoading } = useGetTimeSlotsByDoctorAndDateQuery(
    doctorId || "",
    selectedDate ? selectedDate.format("YYYY-MM-DD") : "",
    { enabled: !!selectedDate && !!doctorId },
  );

  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  const createFollowUpMutation = useCreateFollowUpAppointmentMutation({
    onSuccess: () => {
      toast.success(`Đặt lịch tái khám thành công cho hồ sơ ${selectedRecord?.record_id} 🎉`);
      // reset form & state
      setStep(1);
      setSelectedRecord(null);
      setSelectedDate(undefined);
      setSelectedSlot(null);
      form.resetFields();
      if (patientId) {
        queryClient.invalidateQueries({
          queryKey: [QueryKeyEnum.MedicalRecords, patientId],
        });
      }
    },
    onError: (err: Error) => {
      toast.error(`Đặt lịch thất bại: ${err.message}`);
    },
  });

  const handleFinalSubmit = async () => {
    if (!selectedSlot || !selectedRecord || !doctorId) {
      message.warning("Vui lòng chọn ngày, slot và hồ sơ!");
      return;
    }

    const payload: CreateFollowUpRequest = {
      patient_id: patientId,
      doctor_id: doctorId,
      hospital_id: selectedRecord.appointment?.hospital?.hospital_id || "",
      book_user_id: userId, // giả sử book_user là patient
      slot_ids: [selectedSlot],
      notes: form.getFieldValue("notes") || "",
      service_name: "Tái khám",
      related_record_id: selectedRecord.record_id,
    };

    createFollowUpMutation.mutate(payload);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="flex justify-center items-center"
    >
      <Card
        variant="borderless"
        className="shadow-lg rounded-2xl w-full max-w-4xl bg-white/90 backdrop-blur-sm p-6"
        style={{
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1), 0 4px 10px rgba(0, 0, 0, 0.05)",
        }}
      >
        {/* Step 1: Chọn hồ sơ */}
        {step === 1 && (
          <>
            <div className="text-center mb-6">
              <FileTextOutlined className="text-[#1250dc] text-4xl mb-3 animate-pulse" />
              <Title level={3} style={{ color: "#1250dc", marginBottom: 0 }}>
                Chọn hồ sơ tái khám
              </Title>
              <Text type="secondary">
                Nhập mã hồ sơ hoặc chọn hồ sơ đã có để tiếp tục đặt lịch tái khám.
              </Text>
            </div>

            <Form layout="vertical" form={form} autoComplete="off">
              <Form.Item
                label={
                  <Space>
                    <FileSearchOutlined />
                    <Text strong>Nhập mã hồ sơ</Text>
                  </Space>
                }
                name="recordCode"
              >
                <Input placeholder="Ví dụ: MR-20251015" size="large" style={{ borderRadius: 8 }} />
              </Form.Item>

              <Divider plain style={{ color: "#999" }}>
                Hoặc chọn hồ sơ đã có
              </Divider>

              <Form.Item
                label={
                  <Space>
                    <FileTextOutlined />
                    <Text strong>Chọn hồ sơ</Text>
                  </Space>
                }
                name="existingRecord"
              >
                {isLoading ? (
                  <Spin tip="Đang tải hồ sơ..." />
                ) : isError ? (
                  <Text type="danger">Không thể tải hồ sơ</Text>
                ) : (
                  <Select
                    placeholder="Chọn hồ sơ của bạn"
                    allowClear
                    size="large"
                    style={{ borderRadius: 8 }}
                    onChange={handleSelectRecord}
                  >
                    {(existingRecords?.data?.records || []).map((rec) => (
                      <Option key={rec.record_id} value={rec.record_id}>
                        {`Hồ sơ ngày ${
                          rec.appointment?.time_slots?.[0]?.start_time
                            ? new Date(rec.appointment.time_slots[0].start_time).toLocaleDateString(
                                "vi-VN",
                              )
                            : new Date(rec.created_at).toLocaleDateString("vi-VN")
                        } - ${rec.diagnosis}`}
                      </Option>
                    ))}
                  </Select>
                )}
              </Form.Item>

              <Form.Item className="mt-6 mb-0">
                <Button
                  type="primary"
                  onClick={handleSubmitStep1}
                  block
                  size="large"
                  style={{
                    background: "linear-gradient(90deg, #1250dc 0%, #3b82f6 100%)",
                    border: "none",
                    borderRadius: 10,
                    height: 48,
                    fontSize: 16,
                    fontWeight: 500,
                  }}
                >
                  Xác nhận hồ sơ
                </Button>
              </Form.Item>
            </Form>
          </>
        )}

        {/* Step 2: Chọn slot */}
        {step === 2 && selectedRecord && (
          <>
            <Title level={4} style={{ color: "#1250dc", marginBottom: 12 }}>
              Chọn ngày giờ tái khám
            </Title>

            <Row gutter={16}>
              {/* Cột trái: Thông tin hồ sơ */}
              <Col span={10}>
                <Title level={5} style={{ color: "#1250dc", marginBottom: 12 }}>
                  Tóm tắt hồ sơ đã chọn
                </Title>
                <Descriptions bordered column={1} size="small">
                  <Descriptions.Item label="Ngày khám trước">
                    {selectedRecord.appointment?.time_slots?.[0]?.start_time
                      ? dayjs(selectedRecord.appointment.time_slots[0].start_time).format(
                          "DD/MM/YYYY",
                        )
                      : dayjs(selectedRecord.created_at).format("DD/MM/YYYY")}
                  </Descriptions.Item>
                  <Descriptions.Item label="Chuẩn đoán">
                    {selectedRecord.diagnosis}
                  </Descriptions.Item>
                  <Descriptions.Item label="Bác sĩ">
                    {selectedRecord.appointment?.doctor?.full_name || "Chưa có"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Bệnh viện">
                    {selectedRecord.appointment?.hospital?.name || "Chưa có"}
                  </Descriptions.Item>
                </Descriptions>
              </Col>

              {/* Cột phải: Calendar + slot */}
              <Col span={14}>
                <Calendar
                  fullscreen={false}
                  value={selectedDate}
                  onSelect={(date) => {
                    setSelectedDate(date);
                    setSelectedSlot(null);
                  }}
                  disabledDate={(current) => {
                    const today = dayjs().startOf("day");
                    const isPast = current && current < today;
                    const isAvailable =
                      current && availableDays.includes(current.format("YYYY-MM-DD"));
                    return isPast || !isAvailable;
                  }}
                />

                <Divider style={{ margin: "16px 0" }}>Chọn giờ</Divider>

                {selectedDate ? (
                  isDayLoading ? (
                    <Spin tip="Đang tải slot..." />
                  ) : dayData?.data?.length ? (
                    <Radio.Group
                      onChange={(e) => setSelectedSlot(e.target.value)}
                      value={selectedSlot}
                      style={{ width: "100%" }}
                    >
                      <Row gutter={[8, 8]}>
                        {dayData.data.map((slot) => {
                          const start = dayjs(slot.start_time);
                          const end = dayjs(slot.end_time);
                          const slotLabel = `${start.format("HH:mm")} - ${end.format("HH:mm")}`;
                          const isPast = start.isBefore(dayjs());
                          return (
                            <Col key={slot.slot_id} xs={12}>
                              <Radio.Button
                                value={slot.slot_id}
                                disabled={isPast}
                                style={{ width: "100%" }}
                              >
                                {slotLabel}
                              </Radio.Button>
                            </Col>
                          );
                        })}
                      </Row>
                    </Radio.Group>
                  ) : (
                    <Text type="danger">Không có slot cho ngày này</Text>
                  )
                ) : (
                  <Text>Vui lòng chọn ngày trước</Text>
                )}

                <Divider style={{ margin: "16px 0" }} />

                <Form layout="vertical" form={form} onFinish={handleFinalSubmit}>
                  <Form.Item label={<Text strong>Ghi chú bổ sung</Text>} name="notes">
                    <Input.TextArea
                      placeholder="Triệu chứng hiện tại, câu hỏi bác sĩ..."
                      rows={4}
                    />
                  </Form.Item>

                  <Form.Item className="mt-4 mb-0">
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={loading}
                      block
                      size="large"
                      style={{
                        background: "linear-gradient(90deg, #1250dc 0%, #3b82f6 100%)",
                        border: "none",
                        borderRadius: 10,
                        height: 48,
                        fontSize: 16,
                        fontWeight: 500,
                      }}
                    >
                      Xác nhận đặt lịch tái khám
                    </Button>
                  </Form.Item>
                </Form>
              </Col>
            </Row>
          </>
        )}
      </Card>
    </motion.div>
  );
};

export default FollowUpBooking;
