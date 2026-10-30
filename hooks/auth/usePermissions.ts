import { useCallback } from "react";
import { useMe } from "@/hooks/my-profile/useProfile";
import type { TenantPermission } from "@/shared/constants/permissions";
import type { TenantRole } from "@/types/auth";

/**
 * UX-only permission checks for the current tenant user.
 * Fails closed: returns `false` while loading or when `/me` failed.
 * The backend remains the real authorization boundary.
 */
export const usePermissions = () => {
  const { data, isLoading } = useMe();
  const permissions = data?.user.permissions;
  const role = data?.user.role;

  const hasPermission = useCallback(
    (permission: TenantPermission) =>
      permissions?.includes(permission) ?? false,
    [permissions],
  );

  const hasRole = useCallback(
    (...roles: TenantRole[]) => (role ? roles.includes(role) : false),
    [role],
  );

  return { hasPermission, hasRole, isLoading };
};
