import { apiFetch } from "@/lib/api/client";
import type { VehicleClassList } from "@/types/vehicle-class";

export const fetchVehicleClasses = () =>
  apiFetch<VehicleClassList>("tenant/vehicle-classes");
