import { apiFetch } from "@/lib/api/client";
import type { TenantRole } from "@/types/auth";
import type {
  CreateStaffInput,
  Staff,
  StaffBranchesInput,
  StaffListFilters,
  StaffOptions,
  StaffPage,
  UpdateStaffInput,
} from "@/types/staff";

// School-wide endpoints (no X-Branch-Id). All need STAFF_MANAGE.

const json = (body: unknown) => JSON.stringify(body);
const staffPath = (id: string, suffix = "") =>
  `tenant/staff/${encodeURIComponent(id)}${suffix}`;

/** Query string for the list; empty filters are omitted. */
export const staffListQuery = (filters: StaffListFilters): string => {
  const params = new URLSearchParams();
  if (filters.status) params.set("status", filters.status);
  if (filters.role) params.set("role", filters.role);
  if (filters.branchId) params.set("branchId", filters.branchId);
  const search = filters.search?.trim();
  if (search) params.set("search", search.slice(0, 100));
  params.set("page", String(filters.page));
  params.set("pageSize", String(Math.min(filters.pageSize, 100)));
  return params.toString();
};

export const fetchStaffOptions = () =>
  apiFetch<StaffOptions>("tenant/staff/options");

export const fetchStaffList = (filters: StaffListFilters) =>
  apiFetch<StaffPage>(`tenant/staff?${staffListQuery(filters)}`);

export const fetchStaffMember = (id: string) => apiFetch<Staff>(staffPath(id));

export const createStaff = (input: CreateStaffInput) =>
  apiFetch<Staff>("tenant/staff", { method: "POST", body: json(input) });

export const updateStaff = (id: string, patch: UpdateStaffInput) =>
  apiFetch<Staff>(staffPath(id), { method: "PATCH", body: json(patch) });

export const changeStaffRole = (id: string, role: TenantRole) =>
  apiFetch<Staff>(staffPath(id, "/role"), {
    method: "PATCH",
    body: json({ role }),
  });

export const changeStaffBranches = (id: string, input: StaffBranchesInput) =>
  apiFetch<Staff>(staffPath(id, "/branches"), {
    method: "PUT",
    body: json(input),
  });

export const resetStaffPassword = (id: string, temporaryPassword: string) =>
  apiFetch<Staff>(staffPath(id, "/reset-password"), {
    method: "POST",
    body: json({ temporaryPassword }),
  });

export const disableStaff = (id: string) =>
  apiFetch<Staff>(staffPath(id, "/disable"), { method: "POST" });

export const enableStaff = (id: string) =>
  apiFetch<Staff>(staffPath(id, "/enable"), { method: "POST" });
