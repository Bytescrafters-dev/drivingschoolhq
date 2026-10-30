import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { changePassword, fetchMe } from "@/lib/api/auth";
import type { ApiError } from "@/lib/api/client";
import { queryKeys } from "@/shared/constants/query-keys";
import type { ChangePasswordInput } from "@/types/auth";

/**
 * Current tenant user, tenant and accessible branches (`GET /tenant/auth/me`).
 * Shared cache entry: every caller reuses one request.
 */
export const useMe = () =>
  useQuery({
    queryKey: queryKeys.me,
    queryFn: fetchMe,
  });

/**
 * Changes the signed-in user's password. The current session continues;
 * the backend signs out the user's other sessions.
 */
export const useChangePassword = () => {
  const queryClient = useQueryClient();

  return useMutation<{ ok: true }, ApiError, ChangePasswordInput>({
    mutationFn: changePassword,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.me }),
  });
};
