import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import {
  AuthApi,
  LoginFirebaseRequest,
  TokenResponse,
  SuccessResponse,
  ErrorResponse,
} from "@/app/modules/auth/apis/authApi";
import { AxiosError } from "axios";
import { useDispatch } from "react-redux";
import { setTokens } from "@/app/shares/stores/authSlice";

type LoginFirebaseOptions = Omit<
  UseMutationOptions<
    SuccessResponse<TokenResponse>,
    AxiosError<ErrorResponse>,
    LoginFirebaseRequest
  >,
  "mutationFn"
>;

export function useLoginFirebaseMutation(options?: LoginFirebaseOptions) {
  const dispatch = useDispatch();

  return useMutation<
    SuccessResponse<TokenResponse>,
    AxiosError<ErrorResponse>,
    LoginFirebaseRequest
  >({
    mutationFn: async (form: LoginFirebaseRequest) => {
      return await AuthApi.loginFirebase(form);
    },
    onSuccess: (res, variables, context) => {
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
