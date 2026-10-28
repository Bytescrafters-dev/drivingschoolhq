import { FORCE_CHANGE_PASSWORD, LOGIN } from "@/shared/constants/pageUrls";

/**
 * Error thrown for non-2xx responses from the BFF proxy.
 * `code` is the backend error code (e.g. `PLAN_CODE_TAKEN`) when provided.
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

const redirectToLogin = () => {
  if (typeof window === "undefined") return;
  const { pathname, search } = window.location;
  if (pathname === LOGIN) return;
  const next = encodeURIComponent(`${pathname}${search}`);
  window.location.assign(`${LOGIN}?next=${next}`);
};

const redirectToForceChangePassword = () => {
  if (typeof window === "undefined") return;
  if (window.location.pathname === FORCE_CHANGE_PASSWORD) return;
  window.location.assign(FORCE_CHANGE_PASSWORD);
};

/**
 * Calls the backend through the BFF proxy (`/api/proxy/<path>`).
 * - 401 means the session could not be refreshed: the admin is sent to login.
 * - 403 PASSWORD_CHANGE_REQUIRED sends the admin to the change-password page.
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
    throw new ApiError("Your session has expired. Please log in again.", 401);
  }

  const text = await res.text();
  let data: unknown;
  try {
    data = text ? JSON.parse(text) : undefined;
  } catch {
    data = undefined;
  }

  if (!res.ok) {
    const body = data as { message?: unknown; code?: unknown } | undefined;
    const raw = body?.message;
    const message = Array.isArray(raw)
      ? raw.join(", ")
      : typeof raw === "string"
        ? raw
        : "Something went wrong";
    const code = typeof body?.code === "string" ? body.code : undefined;

    if (res.status === 403 && code === "PASSWORD_CHANGE_REQUIRED") {
      redirectToForceChangePassword();
    }
    throw new ApiError(message, res.status, code);
  }

  return data as T;
};
