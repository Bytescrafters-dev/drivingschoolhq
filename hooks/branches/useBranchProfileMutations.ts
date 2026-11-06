import {
  useMutation,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import {
  correctLicence,
  recordLicence,
  setOfferedVehicleClasses,
} from "@/lib/api/branch-profile";
import type { ApiError } from "@/lib/api/client";
import { getApiErrorCode } from "@/lib/api/error-messages";
import { queryKeys } from "@/shared/constants/query-keys";
import type {
  BranchProfile,
  LicenceChangeResponse,
  LicenceInput,
} from "@/types/branch";

/** Branch lists and detail carry the profile summary; the profile itself is set from the response. */
const invalidateBranchSummaries = (queryClient: QueryClient) =>
  queryClient.invalidateQueries({
    queryKey: queryKeys.branches.all,
    predicate: (query) => query.queryKey[2] !== "profile",
  });

const storeProfile = (
  queryClient: QueryClient,
  branchId: string,
  profile: BranchProfile,
) => {
  const {
    branchId: id,
    currentLicence,
    licenceHistory,
    permittedVehicleClasses,
    offeredVehicleClasses,
    readiness,
  } = profile;
  queryClient.setQueryData<BranchProfile>(queryKeys.branches.profile(branchId), {
    branchId: id,
    currentLicence,
    licenceHistory,
    permittedVehicleClasses,
    offeredVehicleClasses,
    readiness,
  });
};

// The cached profile or the branch itself is out of date.
const STALE_PROFILE_CODES = new Set([
  "BRANCH_CLOSED",
  "BRANCH_NOT_FOUND",
  "BRANCH_LICENCE_MISSING",
  "VEHICLE_CLASS_NOT_PERMITTED",
]);

const useProfileMutation = <TVariables, TResult extends BranchProfile>(
  branchId: string,
  mutationFn: (variables: TVariables) => Promise<TResult>,
) => {
  const queryClient = useQueryClient();
  return useMutation<TResult, ApiError, TVariables>({
    mutationFn,
    onSuccess: (profile) => {
      storeProfile(queryClient, branchId, profile);
      return invalidateBranchSummaries(queryClient);
    },
    onError: (error) => {
      const code = getApiErrorCode(error);
      if (code && STALE_PROFILE_CODES.has(code)) {
        // Profile, detail (status) and lists.
        void queryClient.invalidateQueries({
          queryKey: queryKeys.branches.detail(branchId),
        });
        void invalidateBranchSummaries(queryClient);
      } else if (code === "UNKNOWN_VEHICLE_CLASS") {
        void queryClient.invalidateQueries({
          queryKey: queryKeys.vehicleClasses,
        });
      }
    },
  });
};

/** First licence or renewal. */
export const useRecordLicence = (branchId: string) =>
  useProfileMutation<LicenceInput, LicenceChangeResponse>(branchId, (input) =>
    recordLicence(branchId, input),
  );

/** Typo fix on the current licence (changed fields only). */
export const useCorrectLicence = (branchId: string) =>
  useProfileMutation<Partial<LicenceInput>, LicenceChangeResponse>(
    branchId,
    (patch) => correctLicence(branchId, patch),
  );

export const useSetOfferedClasses = (branchId: string) =>
  useProfileMutation<string[], BranchProfile>(branchId, (codes) =>
    setOfferedVehicleClasses(branchId, codes),
  );
