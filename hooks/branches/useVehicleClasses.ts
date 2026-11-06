import { useQuery } from "@tanstack/react-query";
import { fetchVehicleClasses } from "@/lib/api/vehicle-classes";
import { queryKeys } from "@/shared/constants/query-keys";

/** The 13 DMT classes in DMT order. Fixed reference data. */
export const useVehicleClasses = () =>
  useQuery({
    queryKey: queryKeys.vehicleClasses,
    queryFn: fetchVehicleClasses,
    select: (data) => data.items,
    staleTime: Infinity,
  });
