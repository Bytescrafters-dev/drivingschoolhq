import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getErrorMessage } from "@/lib/utils";
import { apiFetch } from "@/lib/api/client";
// import type { PlatformAdminMe } from "@/types/auth";

export const PROFILE_QUERY_KEY = ["profile", "me"];

/**
 * Current platform admin (identity + permissions).
 * Cached under `PROFILE_QUERY_KEY`, so every caller shares one request.
 */
// export const useMe = () =>
//   useQuery({
//     queryKey: PROFILE_QUERY_KEY,
//     queryFn: () => apiFetch<PlatformAdminMe>("tenant/auth/me"),
//   });

type ChangePasswordInput = { currentPassword: string; newPassword: string };

const changePasswordRequest = async (
  data: ChangePasswordInput,
): Promise<boolean> => {
  const response = await fetch("/api/auth/change-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const msg =
      (await response.json().catch(() => ({}))).message ??
      "Failed to change password!";
    throw new Error(msg);
  }
  return true;
};

export const useProfile = () => {
  const queryClient = useQueryClient();

  const changePasswordMutation = useMutation<
    boolean,
    Error,
    ChangePasswordInput
  >({
    mutationFn: changePasswordRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: PROFILE_QUERY_KEY,
      });
    },
  });

  return {
    changePassword: changePasswordMutation.mutateAsync,
    changingPassword: changePasswordMutation.isPending,
    changePasswordError: getErrorMessage(changePasswordMutation.error),
  };
};
