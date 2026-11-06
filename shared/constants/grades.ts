import type { DrivingSchoolGrade } from "@/types/vehicle-class";

export const DRIVING_SCHOOL_GRADES = [
  "A",
  "B",
  "C",
] as const satisfies readonly DrivingSchoolGrade[];

export const gradeLabel = (grade: DrivingSchoolGrade) => `Grade ${grade}`;
