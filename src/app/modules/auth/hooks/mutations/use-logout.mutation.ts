import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { AuthApi, SuccessResponse } from "../../apis/authApi";

type LogoutOptions = Omit<UseMutationOptions<SuccessResponse, Error, void>, "mutationFn">;

export function useLogoutMutation(options?: LogoutOptions) {
  return useMutation({
    mutationFn: async () => {
      const res = await AuthApi.logout();
      return res;
    },
    ...options,
  });
}
