import {
  useMutation,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import type { ApiError } from "@/lib/api/client";
import { getApiErrorCode } from "@/lib/api/error-messages";
import {
  correctInstructorLicence,
  createInstructorProfile,
  inactivateInstructor,
  reactivateInstructor,
  recordInstructorLicence,
  setInstructorClasses,
} from "@/lib/api/instructors";
import { queryKeys } from "@/shared/constants/query-keys";
import type {
  InstructorDetail,
  InstructorLicenceChange,
} from "@/types/instructor";
import type { LicenceInput } from "@/types/licence";

// The cached flags or profile state are out of date.
const STALE_CODES = new Set([
  "INSTRUCTOR_MANAGEMENT_DENIED",
  "INSTRUCTOR_NOT_FOUND",
  "INSTRUCTOR_PROFILE_EXISTS",
  "INSTRUCTOR_PROFILE_MISSING",
  "STAFF_DISABLED",
  "VEHICLE_CLASS_NOT_PERMITTED",
]);

const storeDetail = (
  queryClient: QueryClient,
  userId: string,
  detail: InstructorDetail,
) => {
  // Drop response-only fields such as `removedVehicleClasses`.
  const {
    user,
    profileStatus,
    profile,
    qualifiedVehicleClasses,
    readiness,
    canCreate,
    canEdit,
    canChangeStatus,
    currentLicence,
    licenceHistory,
    permittedVehicleClasses,
    branches,
  } = detail;
  queryClient.setQueryData<InstructorDetail>(
    queryKeys.instructors.detail(userId),
    {
      user,
      profileStatus,
      profile,
      qualifiedVehicleClasses,
      readiness,
      canCreate,
      canEdit,
      canChangeStatus,
      currentLicence,
      licenceHistory,
      permittedVehicleClasses,
      branches,
    },
  );
};

/**
 * Sets the person's detail from the response, then refetches everything else
 * under `instructors` (lists in every branch, candidates, own profile).
 * Returned so `mutateAsync` resolves after the refetch.
 */
const applyResponse = (
  queryClient: QueryClient,
  userId: string,
  detail: InstructorDetail,
) => {
  storeDetail(queryClient, userId, detail);
  const detailKey = JSON.stringify(queryKeys.instructors.detail(userId));
  return queryClient.invalidateQueries({
    queryKey: queryKeys.instructors.all,
    predicate: (query) => JSON.stringify(query.queryKey) !== detailKey,
  });
};

const refetchIfStale = (queryClient: QueryClient, error: ApiError) => {
  const code = getApiErrorCode(error);
  if (code && STALE_CODES.has(code)) {
    void queryClient.invalidateQueries({ queryKey: queryKeys.instructors.all });
  } else if (code === "UNKNOWN_VEHICLE_CLASS") {
    void queryClient.invalidateQueries({ queryKey: queryKeys.vehicleClasses });
  }
};

const useInstructorMutation = <TVariables, TResult extends InstructorDetail>(
  userId: string,
  mutationFn: (variables: TVariables) => Promise<TResult>,
) => {
  const queryClient = useQueryClient();
  return useMutation<TResult, ApiError, TVariables>({
    mutationFn,
    onSuccess: (detail) => applyResponse(queryClient, userId, detail),
    onError: (error) => refetchIfStale(queryClient, error),
  });
};

export const useCreateInstructorProfile = (userId: string) =>
  useInstructorMutation<LicenceInput, InstructorDetail>(userId, (input) =>
    createInstructorProfile(userId, input),
  );

export const useRecordInstructorLicence = (userId: string) =>
  useInstructorMutation<LicenceInput, InstructorLicenceChange>(
    userId,
    (input) => recordInstructorLicence(userId, input),
  );

export const useCorrectInstructorLicence = (userId: string) =>
  useInstructorMutation<Partial<LicenceInput>, InstructorLicenceChange>(
    userId,
    (patch) => correctInstructorLicence(userId, patch),
  );

export const useSetInstructorClasses = (userId: string) =>
  useInstructorMutation<string[], InstructorDetail>(userId, (codes) =>
    setInstructorClasses(userId, codes),
  );

/** Status changes are made from lists too, so the id is a variable here. */
const useStatusMutation = (
  mutationFn: (userId: string) => Promise<InstructorDetail>,
) => {
  const queryClient = useQueryClient();
  return useMutation<InstructorDetail, ApiError, string>({
    mutationFn,
    onSuccess: (detail, userId) => applyResponse(queryClient, userId, detail),
    onError: (error) => refetchIfStale(queryClient, error),
  });
};

export const useInactivateInstructor = () =>
  useStatusMutation(inactivateInstructor);

export const useReactivateInstructor = () =>
  useStatusMutation(reactivateInstructor);
