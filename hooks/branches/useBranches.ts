import { useQuery } from "@tanstack/react-query";
import { fetchBranch, fetchBranches } from "@/lib/api/branches";
import { ApiError } from "@/lib/api/client";
import { queryKeys } from "@/shared/constants/query-keys";

/** Branches the user can access (ACTIVE only unless `includeClosed`), oldest first. */
export const useBranches = (includeClosed: boolean) =>
  useQuery({
    queryKey: queryKeys.branches.list(includeClosed),
    queryFn: () => fetchBranches(includeClosed),
  });

/** One branch; disabled while `id` is null. A 404 is final (not retried). */
export const useBranch = (id: string | null) =>
  useQuery({
    queryKey: queryKeys.branches.detail(id ?? ""),
    queryFn: () => fetchBranch(id as string),
    enabled: Boolean(id),
    retry: (failureCount, error) =>
      !(error instanceof ApiError && error.status < 500) && failureCount < 1,
  });
