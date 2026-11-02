import { ApiError } from "@/lib/api/client";

const MESSAGES: Record<string, string> = {
  INVALID_CREDENTIALS: "Incorrect DS code, email or password.",
  TENANT_CLOSED:
    "This driving school's account has been closed. Contact DrivingSchoolHQ support.",
  TOO_MANY_REQUESTS: "Too many attempts. Wait a minute and try again.",
  CURRENT_PASSWORD_INCORRECT: "Your current password is incorrect.",
  PASSWORD_REUSED: "Choose a password different from your current one.",
  TENANT_PERMISSION_DENIED: "You don't have permission to do this.",
  SESSION_EXPIRED: "Your session has expired. Please log in again.",
  BRANCH_NOT_FOUND: "This branch doesn't exist or you can't access it.",
  BRANCH_NAME_TAKEN: "A branch with this name already exists.",
  BRANCH_CLOSED: "This branch is closed.",
  BRANCH_ALREADY_CLOSED: "This branch is already closed.",
  BRANCH_NOT_CLOSED: "This branch is already open.",
  LAST_ACTIVE_BRANCH: "A school must keep at least one active branch.",
  PLAN_LIMIT_REACHED:
    "Your plan's branch limit is reached. Close a branch or contact DrivingSchoolHQ to upgrade.",
  INVALID_PHONE: "Enter a valid Sri Lankan phone number.",
  BRANCH_ACCESS_DENIED: "You no longer have access to this branch.",
};

/**
 * User-facing message for an error from the BFF/backend.
 * Known codes map to fixed copy; `BAD_REQUEST` and unknown codes fall back to
 * the backend message.
 */
export const getApiErrorMessage = (
  error: unknown,
  fallback = "Something went wrong. Try again.",
): string | null => {
  if (!error) return null;
  if (error instanceof ApiError) {
    if (error.code && MESSAGES[error.code]) return MESSAGES[error.code];
    if (error.status === 429) return MESSAGES.TOO_MANY_REQUESTS;
    return error.message || fallback;
  }
  return fallback;
};

/** The backend error code, when `error` is an `ApiError` that carries one. */
export const getApiErrorCode = (error: unknown): string | undefined =>
  error instanceof ApiError ? error.code : undefined;

/**
 * Codes handled app-wide by the QueryProvider (toast/refetch/redirect).
 * Feature UIs should not show a second message for these.
 */
const GLOBALLY_HANDLED_CODES = new Set([
  "SESSION_EXPIRED",
  "PASSWORD_CHANGE_REQUIRED",
  "TENANT_PERMISSION_DENIED",
  "BRANCH_ACCESS_DENIED",
]);

export const isGloballyHandledError = (error: unknown): boolean => {
  const code = getApiErrorCode(error);
  return code !== undefined && GLOBALLY_HANDLED_CODES.has(code);
};
