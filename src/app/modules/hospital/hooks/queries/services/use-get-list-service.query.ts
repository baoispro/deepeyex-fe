import { QueryKey, useQuery, UseQueryOptions } from "@tanstack/react-query";
import { QueryKeyEnum } from "@/app/shares/enums/queryKey";
import { ListServicesResponse } from "../../../types/response";
import { ServiceApi } from "../../../apis/service/serviceApi";

type Options = Omit<
  UseQueryOptions<ListServicesResponse, Error, ListServicesResponse, QueryKey>,
  "queryKey" | "queryFn"
>;

export function useGetAllServicesByDoctorIdQuery(doctorId: string, options?: Options) {
  return useQuery({
    queryKey: [QueryKeyEnum.Service, "all", doctorId],
    queryFn: () => ServiceApi.getServicesByDoctorId(doctorId),
    ...options,
  });
}
