import { Gender } from "@/app/modules/hospital/enums/gender";
import { Order } from "@/app/modules/profile/types/order";

export const mockOrder: Order[] = [
  {
    order_id: "INV-20230922",
    patient: {
      patient_id: "p-001",
      updatedAt: "2023-09-20T10:00:00Z",
      createdAt: "2023-09-15T09:00:00Z",
      dob: "1990-01-01",
      user_id: "u-001",
      gender: Gender.Male,
      full_name: "Nguyễn Văn A",
      phone: "0987654321",
      address: "123 Đường ABC, Quận 1, TP.HCM",
    },
    status: "Completed",
    order_items: [
      {
        order_item_id: "oi-1",
        drug: {
          drug_id: "d-001",
          name: "Thuốc nhỏ mắt A",
        },
        price: 45000,
        quantity: 2,
      },
      {
        order_item_id: "oi-2",
        drug: {
          drug_id: "d-002",
          name: "Kháng sinh mắt B",
        },
        price: 78000,
        quantity: 1,
      },
    ],
  },
  {
    order_id: "INV-20230923",
    patient: {
      patient_id: "p-001",
      updatedAt: "2023-09-20T10:00:00Z",
      createdAt: "2023-09-15T09:00:00Z",
      dob: "1990-01-01",
      user_id: "u-001",
      gender: Gender.Male,
      full_name: "Nguyễn Văn A",
      phone: "0987654321",
      address: "123 Đường ABC, Quận 1, TP.HCM",
    },
    status: "Pending",
    order_items: [
      {
        order_item_id: "oi-3",
        drug: {
          drug_id: "d-003",
          name: "Thuốc nhỏ mắt C",
        },
        price: 52000,
        quantity: 1,
      },
      {
        order_item_id: "oi-4",
        drug: {
          drug_id: "d-004",
          name: "Thuốc nhỏ mắt D",
        },
        price: 63000,
        quantity: 2,
      },
    ],
  },
  {
    order_id: "INV-20230924",
    patient: {
      patient_id: "p-001",
      updatedAt: "2023-09-20T10:00:00Z",
      createdAt: "2023-09-15T09:00:00Z",
      dob: "1990-01-01",
      user_id: "u-001",
      gender: Gender.Male,
      full_name: "Nguyễn Văn A",
      phone: "0987654321",
      address: "123 Đường ABC, Quận 1, TP.HCM",
    },
    status: "Delivered",
    order_items: [
      {
        order_item_id: "oi-5",
        drug: {
          drug_id: "d-005",
          name: "Thuốc nhỏ mắt E",
        },
        price: 47000,
        quantity: 3,
      },
      {
        order_item_id: "oi-6",
        drug: {
          drug_id: "d-006",
          name: "Thuốc nhỏ mắt F",
        },
        price: 88000,
        quantity: 1,
      },
    ],
  },
  {
    order_id: "INV-20230925",
    patient: {
      patient_id: "p-001",
      updatedAt: "2023-09-20T10:00:00Z",
      createdAt: "2023-09-15T09:00:00Z",
      dob: "1990-01-01",
      user_id: "u-001",
      gender: Gender.Male,
      full_name: "Nguyễn Văn A",
      phone: "0987654321",
      address: "123 Đường ABC, Quận 1, TP.HCM",
    },
    status: "Cancelled",
    order_items: [
      {
        order_item_id: "oi-7",
        drug: {
          drug_id: "d-007",
          name: "Thuốc nhỏ mắt G",
        },
        price: 55000,
        quantity: 2,
      },
    ],
  },
];
