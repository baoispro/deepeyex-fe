import { QueryKey, useQuery, UseQueryOptions } from "@tanstack/react-query";
import { QueryKeyEnum } from "@/app/shares/enums/queryKey";
import { GetDrugByIdResponse } from "../../../types/response";
import { DrugApi } from "../../../apis/drug/drugApi";

type Options = Omit<
  UseQueryOptions<GetDrugByIdResponse, Error, GetDrugByIdResponse, QueryKey>,
  "queryKey" | "queryFn"
>;

export function useGetDrugByIdQuery(drugId: string, options?: Options) {
  return useQuery({
    queryKey: [QueryKeyEnum.Drug, "byId", drugId],
    queryFn: () => DrugApi.getById(drugId),
    enabled: !!drugId,
    ...options,
  });
}
