export const DASHBOARD = "/";
export const MY_PROFILE = "/my-profile";
export const SETTINGS = "/settings";
export const LOGIN = "/login";
export const FORCE_CHANGE_PASSWORD = "/forceChangePassword";
export const SETTINGS_BRANCHES = "/settings/branches";
export const SETTINGS_STAFF = "/settings/staff";
export const settingsBranchProfile = (branchId: string) =>
  `${SETTINGS_BRANCHES}/${encodeURIComponent(branchId)}/profile`;
export const INSTRUCTORS = "/instructors";
export const MY_INSTRUCTOR_PROFILE = "/instructors/me";
export const instructorProfile = (userId: string) =>
  `${INSTRUCTORS}/${encodeURIComponent(userId)}`;
