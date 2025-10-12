import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { UploadFileResponse } from "@/app/modules/hospital/types/response"; // chỉnh lại đường dẫn đúng với project bạn
import { AxiosError } from "axios";
import { UploadApi } from "../../../apis/upload/uploadApi";

type UploadFileOptions = Omit<
  UseMutationOptions<UploadFileResponse, AxiosError, File>,
  "mutationFn"
>;

function useUploadFileMutation(options?: UploadFileOptions) {
  return useMutation<UploadFileResponse, AxiosError, File>({
    mutationFn: (file) => UploadApi.uploadFile(file),
    ...options,
  });
}

export { useUploadFileMutation };
