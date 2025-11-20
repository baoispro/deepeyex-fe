"use client";
import { useAppSelector } from "@/app/shares/stores";
import { Layout, Menu } from "antd";
import Avatar from "react-avatar";
import Link from "next/link";
import { useState, useEffect } from "react";
import { MdOutlineKeyboardArrowLeft } from "react-icons/md";
import { CgProfile } from "react-icons/cg";
import { FaHistory, FaReceipt, FaPrescriptionBottle } from "react-icons/fa";
import PatientInfoForm from "@/app/modules/profile/components/PatientInfoForm";
import DiagnosisHistoryTable from "@/app/modules/profile/components/DiagnosisHistoryTable";
import InvoiceSection from "@/app/modules/profile/components/InvonceSection";
import AppointmentList from "@/app/modules/profile/components/AppointmentList";
import PrescriptionList from "@/app/modules/profile/components/PrescriptionList";
import { MdDateRange } from "react-icons/md";
import { useGetAppointmentsByPatientId } from "@/app/modules/hospital/hooks/queries/appointment/use-get-appointments.query";
import { useGetOrdersByPatientId } from "@/app/modules/hospital/hooks/mutations/orders/use-get-orders.query";
import { useGetPrescriptionsByPatientId } from "@/app/modules/hospital/hooks/queries/prescription/use-get-prescriptions.query";
import { useTranslations } from "next-intl";

const { Sider, Content } = Layout;

export default function PatientProfile() {
  const t = useTranslations("home");
  const [selectedKey, setSelectedKey] = useState("info");
  const [appointmentFilters, setAppointmentFilters] = useState({
    status: "",
    date: "",
    sort: "newest",
  });
  const [prescriptionFilters, setPrescriptionFilters] = useState({
    status: "",
    date: "",
    sort: "newest",
  });

  const auth = useAppSelector((state) => state.auth);
  const image = auth.patient?.image;
  const name = auth.patient?.fullName;
  const patientId = auth.patient?.patientId;

  // Fetch appointments from API with filters
  const { data: appointmentsData, isLoading: isLoadingAppointments } =
    useGetAppointmentsByPatientId(patientId || undefined, appointmentFilters);

  // Fetch orders from API
  const { data: ordersData, isLoading: isLoadingOrders } = useGetOrdersByPatientId(
    patientId || undefined,
  );

  // Fetch prescriptions from API with filters
  const { data: prescriptionsData, isLoading: isLoadingPrescriptions } =
    useGetPrescriptionsByPatientId(patientId || undefined, prescriptionFilters);

  const appointments = appointmentsData?.data || [];
  const orders = ordersData?.data || [];
  const prescriptions = prescriptionsData?.data || [];

  // Reset filters khi chuyển tab
  useEffect(() => {
    // Reset appointment filters khi chuyển sang tab appointment
    if (selectedKey === "appointment") {
      setAppointmentFilters({
        status: "",
        date: "",
        sort: "newest",
      });
    }

    // Reset prescription filters khi chuyển sang tab prescription
    if (selectedKey === "prescription") {
      setPrescriptionFilters({
        status: "",
        date: "",
        sort: "newest",
      });
    }
  }, [selectedKey]);

  return (
    <>
      <Link
        href={"/shop"}
        className="px-10 flex gap-1 items-center text-[#1250dc] font-medium hover:text-[#5979c4]"
      >
        <MdOutlineKeyboardArrowLeft size={20} /> <p>{t("profile.backToHome")}</p>
      </Link>
      <Layout style={{ minHeight: "90vh" }} className="px-10 pt-4 flex flex-row gap-4 min-h-screen">
        <Sider
          width={250}
          className="!bg-white rounded-2xl"
          style={{
            position: "sticky",
            top: "80px",
            height: "calc(100vh - 40px)",
            alignSelf: "flex-start",
            overflowY: "auto",
          }}
        >
          <div className="flex flex-col items-center py-6">
            <Avatar name={name || ""} src={image || ""} size="100" round={true} />
            <h2 className="mt-4 text-xl font-semibold">
              {name || t("profile.defaultPatientName")}
            </h2>
          </div>
          <Menu
            defaultSelectedKeys={["profile"]}
            mode="inline"
            selectedKeys={[selectedKey]}
            onClick={(e) => setSelectedKey(e.key)}
            className="!px-4"
            items={[
              {
                key: "info",
                label: t("profile.menu.patientInfo"),
                icon: <CgProfile size={20} />,
              },
              {
                key: "appointment",
                label: t("profile.menu.appointments"),
                icon: <MdDateRange size={20} />,
              },
              {
                key: "prescription",
                label: t("profile.menu.prescriptions"),
                icon: <FaPrescriptionBottle size={20} />,
              },
              {
                key: "history",
                label: t("profile.menu.diagnosisHistory"),
                icon: <FaHistory size={20} />,
              },
              {
                key: "invoice",
                label: t("profile.menu.invoices"),
                icon: <FaReceipt size={20} />,
              },
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
              <AppointmentList
                appointments={appointments}
                loading={isLoadingAppointments}
                filters={appointmentFilters}
                onFilterChange={setAppointmentFilters}
              />
            )}

            {selectedKey === "prescription" && (
              <PrescriptionList
                prescriptions={prescriptions}
                loading={isLoadingPrescriptions}
                filters={prescriptionFilters}
                onFilterChange={setPrescriptionFilters}
              />
            )}
          </Content>
        </Layout>
      </Layout>
    </>
  );
}
