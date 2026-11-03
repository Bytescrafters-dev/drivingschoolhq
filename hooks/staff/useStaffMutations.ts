import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  changeStaffBranches,
  changeStaffRole,
  createStaff,
  disableStaff,
  enableStaff,
  resetStaffPassword,
  updateStaff,
} from "@/lib/api/staff";
import type { ApiError } from "@/lib/api/client";
import { getApiErrorCode } from "@/lib/api/error-messages";
import { queryKeys } from "@/shared/constants/query-keys";
import type { TenantRole } from "@/types/auth";
import type {
  CreateStaffInput,
  Staff,
  StaffBranchesInput,
  UpdateStaffInput,
} from "@/types/staff";

// Errors that mean our cached view is stale.
const STALE_ROW_CODES = new Set([
  "STAFF_MANAGEMENT_DENIED",
  "STAFF_NOT_FOUND",
  "STAFF_ALREADY_DISABLED",
  "STAFF_ALREADY_ACTIVE",
]);

/**
 * Shared cache handling. Nobody can manage themselves, so staff changes never
 * affect `me`. `onSuccess` returns the promise so `mutateAsync` resolves after
 * the list/detail refetched.
 */
const useStaffMutation = <TVariables>(
  mutationFn: (variables: TVariables) => Promise<Staff>,
) => {
  const queryClient = useQueryClient();
  return useMutation<Staff, ApiError, TVariables>({
    mutationFn,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.staff.all }),
    onError: (error) => {
      const code = getApiErrorCode(error);
      if (code && STALE_ROW_CODES.has(code)) {
        void queryClient.invalidateQueries({ queryKey: queryKeys.staff.all });
      } else if (code === "BRANCH_ACCESS_NOT_GRANTABLE") {
        void queryClient.invalidateQueries({
          queryKey: queryKeys.staff.options,
        });
      }
    },
  });
};

export const useCreateStaff = () =>
  useStaffMutation((input: CreateStaffInput) => createStaff(input));

export const useUpdateStaff = () =>
  useStaffMutation(({ id, patch }: { id: string; patch: UpdateStaffInput }) =>
    updateStaff(id, patch),
  );

export const useChangeStaffRole = () =>
  useStaffMutation(({ id, role }: { id: string; role: TenantRole }) =>
    changeStaffRole(id, role),
  );

export const useChangeStaffBranches = () =>
  useStaffMutation(({ id, input }: { id: string; input: StaffBranchesInput }) =>
    changeStaffBranches(id, input),
  );

export const useResetStaffPassword = () =>
  useStaffMutation(
    ({ id, temporaryPassword }: { id: string; temporaryPassword: string }) =>
      resetStaffPassword(id, temporaryPassword),
  );

export const useDisableStaff = () =>
  useStaffMutation((id: string) => disableStaff(id));

export const useEnableStaff = () =>
  useStaffMutation((id: string) => enableStaff(id));
