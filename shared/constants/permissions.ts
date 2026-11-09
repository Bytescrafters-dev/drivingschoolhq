/**
 * Tenant permission strings returned in `GET /tenant/auth/me` (`user.permissions`).
 * Extend as backend chunks add permissions.
 * Frontend checks are UX only; the backend is the authorization boundary.
 */
export const TenantPermission = {
  BRANCHES_MANAGE: "BRANCHES_MANAGE",
  STAFF_MANAGE: "STAFF_MANAGE",
  INSTRUCTORS_VIEW: "INSTRUCTORS_VIEW",
  INSTRUCTORS_MANAGE: "INSTRUCTORS_MANAGE",
} as const;

export type TenantPermission =
  (typeof TenantPermission)[keyof typeof TenantPermission];
