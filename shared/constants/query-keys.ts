import type { InstructorProfileState } from "@/types/instructor";
import type { StaffListFilters } from "@/types/staff";

export const queryKeys = {
  me: ["tenant", "me"] as const,
  branches: {
    all: ["branches"] as const,
    list: (includeClosed: boolean) => ["branches", { includeClosed }] as const,
    detail: (id: string) => ["branches", id] as const,
    profile: (id: string) => ["branches", id, "profile"] as const,
  },
  /** Reference data: never changes during a session. */
  vehicleClasses: ["vehicle-classes"] as const,
  /** Branch-scoped: validates the tab's active branch. */
  branchContext: (branchId: string) => ["branch-context", branchId] as const,
  staff: {
    all: ["staff"] as const,
    list: (filters: StaffListFilters) => ["staff", "list", filters] as const,
    detail: (id: string) => ["staff", id] as const,
    options: ["staff", "options"] as const,
  },
  instructors: {
    all: ["instructors"] as const,
    /** Branch-scoped. `status` null = all. */
    list: (branchId: string, status: InstructorProfileState | null) =>
      ["instructors", "list", branchId, status] as const,
    /** Branch-scoped. */
    candidates: (branchId: string) =>
      ["instructors", "candidates", branchId] as const,
    detail: (userId: string) => ["instructors", "detail", userId] as const,
    mine: ["instructors", "me"] as const,
  },
};
