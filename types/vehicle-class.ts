/** Driving-school licence grade; decides which classes a branch may teach. */
export type DrivingSchoolGrade = "A" | "B" | "C";

/** One of the 13 DMT licence classes (fixed reference data). */
export type VehicleClass = {
  /** 'A1' | 'A' | 'B1' | 'B' | 'C1' | 'C' | 'CE' | 'D1' | 'D' | 'DE' | 'G1' | 'G' | 'J' */
  code: string;
  name: string;
  description: string;
  permittedGrades: DrivingSchoolGrade[];
};

/** DMT order. */
export type VehicleClassList = { items: VehicleClass[] };
