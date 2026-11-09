import type { District } from "@/shared/constants/districts";
import type { Licence, LicenceChange, LicenceInput } from "@/types/licence";
import type { DrivingSchoolGrade, VehicleClass } from "@/types/vehicle-class";

export type { LicenceInput };

export type { District };

export type BranchStatus = "ACTIVE" | "CLOSED";

export type Branch = {
  id: string;
  name: string;
  address: string;
  district: District;
  /** Always "+94XXXXXXXXX". */
  phone: string;
  status: BranchStatus;
  /** ISO timestamp. */
  closedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

/** `isDefault` = the signed-in user's own default branch. */
export type BranchListItem = Branch & {
  isDefault: boolean;
  profile: BranchProfileSummary;
};

/** `GET /tenant/branches/:id`. Create/edit/close/reopen responses lack `profile`. */
export type BranchDetail = Branch & { profile: BranchProfileSummary };

export type BranchList = { items: BranchListItem[] };

export type LockedOutStaff = { id: string; fullName: string; email: string };

export type CloseBranchResponse = Branch & { lockedOutStaff: LockedOutStaff[] };

export type BranchContext = { branch: { id: string; name: string } };

export type BranchInput = {
  name: string;
  address: string;
  district: District;
  phone: string;
};

// ── Branch profile: licence, grade and offered vehicle classes ──────────────

export type BranchLicence = Licence;

export type ReadinessBlocker =
  | { code: "BRANCH_LICENCE_MISSING" }
  | { code: "NO_VEHICLE_CLASSES_OFFERED" };

export type ReadinessWarning =
  | { code: "BRANCH_LICENCE_EXPIRED"; expiredOn: string }
  | { code: "BRANCH_LICENCE_EXPIRING"; expiresOn: string; daysLeft: number };

export type BranchReadiness = {
  /** True when there are no blockers (warnings may exist). */
  operational: boolean;
  blockers: ReadinessBlocker[];
  warnings: ReadinessWarning[];
};

export type BranchProfile = {
  branchId: string;
  currentLicence: BranchLicence | null;
  /** Every licence including the current one, newest first. */
  licenceHistory: BranchLicence[];
  /** For the current grade; empty without a licence. */
  permittedVehicleClasses: VehicleClass[];
  /** DMT order. */
  offeredVehicleClasses: VehicleClass[];
  readiness: BranchReadiness;
};

/** Attached to branch list items and the branch detail. */
export type BranchProfileSummary = {
  grade: DrivingSchoolGrade | null;
  licenceNumber: string | null;
  licenceExpiresOn: string | null;
  /** Codes, DMT order. */
  offeredVehicleClasses: string[];
  readiness: BranchReadiness;
};

/** Record/renew/correct responses: classes dropped by a lower grade. */
export type LicenceChangeResponse = BranchProfile & LicenceChange;
