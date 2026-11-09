import { useQuery } from "@tanstack/react-query";
import { useActiveBranch } from "@/components/branches/active-branch-provider";
import {
  fetchInstructor,
  fetchInstructorCandidates,
  fetchInstructors,
  fetchMyInstructorProfile,
} from "@/lib/api/instructors";
import { queryKeys } from "@/shared/constants/query-keys";
import type { InstructorProfileState } from "@/types/instructor";

/** Instructors of the tab's active branch; refetches when the branch changes. */
export const useInstructors = (
  status: InstructorProfileState | null,
  enabled = true,
) => {
  const { branchId, isReady } = useActiveBranch();
  return useQuery({
    queryKey: queryKeys.instructors.list(branchId ?? "", status),
    queryFn: () => fetchInstructors(branchId as string, status),
    enabled: enabled && isReady,
    select: (data) => data.items,
  });
};

/** Active-branch staff without a profile whose profile the user may create. */
export const useInstructorCandidates = (enabled: boolean) => {
  const { branchId, isReady } = useActiveBranch();
  return useQuery({
    queryKey: queryKeys.instructors.candidates(branchId ?? ""),
    queryFn: () => fetchInstructorCandidates(branchId as string),
    enabled: enabled && isReady,
    select: (data) => data.items,
    // Fresh each time the picker opens.
    staleTime: 0,
  });
};

/** One person's instructor view; 404 means no profile and not an INSTRUCTOR. */
export const useInstructor = (userId: string | null) =>
  useQuery({
    queryKey: queryKeys.instructors.detail(userId ?? ""),
    queryFn: () => fetchInstructor(userId as string),
    enabled: Boolean(userId),
  });

/** The signed-in user's own profile (SETUP_REQUIRED when none). */
export const useMyInstructorProfile = (enabled = true) =>
  useQuery({
    queryKey: queryKeys.instructors.mine,
    queryFn: fetchMyInstructorProfile,
    enabled,
  });
