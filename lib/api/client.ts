import { FORCE_CHANGE_PASSWORD, LOGIN } from "@/shared/constants/pageUrls";

/**
 * Error thrown for non-2xx responses from the BFF.
 * `code` is the backend error code (e.g. `INVALID_CREDENTIALS`) when provided.
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/** Parses a response body as JSON; empty or non-JSON bodies become `undefined`. */
export const readJsonBody = async (res: Response): Promise<unknown> => {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : undefined;
  } catch {
    return undefined;
  }
};

/** Builds an `ApiError` from a backend `{ statusCode, code, message }` body. */
export const parseApiError = (res: Response, data: unknown): ApiError => {
  const body = data as { message?: unknown; code?: unknown } | undefined;
  const raw = body?.message;
  const message = Array.isArray(raw)
    ? raw.join(", ")
    : typeof raw === "string"
      ? raw
      : "Something went wrong";
  const code = typeof body?.code === "string" ? body.code : undefined;
  return new ApiError(message, res.status, code);
};

const currentPath = () =>
  `${window.location.pathname}${window.location.search}`;

// Full navigation (not router.push): it also discards the in-memory
// React Query cache, so no stale user data survives the session.
const redirectToLogin = () => {
  if (typeof window === "undefined") return;
  if (window.location.pathname === LOGIN) return;
  const params = new URLSearchParams({
    next: currentPath(),
    reason: "expired",
  });
  window.location.assign(`${LOGIN}?${params}`);
};

const redirectToForceChangePassword = () => {
  if (typeof window === "undefined") return;
  if (window.location.pathname === FORCE_CHANGE_PASSWORD) return;
  const params = new URLSearchParams({ next: currentPath() });
  window.location.assign(`${FORCE_CHANGE_PASSWORD}?${params}`);
};

/**
 * Calls the backend through the BFF proxy (`/api/proxy/<path>`).
 * - 401 means the session could not be refreshed: the user is sent to login.
 * - 403 PASSWORD_CHANGE_REQUIRED sends the user to the change-password page.
 * - Other non-2xx responses throw an `ApiError` with the backend message/code.
 * - 204 / empty bodies resolve to `undefined`.
 */
export const apiFetch = async <T>(
  path: string,
  init?: RequestInit,
): Promise<T> => {
  const headers = new Headers(init?.headers);
  if (init?.body && !headers.has("content-type")) {
    headers.set("content-type", "application/json");
  }

  const res = await fetch(`/api/proxy/${path.replace(/^\//, "")}`, {
    ...init,
    headers,
  });

  if (res.status === 401) {
    redirectToLogin();
    throw new ApiError(
      "Your session has expired. Please log in again.",
      401,
      "SESSION_EXPIRED",
    );
  }

  const data = await readJsonBody(res);

  if (!res.ok) {
    const error = parseApiError(res, data);
    if (res.status === 403 && error.code === "PASSWORD_CHANGE_REQUIRED") {
      redirectToForceChangePassword();
    }
    throw error;
  }

  return data as T;
};
