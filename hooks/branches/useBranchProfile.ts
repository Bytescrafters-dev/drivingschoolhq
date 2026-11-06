import { useQuery } from "@tanstack/react-query";
import { fetchBranchProfile } from "@/lib/api/branch-profile";
import { ApiError } from "@/lib/api/client";
import { queryKeys } from "@/shared/constants/query-keys";

/** Licence, history, classes and readiness. A 404 is final (not retried). */
export const useBranchProfile = (branchId: string) =>
  useQuery({
    queryKey: queryKeys.branches.profile(branchId),
    queryFn: () => fetchBranchProfile(branchId),
    retry: (failureCount, error) =>
      !(error instanceof ApiError && error.status < 500) && failureCount < 1,
  });
