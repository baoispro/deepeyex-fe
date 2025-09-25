import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { UserApi } from "@/app/modules/auth/apis/userApi";
import { SuccessResponse } from "@/app/modules/auth/apis/authApi";
import { UpdatePasswordByEmailBody } from "@/app/modules/auth/types/body";

type ResetPasswordOptions = Omit<
  UseMutationOptions<SuccessResponse, Error, UpdatePasswordByEmailBody>,
  "mutationFn"
>;

function useResetPasswordMutation(options?: ResetPasswordOptions) {
  return useMutation({
    mutationFn: async (payload: UpdatePasswordByEmailBody) => {
      const res = await UserApi.resetPasswordByEmail(payload);
      return res;
    },
    ...options,
  });
}

export { useResetPasswordMutation };
