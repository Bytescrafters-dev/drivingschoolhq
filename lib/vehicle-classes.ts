import type { DrivingSchoolGrade, VehicleClass } from "@/types/vehicle-class";

/** Codes of `classes` the grade permits (DMT order kept). */
export const permittedCodes = (
  grade: DrivingSchoolGrade,
  classes: VehicleClass[],
): string[] =>
  classes.filter((c) => c.permittedGrades.includes(grade)).map((c) => c.code);

/**
 * Offered codes a change to `grade` would remove: those whose class doesn't
 * permit it. Used to confirm before a lower-grade renewal or correction; the
 * backend's `removedVehicleClasses` is the final answer.
 */
export const classesDroppedByGrade = (
  offeredCodes: string[],
  grade: DrivingSchoolGrade,
  classes: VehicleClass[],
): string[] => {
  const allowed = new Set(permittedCodes(grade, classes));
  return offeredCodes.filter((code) => !allowed.has(code));
};

/** "Grade A only", "Grade A, B only". */
export const gradeRestriction = (vehicleClass: VehicleClass) =>
  `Grade ${vehicleClass.permittedGrades.join(", ")} only`;

/** "A1, A, B +6" once there are more than `max`. */
export const summariseCodes = (codes: string[], max = 3) =>
  codes.length <= max
    ? codes.join(", ")
    : `${codes.slice(0, max).join(", ")} +${codes.length - max}`;
