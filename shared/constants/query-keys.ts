import type { StaffListFilters } from "@/types/staff";

export const queryKeys = {
  me: ["tenant", "me"] as const,
  branches: {
    all: ["branches"] as const,
    list: (includeClosed: boolean) => ["branches", { includeClosed }] as const,
    detail: (id: string) => ["branches", id] as const,
  },
  /** Branch-scoped: validates the tab's active branch. */
  branchContext: (branchId: string) => ["branch-context", branchId] as const,
  staff: {
    all: ["staff"] as const,
    list: (filters: StaffListFilters) => ["staff", "list", filters] as const,
    detail: (id: string) => ["staff", id] as const,
    options: ["staff", "options"] as const,
  },
};
