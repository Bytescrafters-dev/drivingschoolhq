import { apiFetch } from "@/lib/api/client";
import type {
  InstructorCandidates,
  InstructorDetail,
  InstructorLicenceChange,
  InstructorList,
  InstructorProfileState,
} from "@/types/instructor";
import type { LicenceInput } from "@/types/licence";

// Only the list and candidates are branch-scoped (X-Branch-Id). `userId` is
// the staff member's id, not the profile id.

const base = (userId: string) =>
  `tenant/instructors/${encodeURIComponent(userId)}`;

export const fetchInstructors = (
  branchId: string,
  status: InstructorProfileState | null,
) =>
  apiFetch<InstructorList>(
    status
      ? `tenant/instructors?profileStatus=${encodeURIComponent(status)}`
      : "tenant/instructors",
    { branchId },
  );

export const fetchInstructorCandidates = (branchId: string) =>
  apiFetch<InstructorCandidates>("tenant/instructors/candidates", {
    branchId,
  });

export const fetchInstructor = (userId: string) =>
  apiFetch<InstructorDetail>(base(userId));

export const fetchMyInstructorProfile = () =>
  apiFetch<InstructorDetail>("tenant/me/instructor-profile");

/** Creates the profile with its first licence; every permitted class is pre-selected. */
export const createInstructorProfile = (userId: string, input: LicenceInput) =>
  apiFetch<InstructorDetail>(`${base(userId)}/profile`, {
    method: "POST",
    body: JSON.stringify(input),
  });

/** Renewal: the previous licence stays in the history. */
export const recordInstructorLicence = (userId: string, input: LicenceInput) =>
  apiFetch<InstructorLicenceChange>(`${base(userId)}/licence`, {
    method: "POST",
    body: JSON.stringify(input),
  });

/** Fixes the current licence in place; send changed fields only. */
export const correctInstructorLicence = (
  userId: string,
  patch: Partial<LicenceInput>,
) =>
  apiFetch<InstructorLicenceChange>(`${base(userId)}/licence`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });

/** Replaces the qualified set (`[]` allowed). */
export const setInstructorClasses = (userId: string, codes: string[]) =>
  apiFetch<InstructorDetail>(`${base(userId)}/vehicle-classes`, {
    method: "PUT",
    body: JSON.stringify({ codes }),
  });

export const inactivateInstructor = (userId: string) =>
  apiFetch<InstructorDetail>(`${base(userId)}/inactivate`, { method: "POST" });

export const reactivateInstructor = (userId: string) =>
  apiFetch<InstructorDetail>(`${base(userId)}/reactivate`, { method: "POST" });
