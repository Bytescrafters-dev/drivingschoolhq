import type { District } from "@/shared/constants/districts";

/**
 * Backend token pair from `POST /tenant/auth/login` and `/tenant/auth/refresh`.
 * SERVER-SIDE ONLY: handled by the BFF and stored in httpOnly cookies.
 * Never return this to the browser.
 */
export type TenantAuthTokens = {
  tokenType: "Bearer";
  accessToken: string;
  /** Seconds (900 by default). */
  accessTokenExpiresIn: number;
  refreshToken: string;
  /** ISO timestamp (7 days by default). */
  refreshTokenExpiresAt: string;
  mustChangePassword: boolean;
};

/** Safe metadata returned by the BFF auth routes. */
export type LoginResponse = { ok: true; mustChangePassword: boolean };

export type LoginInput = { dsCode: string; email: string; password: string };

export type ChangePasswordInput = {
  currentPassword: string;
  newPassword: string;
};

export type TenantRole =
  | "OWNER"
  | "ADMIN"
  | "BRANCH_MANAGER"
  | "FRONT_DESK"
  | "INSTRUCTOR"
  | "ACCOUNTANT";

export type TenantUserBranchAccess = "ALL" | "SELECTED";

export type TenantAccessStatus = "ACTIVE" | "GRACE_PERIOD" | "SUSPENDED";

export type TenantMeBranch = {
  id: string;
  name: string;
  district: District;
  isDefault: boolean;
};

/** `GET /tenant/auth/me` */
export type TenantMe = {
  user: {
    id: string;
    email: string;
    fullName: string;
    /** "+94…", or null when not set. */
    phone: string | null;
    role: TenantRole;
    mustChangePassword: boolean;
    branchAccess: TenantUserBranchAccess;
    defaultBranchId: string | null;
    /**
     * Permission strings. Typed loosely: new permissions appear over time and
     * unknown values are harmless. Compare against `TenantPermission`.
     */
    permissions: string[];
  };
  tenant: {
    id: string;
    dsCode: string;
    displayName: string;
    accessStatus: TenantAccessStatus | null;
  };
  branches: TenantMeBranch[];
};

/** `PATCH /tenant/me` response. */
export type MyProfile = {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  nic: string | null;
  role: TenantRole;
};

/** `phone: null` clears it (not allowed for the owner). */
export type UpdateMyProfileInput = Partial<{
  fullName: string;
  phone: string | null;
}>;
