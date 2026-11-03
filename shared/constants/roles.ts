import type { TenantRole } from "@/types/auth";

/** Highest first. */
export const TENANT_ROLES: TenantRole[] = [
  "OWNER",
  "ADMIN",
  "BRANCH_MANAGER",
  "FRONT_DESK",
  "INSTRUCTOR",
  "ACCOUNTANT",
];

export const ROLE_LABELS: Record<TenantRole, string> = {
  OWNER: "Owner",
  ADMIN: "Admin",
  BRANCH_MANAGER: "Branch manager",
  FRONT_DESK: "Front desk",
  INSTRUCTOR: "Instructor",
  ACCOUNTANT: "Accountant",
};

export const roleLabel = (role: string) =>
  ROLE_LABELS[role as TenantRole] ?? role;
