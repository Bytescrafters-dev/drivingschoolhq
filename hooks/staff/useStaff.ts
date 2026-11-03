import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  fetchStaffList,
  fetchStaffMember,
  fetchStaffOptions,
} from "@/lib/api/staff";
import { ApiError } from "@/lib/api/client";
import { queryKeys } from "@/shared/constants/query-keys";
import type { StaffListFilters } from "@/types/staff";

// Callers pass `enabled = hasPermission(STAFF_MANAGE)` so users without it
// never call /tenant/staff.

/** Server-paginated list; keeps the previous page visible while the next loads. */
export const useStaffList = (filters: StaffListFilters, enabled: boolean) =>
  useQuery({
    queryKey: queryKeys.staff.list(filters),
    queryFn: () => fetchStaffList(filters),
    placeholderData: keepPreviousData,
    enabled,
  });

/** One staff member; a 404 (unknown or not visible) is final. */
export const useStaffMember = (id: string | null, enabled: boolean) =>
  useQuery({
    queryKey: queryKeys.staff.detail(id ?? ""),
    queryFn: () => fetchStaffMember(id as string),
    enabled: enabled && Boolean(id),
    retry: (failureCount, error) =>
      !(error instanceof ApiError && error.status < 500) && failureCount < 1,
  });

/** What the signed-in user may grant. Always refetched when a form opens. */
export const useStaffOptions = (enabled: boolean) =>
  useQuery({
    queryKey: queryKeys.staff.options,
    queryFn: fetchStaffOptions,
    staleTime: 0,
    enabled,
  });
