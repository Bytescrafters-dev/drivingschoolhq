import { FORCE_CHANGE_PASSWORD, LOGIN } from "@/shared/constants/pageUrls";

/**
 * Returns `value` only when it is a safe same-app relative path, otherwise
 * `fallback`. Prevents open redirects through `?next=`.
 * Rejects protocol-relative (`//x`), backslash (`/\x`) and control-char tricks,
 * and the auth pages themselves (which would loop).
 */
export const getSafeNextPath = (
  value: string | string[] | null | undefined,
  fallback = "/",
): string => {
  const raw = Array.isArray(value) ? value[0] : value;
  if (typeof raw !== "string" || raw.length === 0) return fallback;
  if (!raw.startsWith("/")) return fallback;
  if (raw.startsWith("//") || raw.startsWith("/\\")) return fallback;
  if (/[\u0000-\u001f\u007f\\]/.test(raw)) return fallback;

  const pathname = raw.split(/[?#]/)[0];
  if (pathname === LOGIN || pathname === FORCE_CHANGE_PASSWORD) return fallback;
  return raw;
};
