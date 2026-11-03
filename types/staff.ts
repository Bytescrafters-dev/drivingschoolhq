import type { TenantRole, TenantUserBranchAccess } from "@/types/auth";
import type { Branch, BranchStatus } from "@/types/branch";
import type { PaginatedResponse } from "@/types/pagination";

export type StaffStatus = "ACTIVE" | "DISABLED";

/** `GET /tenant/staff/options`: what the signed-in user may grant. */
export type StaffOptions = {
  /** Roles you may assign, highest first (never OWNER). */
  roles: TenantRole[];
  /** You have ALL access, so you may grant ALL. */
  canGrantAll: boolean;
  /** ACTIVE branches you may grant. */
  branches: Branch[];
};

export type StaffBranch = { id: string; name: string; status: BranchStatus };

export type Staff = {
  id: string;
  email: string;
  fullName: string;
  /** "+94771234567" */
  phone: string | null;
  nic: string | null;
  role: TenantRole;
  status: StaffStatus;
  /** Still on a temporary password. */
  mustChangePassword: boolean;
  lastLoginAt: string | null;
  disabledAt: string | null;
  branchAccess: TenantUserBranchAccess;
  /** SELECTED only; `[]` for ALL. */
  branches: StaffBranch[];
  defaultBranchId: string;
  /** false → can't sign in (all their branches are closed). */
  hasActiveBranch: boolean;
  /** Whether YOU may change this person. Decided by the backend. */
  canManage: boolean;
  createdAt: string;
  updatedAt: string;
};

export type StaffPage = PaginatedResponse<Staff>;

export type StaffListFilters = {
  status?: StaffStatus;
  role?: TenantRole;
  branchId?: string;
  search?: string;
  page: number;
  pageSize: number;
};

export type CreateStaffInput = {
  fullName: string;
  email: string;
  phone?: string | null;
  nic?: string | null;
  role: TenantRole;
  branchAccess: TenantUserBranchAccess;
  branchIds?: string[];
  defaultBranchId: string;
  temporaryPassword: string;
};

/** `null` clears phone/NIC. */
export type UpdateStaffInput = Partial<{
  fullName: string;
  email: string;
  phone: string | null;
  nic: string | null;
}>;

export type StaffBranchesInput = {
  branchAccess: TenantUserBranchAccess;
  branchIds: string[];
  defaultBranchId: string;
};
