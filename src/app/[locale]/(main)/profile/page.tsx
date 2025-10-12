"use client";
import { useAppSelector } from "@/app/shares/stores";
import { Layout, Menu } from "antd";
import Avatar from "react-avatar";
import Link from "next/link";
import { useState } from "react";
import { MdOutlineKeyboardArrowLeft } from "react-icons/md";
import { CgProfile } from "react-icons/cg";
import { FaHistory, FaReceipt } from "react-icons/fa";
import PatientInfoForm from "@/app/modules/profile/components/PatientInfoForm";
import DiagnosisHistoryTable from "@/app/modules/profile/components/DiagnosisHistoryTable";
import InvoiceSection from "@/app/modules/profile/components/InvonceSection";
import AppointmentList from "@/app/modules/profile/components/AppointmentList";
import { MdDateRange } from "react-icons/md";
import { useGetAppointmentsByPatientId } from "@/app/modules/hospital/hooks/queries/appointment/use-get-appointments.query";
import { useGetOrdersByPatientId } from "@/app/modules/hospital/hooks/mutations/orders/use-get-orders.query";

const { Sider, Content } = Layout;

export default function PatientProfile() {
  const [selectedKey, setSelectedKey] = useState("info");
  const auth = useAppSelector((state) => state.auth);
  const image = auth.patient?.image;
  const name = auth.patient?.fullName;
  const patientId = auth.patient?.patientId;

  // Fetch appointments from API
  const { data: appointmentsData, isLoading: isLoadingAppointments } =
    useGetAppointmentsByPatientId(patientId || undefined);

  // Fetch orders from API
  const { data: ordersData, isLoading: isLoadingOrders } = useGetOrdersByPatientId(
    patientId || undefined,
  );

  const appointments = appointmentsData?.data || [];
  const orders = ordersData?.data || [];

  return (
    <>
      <Link
        href={"/shop"}
        className="px-10 flex gap-1 items-center text-[#1250dc] font-medium hover:text-[#5979c4]"
      >
        <MdOutlineKeyboardArrowLeft size={20} /> <p>Trang chủ</p>
      </Link>
      <Layout style={{ minHeight: "90vh" }} className="px-10 pt-4 flex flex-row gap-4 min-h-screen">
        <Sider width={250} className="!bg-white rounded-2xl" style={{ height: "100vh" }}>
          <div className="flex flex-col items-center py-6">
            <Avatar name={name || ""} src={image || ""} size="100" round={true} />
            <h2 className="mt-4 text-xl font-semibold">{name || "Bệnh nhân"}</h2>
          </div>
          <Menu
            defaultSelectedKeys={["profile"]}
            mode="inline"
            selectedKeys={[selectedKey]}
            onClick={(e) => setSelectedKey(e.key)}
            className="!px-4"
            items={[
              { key: "info", label: "Thông tin bệnh nhân", icon: <CgProfile size={20} /> },
              { key: "appointment", label: "Lịch hẹn khám", icon: <MdDateRange size={20} /> },
              { key: "history", label: "Lịch sử chẩn đoán", icon: <FaHistory size={20} /> },
              { key: "invoice", label: "Hóa đơn", icon: <FaReceipt size={20} /> },
            ]}
          ></Menu>
        </Sider>

        <Layout>
          <Content className="p-6 bg-white rounded-2xl">
            {selectedKey === "info" && <PatientInfoForm />}

            {selectedKey === "history" && <DiagnosisHistoryTable />}

            {selectedKey === "invoice" && (
              <InvoiceSection orders={orders} loading={isLoadingOrders} />
            )}

            {selectedKey === "appointment" && (
              <AppointmentList appointments={appointments} loading={isLoadingAppointments} />
            )}
          </Content>
        </Layout>
      </Layout>
    </>
  );
}
