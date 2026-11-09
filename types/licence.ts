import type { DrivingSchoolGrade } from "@/types/vehicle-class";

/** A driving-school or instructor licence (same shape for both). */
export type Licence = {
  id: string;
  licenceNumber: string;
  grade: DrivingSchoolGrade;
  /** Calendar date 'YYYY-MM-DD' (no timezone). */
  issuedOn: string;
  /** Calendar date 'YYYY-MM-DD', the last valid day. */
  expiresOn: string;
  recordedByTenantUserId: string;
  /** ISO instant: when it was recorded. */
  createdAt: string;
  /** ISO instant: last correction. */
  updatedAt: string;
};

export type LicenceInput = {
  licenceNumber: string;
  grade: DrivingSchoolGrade;
  issuedOn: string;
  expiresOn: string;
};

/** Renewal/correction responses: classes a lower grade removed. */
export type LicenceChange = { removedVehicleClasses: string[] };

/** Normalised expiry warning for display. */
export type LicenceExpiry =
  | { kind: "expired"; date: string }
  | { kind: "expiring"; date: string; daysLeft: number };
