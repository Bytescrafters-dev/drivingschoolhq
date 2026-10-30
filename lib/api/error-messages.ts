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
