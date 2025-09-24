"use client";
import { Upload, Button, Form, Input, Select, UploadFile, message, DatePicker } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useState } from "react";
import { Patient } from "../../hospital/types/patient";
import { useAppSelector } from "@/app/shares/stores";
import Avatar from "react-avatar";
import dayjs from "dayjs";

export default function PatientInfoForm() {
  const [form] = Form.useForm<Patient>();
  const auth = useAppSelector((state) => state.auth);
  const image = auth.patient?.image;
  const name = auth.patient?.fullName;
  const patient = auth.patient;
  console.log("Patient from store:", patient);
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

  const beforeUpload = (file: File) => {
    const isImage = file.type.startsWith("image/");
    if (!isImage) message.error("Bạn chỉ có thể tải lên file hình ảnh!");
    return isImage ? false : Upload.LIST_IGNORE;
  };

  const handleUploadChange = ({ fileList }: { fileList: UploadFile[] }) => {
    setFileList(fileList);
    form.setFieldsValue({ image: fileList.length > 0 ? fileList[0].url : undefined });
  };

  const handleFinish = (values: Patient) => {
    console.log("Form values:", values);
    if (values.image) {
      console.log("Ảnh mới:", values.image);
    }
  };

  return (
    <div>
      <Form
        layout="vertical"
        form={form}
        onFinish={handleFinish}
        initialValues={{
          full_name: patient?.fullName || "",
          dob: dayjs(new Date(patient?.dob ?? "")),
          gender: patient?.gender || "male",
          address: patient?.address || "",
          phone: patient?.phone || "",
          email: patient?.email || "",
          image: fileList.length > 0 ? fileList[0] : null,
        }}
        className="flex flex-col md:flex-row gap-8 p-6 bg-white "
      >
        {/* Avatar upload */}
        <Form.Item name="image" className="w-1/2">
          <div className="flex flex-col items-center">
            <Avatar name={name || ""} src={image || ""} size="200" round={true} />

            <Upload
              fileList={fileList}
              onChange={handleUploadChange}
              beforeUpload={beforeUpload}
              showUploadList={false}
            >
              <Button icon={<UploadOutlined />} className="mt-4">
                Thay đổi ảnh đại diện
              </Button>
            </Upload>
          </div>
        </Form.Item>

        <div className="w-full md:w-2/3">
          <Form.Item
            label="Họ và tên"
            name="full_name"
            rules={[{ required: true, message: "Vui lòng nhập họ và tên" }]}
          >
            <Input placeholder="Nhập họ và tên" />
          </Form.Item>

          <Form.Item
            label="Ngày sinh"
            name="dob"
            rules={[{ required: true, message: "Vui lòng nhập ngày sinh" }]}
          >
            <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
          </Form.Item>
          <Form.Item
            label="Giới tính"
            name="gender"
            rules={[{ required: true, message: "Vui lòng chọn giới tính" }]}
          >
            <Select>
              <Select.Option value="male">Nam</Select.Option>
              <Select.Option value="female">Nữ</Select.Option>
              <Select.Option value="other">Khác</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item label="Địa chỉ" name="address">
            <Input placeholder="Nhập địa chỉ" />
          </Form.Item>

          <Form.Item label="Số điện thoại" name="phone">
            <Input placeholder="Nhập số điện thoại" />
          </Form.Item>

          <Form.Item label="Email" name="email">
            <Input type="email" placeholder="Nhập email" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              Lưu thông tin
            </Button>
          </Form.Item>
        </div>
      </Form>
    </div>
  );
}
