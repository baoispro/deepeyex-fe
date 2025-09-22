import { QueryKey, useQuery, UseQueryOptions } from "@tanstack/react-query";
import { HospitalApi } from "../../../apis/patient/hospitalApi";
import { QueryKeyEnum } from "@/app/shares/enums/queryKey";
import { SearchByAddressResponse } from "../../../types/response";

type Options = Omit<
  UseQueryOptions<SearchByAddressResponse, Error, SearchByAddressResponse, QueryKey>,
  "queryKey" | "queryFn"
>;

export function useGetHospitalbyAddressQuery(keyword: string, options?: Options) {
  return useQuery({
    queryKey: [QueryKeyEnum.Hospital, "address"],
    queryFn: () => HospitalApi.searchByAddress(keyword),
    ...options,
  });
}
