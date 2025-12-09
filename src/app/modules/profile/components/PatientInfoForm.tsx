"use client";
import { Upload, Button, Form, Input, Select, UploadFile, message, DatePicker } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useState } from "react";
import { Patient } from "../../hospital/types/patient";
import { useAppSelector } from "@/app/shares/stores";
import Avatar from "react-avatar";
import dayjs from "dayjs";
import { useUpdatePatientMutation } from "../../hospital/hooks/mutations/patients/use-update-patient.mutation";
import { useDispatch } from "react-redux";
import { setPatient } from "@/app/shares/stores/authSlice";
import { useTranslations } from "next-intl";

export default function PatientInfoForm() {
  const t = useTranslations("home");
  const [form] = Form.useForm<Patient>();
  const auth = useAppSelector((state) => state.auth);
  const patient = auth.patient;
  const dispatch = useDispatch();

  const [fileList, setFileList] = useState<UploadFile[]>(
    patient?.image
      ? [
          {
            uid: "-1",
            name: "avatar.png",
            status: "done",
            url: patient.image,
          },
        ]
      : [],
  );

  const updatePatientMutation = useUpdatePatientMutation({
    onSuccess: () => {
      message.success(t("profile.patientInfoForm.updateSuccess"));
    },
    onError: (error) => {
      message.error(error.message || t("profile.patientInfoForm.updateFailed"));
    },
  });

  const beforeUpload = (file: File) => {
    const isImage = file.type.startsWith("image/");
    if (!isImage) message.error(t("profile.patientInfoForm.imageUploadError"));
    return isImage ? false : Upload.LIST_IGNORE;
  };

  const handleUploadChange = ({ fileList }: { fileList: UploadFile[] }) => {
    setFileList(fileList);
    form.setFieldsValue({
      image: fileList.length > 0 ? fileList[0].url : undefined,
    });
  };

  const handleFinish = (values: Patient) => {
    if (!patient?.patientId) {
      message.error(t("profile.patientInfoForm.patientNotFound"));
      return;
    }

    const payload = {
      patientId: patient.patientId,
      fullName: values.full_name ?? "",
      dob: values.dob ? dayjs(values.dob).format("YYYY-MM-DD") : undefined,
      gender: values.gender,
      address: values.address ?? "",
      phone: values.phone ?? "",
      email: values.email ?? "",
      image: fileList.length > 0 ? fileList[0].url : undefined,
    };

    updatePatientMutation.mutate(payload);
    dispatch(
      setPatient({
        patientId: patient.patientId,
        fullName: payload.fullName || null,
        address: payload.address || null,
        dob: payload.dob || null,
        email: payload.email || null,
        gender: payload.gender || null,
        phone: payload.phone || null,
        image: payload.image || null,
      }),
    );
  };

  return (
    <div>
      <Form
        layout="vertical"
        form={form}
        onFinish={handleFinish}
        initialValues={{
          full_name: patient?.fullName || "",
          dob: patient?.dob ? dayjs(patient.dob) : null,
          gender: patient?.gender || "male",
          address: patient?.address || "",
          phone: patient?.phone || "",
          email: patient?.email || "",
          image: fileList.length > 0 ? fileList[0] : null,
        }}
        className="flex flex-col md:flex-row gap-8 p-6 bg-white "
      >
        <Form.Item name="image" className="w-1/2">
          <div className="flex flex-col items-center">
            <Avatar
              name={patient?.fullName || ""}
              src={patient?.image || ""}
              size="200"
              round={true}
            />

            <Upload
              fileList={fileList}
              onChange={handleUploadChange}
              beforeUpload={beforeUpload}
              showUploadList={false}
            >
              <Button icon={<UploadOutlined />} className="mt-4">
                {t("profile.patientInfoForm.changeAvatar")}
              </Button>
            </Upload>
          </div>
        </Form.Item>

        {/* Patient Info */}
        <div className="w-full md:w-2/3">
          <Form.Item
            label={t("profile.patientInfoForm.fullName.label")}
            name="full_name"
            rules={[{ required: true, message: t("profile.patientInfoForm.fullName.required") }]}
          >
            <Input placeholder={t("profile.patientInfoForm.fullName.placeholder")} />
          </Form.Item>

          <Form.Item
            label={t("profile.patientInfoForm.dob.label")}
            name="dob"
            rules={[{ required: true, message: t("profile.patientInfoForm.dob.required") }]}
          >
            <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
          </Form.Item>

          <Form.Item
            label={t("profile.patientInfoForm.gender.label")}
            name="gender"
            rules={[{ required: true, message: t("profile.patientInfoForm.gender.required") }]}
          >
            <Select>
              <Select.Option value="male">{t("profile.patientInfoForm.gender.male")}</Select.Option>
              <Select.Option value="female">
                {t("profile.patientInfoForm.gender.female")}
              </Select.Option>
              <Select.Option value="other">
                {t("profile.patientInfoForm.gender.other")}
              </Select.Option>
            </Select>
          </Form.Item>

          <Form.Item label={t("profile.patientInfoForm.address.label")} name="address">
            <Input placeholder={t("profile.patientInfoForm.address.placeholder")} />
          </Form.Item>

          <Form.Item label={t("profile.patientInfoForm.phone.label")} name="phone">
            <Input placeholder={t("profile.patientInfoForm.phone.placeholder")} />
          </Form.Item>

          <Form.Item label={t("profile.patientInfoForm.email.label")} name="email">
            <Input type="email" placeholder={t("profile.patientInfoForm.email.placeholder")} />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={updatePatientMutation.isPending}>
              {updatePatientMutation.isPending
                ? t("profile.patientInfoForm.save.saving")
                : t("profile.patientInfoForm.save.button")}
            </Button>
          </Form.Item>
        </div>
      </Form>
    </div>
  );
}
