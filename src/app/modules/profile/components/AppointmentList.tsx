"use client";
import { Card, Typography, Tag } from "antd";
import React from "react";
import { Appointment, statusLabels } from "../types/appointment";

const { Title, Text } = Typography;

interface AppointmentListProps {
  appointments: Appointment[];
}

const statusColors: Record<Appointment["status"], string> = {
  upcoming: "blue",
  completed: "green",
  cancelled: "red",
};

export default function AppointmentList({ appointments }: AppointmentListProps) {
  if (appointments.length === 0) {
    return <Text>Không có lịch hẹn nào.</Text>;
  }

  return (
    <div className="flex flex-col gap-5">
      <Title level={4}>📅 Lịch hẹn khám</Title>

      {appointments.map((appt) => {
        const date = new Date(appt.date);
        const formattedDate = date.toLocaleDateString("vi-VN", {
          weekday: "long",
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });
        const formattedTime = date.toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
        });

        return (
          <Card key={appt.appointment_id} className="shadow-md">
            <div className="flex justify-between items-start">
              <div>
                <Text strong>
                  🕒 {formattedDate} lúc {formattedTime}
                </Text>
                <br />
                <Text>
                  👨‍⚕️ <strong>Bác sĩ:</strong> {appt.doctor_name}
                </Text>
                <br />
                <Text>
                  🏥 <strong>Phòng khám:</strong> {appt.clinic}
                </Text>
                {appt.note && (
                  <>
                    <br />
                    <Text>
                      📝 <strong>Ghi chú:</strong> {appt.note}
                    </Text>
                  </>
                )}
              </div>

              <Tag color={statusColors[appt.status]}>{statusLabels[appt.status].label}</Tag>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
