import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  closeBranch,
  createBranch,
  reopenBranch,
  setDefaultBranch,
  updateBranch,
} from "@/lib/api/branches";
import type { ApiError } from "@/lib/api/client";
import { queryKeys } from "@/shared/constants/query-keys";
import type { Branch, BranchInput, CloseBranchResponse } from "@/types/branch";

/**
 * Branch changes affect the branch lists and `me` (switcher list, defaults).
 * Returning the promise makes `mutateAsync` resolve only after both refetched,
 * so callers can e.g. switch to a new branch that is already in `me.branches`.
 */
const useInvalidateBranches = () => {
  const queryClient = useQueryClient();
  return (extraKeys: readonly (readonly unknown[])[] = []) =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.branches.all }),
      queryClient.invalidateQueries({ queryKey: queryKeys.me }),
      ...extraKeys.map((queryKey) =>
        queryClient.invalidateQueries({ queryKey }),
      ),
    ]);
};

export const useCreateBranch = () => {
  const invalidate = useInvalidateBranches();
  return useMutation<Branch, ApiError, BranchInput>({
    mutationFn: createBranch,
    onSuccess: () => invalidate(),
  });
};

export const useUpdateBranch = () => {
  const invalidate = useInvalidateBranches();
  return useMutation<
    Branch,
    ApiError,
    { id: string; patch: Partial<BranchInput> }
  >({
    mutationFn: ({ id, patch }) => updateBranch(id, patch),
    onSuccess: () => invalidate(),
  });
};

export const useCloseBranch = () => {
  const invalidate = useInvalidateBranches();
  return useMutation<CloseBranchResponse, ApiError, string>({
    mutationFn: closeBranch,
    onSuccess: () =>
      invalidate([queryKeys.staff.all, queryKeys.instructors.all]),
  });
};

export const useReopenBranch = () => {
  const invalidate = useInvalidateBranches();
  return useMutation<Branch, ApiError, string>({
    mutationFn: reopenBranch,
    onSuccess: () =>
      invalidate([queryKeys.staff.all, queryKeys.instructors.all]),
  });
};

export const useSetDefaultBranch = () => {
  const invalidate = useInvalidateBranches();
  return useMutation<Branch, ApiError, string>({
    mutationFn: setDefaultBranch,
    onSuccess: () => invalidate(),
  });
};
