/**
 * Platform permission strings returned by `GET /platform/auth/me`.
 * Frontend checks are UX only; the backend is the authorization boundary.
 */
export const PlatformPermission = {
  PLANS_READ: "PLANS_READ",
  PLANS_MANAGE: "PLANS_MANAGE",
  TENANTS_READ: "TENANTS_READ",
  TENANTS_MANAGE: "TENANTS_MANAGE",
  SUBSCRIPTIONS_READ: "SUBSCRIPTIONS_READ",
  SUBSCRIPTIONS_MANAGE: "SUBSCRIPTIONS_MANAGE",
  PLATFORM_AUDIT_READ: "PLATFORM_AUDIT_READ",
} as const;

export type PlatformPermission =
  (typeof PlatformPermission)[keyof typeof PlatformPermission];
