import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useDispatch } from "react-redux";
import { setTokens } from "@/app/shares/stores/authSlice";
import {
  AuthApi,
  LoginRequest,
  SuccessResponse,
  TokenResponse,
  ErrorResponse,
} from "@/app/modules/auth/apis/authApi";

type LoginOptions = Omit<
  UseMutationOptions<SuccessResponse<TokenResponse>, AxiosError<ErrorResponse>, LoginRequest>,
  "mutationFn"
>;

export function useLoginMutation(options?: LoginOptions) {
  const dispatch = useDispatch();

  return useMutation<SuccessResponse<TokenResponse>, AxiosError<ErrorResponse>, LoginRequest>({
    mutationFn: async (form: LoginRequest) => {
      return await AuthApi.login(form);
    },
    onSuccess: (res, variables, context) => {
      // lưu access token vào redux
      dispatch(
        setTokens({
          accessToken: res.data?.access_token || "",
          refreshToken: "",
          userId: res.data?.user_id || "",
          role: res.data?.role || "",
        }),
      );
      options?.onSuccess?.(res, variables, context);
    },
    onError: (err, variables, context) => {
      options?.onError?.(err, variables, context);
    },
  });
}
