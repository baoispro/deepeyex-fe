import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import {
  InitMedicalRecordAndDiagnosisRequest,
  InitMedicalRecordAndDiagnosisResponse,
  MedicalRecordApi,
} from "../../../apis/medical_record/medicalRecordApi";

type Options = Omit<
  UseMutationOptions<
    InitMedicalRecordAndDiagnosisResponse, // data trả về
    Error, // error type
    InitMedicalRecordAndDiagnosisRequest // input payload
  >,
  "mutationFn"
>;

const useInitMedicalRecordAndDiagnosisMutation = (options?: Options) => {
  return useMutation({
    mutationFn: async (
      payload: InitMedicalRecordAndDiagnosisRequest,
    ): Promise<InitMedicalRecordAndDiagnosisResponse> => {
      return MedicalRecordApi.initRecordAndDiagnosis(payload);
    },
    ...options,
  });
};

export { useInitMedicalRecordAndDiagnosisMutation };
