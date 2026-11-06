import { apiFetch } from "@/lib/api/client";
import type {
  BranchProfile,
  LicenceChangeResponse,
  LicenceInput,
} from "@/types/branch";

// Not branch-scoped (no X-Branch-Id): the branch is in the path.

const base = (branchId: string) =>
  `tenant/branches/${encodeURIComponent(branchId)}`;

export const fetchBranchProfile = (branchId: string) =>
  apiFetch<BranchProfile>(`${base(branchId)}/profile`);

/** First licence or a renewal (the previous one stays in the history). */
export const recordLicence = (branchId: string, input: LicenceInput) =>
  apiFetch<LicenceChangeResponse>(`${base(branchId)}/licence`, {
    method: "POST",
    body: JSON.stringify(input),
  });

/** Fixes the current licence in place; send changed fields only. */
export const correctLicence = (
  branchId: string,
  patch: Partial<LicenceInput>,
) =>
  apiFetch<LicenceChangeResponse>(`${base(branchId)}/licence`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });

/** Replaces the offered set (`[]` allowed). */
export const setOfferedVehicleClasses = (branchId: string, codes: string[]) =>
  apiFetch<BranchProfile>(`${base(branchId)}/vehicle-classes`, {
    method: "PUT",
    body: JSON.stringify({ codes }),
  });
