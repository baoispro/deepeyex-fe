import { z } from "zod";

const validateDob = (val: string) => {
  const date = new Date(val);
  if (isNaN(date.getTime())) return false;

  const ageDifMs = Date.now() - date.getTime();
  const ageDate = new Date(ageDifMs);
  const age = Math.abs(ageDate.getUTCFullYear() - 1970);

  return age >= 0 && age <= 200;
};

const phoneRegex = /^[0-9]{9,11}$/;

const nameRegex = /^[\p{L}\s]+$/u;
export const createPatientSchema = z.object({
  user_id: z.uuid({ message: "UserID phải là UUID hợp lệ" }),

  full_name: z
    .string()
    .min(1, "Họ tên không được để trống")
    .regex(nameRegex, "Họ tên không được chứa số hoặc ký tự đặc biệt"),

  dob: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), { message: "Ngày sinh không hợp lệ" })
    .refine(validateDob, { message: "Tuổi phải trong khoảng 0–200" }),

  gender: z.enum(["male", "female"], {
    message: "Giới tính phải là male hoặc female",
  }),

  address: z.string().optional(),

  phone: z
    .string()
    .regex(phoneRegex, "Số điện thoại phải là số và có từ 9 đến 11 chữ số")
    .optional(),

  email: z.email("Email không hợp lệ"),

  avatar: z
    .array(
      z.object({
        uid: z.string(),
        name: z.string(),
        size: z.number().optional(),
        type: z.string().optional(),
        originFileObj: z.instanceof(File).optional(),
      }),
    )
    .optional()
    .refine((files) => {
      if (!files || files.length === 0) return true;

      return files.every((file) => {
        if (file.originFileObj) {
          return file.originFileObj.size < 5 * 1024 * 1024;
        }
        return true;
      });
    }, "Mỗi file ảnh phải nhỏ hơn 5MB"),
});

export type CreatePatientBody = z.infer<typeof createPatientSchema>;
