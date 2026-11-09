import type { TenantRole } from "@/types/auth";
import type { Licence, LicenceChange } from "@/types/licence";
import type { DrivingSchoolGrade, VehicleClass } from "@/types/vehicle-class";

/** No profile = SETUP_REQUIRED. Separate from the staff status. */
export type InstructorProfileState = "SETUP_REQUIRED" | "ACTIVE" | "INACTIVE";

export type InstructorUser = {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  role: TenantRole;
  /** Staff status: can sign in. */
  status: "ACTIVE" | "DISABLED";
};

export type InstructorProfileSummary = {
  id: string;
  status: "ACTIVE" | "INACTIVE";
  inactivatedAt: string | null;
  grade: DrivingSchoolGrade | null;
  licenceNumber: string | null;
  /** 'YYYY-MM-DD' */
  licenceExpiresOn: string | null;
  createdAt: string;
};

export type InstructorBlocker =
  | { code: "INSTRUCTOR_SETUP_REQUIRED" }
  | { code: "STAFF_DISABLED" }
  | { code: "INSTRUCTOR_INACTIVE" }
  | { code: "NO_QUALIFIED_VEHICLE_CLASSES" };

export type InstructorWarning =
  | { code: "INSTRUCTOR_LICENCE_EXPIRED"; expiredOn: string }
  | {
      code: "INSTRUCTOR_LICENCE_EXPIRING";
      expiresOn: string;
      daysLeft: number;
    };

export type InstructorReadiness = {
  /** False when any blocker exists. */
  assignable: boolean;
  blockers: InstructorBlocker[];
  warnings: InstructorWarning[];
};

export type InstructorView = {
  user: InstructorUser;
  profileStatus: InstructorProfileState;
  profile: InstructorProfileSummary | null;
  /** Codes, DMT order. */
  qualifiedVehicleClasses: string[];
  readiness: InstructorReadiness;
  canCreate: boolean;
  canEdit: boolean;
  canChangeStatus: boolean;
};

export type InstructorListItem = InstructorView & {
  /** Qualified ∩ offered by the active branch. */
  teachableHere: string[];
};

export type InstructorBranch = {
  id: string;
  name: string;
  /** Qualified ∩ that branch's offered classes. */
  teachableVehicleClasses: string[];
};

export type InstructorDetail = InstructorView & {
  currentLicence: Licence | null;
  /** Newest first, current included. */
  licenceHistory: Licence[];
  /** What the grade allows; empty without a profile. */
  permittedVehicleClasses: VehicleClass[];
  /** ACTIVE branches they work in that the viewer can see. */
  branches: InstructorBranch[];
};

export type InstructorLicenceChange = InstructorDetail & LicenceChange;

export type InstructorList = { items: InstructorListItem[] };
export type InstructorCandidates = { items: InstructorView[] };
