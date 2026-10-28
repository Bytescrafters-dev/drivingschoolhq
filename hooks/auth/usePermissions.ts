import { useCallback } from "react";
import { useMe } from "@/hooks/my-profile/useProfile";
import type { PlatformPermission } from "@/shared/constants/permissions";

/**
 * UX-only permission checks for the current platform admin.
 * Fails closed: returns `false` while loading or when `/me` failed.
 * The backend remains the real authorization boundary.
 */
export const usePermissions = () => {
  const { data, isLoading } = useMe();
  const permissions = data?.permissions;

  const hasPermission = useCallback(
    (permission: PlatformPermission) =>
      permissions?.includes(permission) ?? false,
    [permissions],
  );

  return { hasPermission, isLoading };
};
