import z from "zod";
import { updatePasswordSchema } from "../schemas/resetPasswordByEmail.schema";

type UpdatePasswordByEmailBody = z.infer<typeof updatePasswordSchema>;

export type { UpdatePasswordByEmailBody };
