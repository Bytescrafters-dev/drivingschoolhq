// Server-side only: handles raw backend tokens. Never import from client code.
import { env } from "./env";
import { backendHeaders } from "./backend-headers";
import type { TenantAuthTokens } from "@/types/auth";

// Fallbacks used only if the backend omits/garbles expiry information.
// They match the backend defaults (15 minutes / 7 days).
const DEFAULT_ACCESS_MAX_AGE_SECONDS = 15 * 60;
const DEFAULT_REFRESH_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export const isTenantAuthTokens = (data: unknown): data is TenantAuthTokens => {
  if (!data || typeof data !== "object") return false;
  const d = data as Record<string, unknown>;
  return (
    typeof d.accessToken === "string" &&
    d.accessToken.length > 0 &&
    typeof d.refreshToken === "string" &&
    d.refreshToken.length > 0
  );
};

export const getAccessMaxAge = (tokens: TenantAuthTokens): number => {
  const expiresIn = tokens.accessTokenExpiresIn;
  return typeof expiresIn === "number" &&
    Number.isFinite(expiresIn) &&
    expiresIn > 0
    ? Math.floor(expiresIn)
    : DEFAULT_ACCESS_MAX_AGE_SECONDS;
};

export const getRefreshMaxAge = (tokens: TenantAuthTokens): number => {
  const expiresAt: unknown = tokens.refreshTokenExpiresAt;
  if (typeof expiresAt !== "string" && !(expiresAt instanceof Date)) {
    return DEFAULT_REFRESH_MAX_AGE_SECONDS;
  }
  const expiresAtMs = new Date(expiresAt).getTime();
  if (Number.isNaN(expiresAtMs)) return DEFAULT_REFRESH_MAX_AGE_SECONDS;

  const seconds = Math.floor((expiresAtMs - Date.now()) / 1000);
  return seconds > 0 ? seconds : DEFAULT_REFRESH_MAX_AGE_SECONDS;
};

/**
 * Exchanges a refresh token for a new token pair (the refresh token rotates).
 * Returns `null` when the backend rejects the refresh or responds unexpectedly.
 * Prefer `refreshTenantTokensOnce`, which guarantees one call per old token.
 */
export const refreshTenantTokens = async (
  refreshToken: string,
  req: Request,
): Promise<TenantAuthTokens | null> => {
  try {
    const res = await fetch(`${env.BACKEND_URL}/tenant/auth/refresh`, {
      method: "POST",
      headers: backendHeaders(req, { hasBody: true }),
      body: JSON.stringify({ refreshToken }),
      cache: "no-store",
    });

    if (!res.ok) return null;

    const data: unknown = await res.json();
    if (!isTenantAuthTokens(data)) {
      console.error(
        "[refresh] unexpected backend response shape:",
        data && typeof data === "object" ? Object.keys(data) : typeof data,
      );
      return null;
    }
    return data;
  } catch (err) {
    console.error(
      "[refresh] error:",
      err instanceof Error ? err.message : String(err),
    );
    return null;
  }
};

// How long a settled refresh result (success or failure) is reused for the
// same old refresh token. Requests that started with the old cookie and arrive
// after the first refresh finished must get the same new tokens: presenting a
// rotated refresh token again makes the backend revoke ALL the user's sessions.
const REFRESH_RESULT_TTL_MS = 30_000;

type RefreshEntry = {
  promise: Promise<TenantAuthTokens | null>;
  settledAt?: number;
};

// Stored on globalThis so every route-handler bundle in this server process
// (proxy, logout, change-password, refresh) shares one cache.
// Per-instance only: revisit with a shared store if scaling horizontally
// without sticky sessions.
const globalForRefresh = globalThis as typeof globalThis & {
  __dshqTenantRefreshCache?: Map<string, RefreshEntry>;
};
const refreshCache = (globalForRefresh.__dshqTenantRefreshCache ??= new Map());

const sweepExpired = (now: number) => {
  for (const [token, entry] of refreshCache) {
    if (entry.settledAt && now - entry.settledAt > REFRESH_RESULT_TTL_MS) {
      refreshCache.delete(token);
    }
  }
};

/**
 * Deduplicated refresh: concurrent and late callers presenting the same old
 * refresh token share one backend refresh and its (cached) result.
 */
export const refreshTenantTokensOnce = (
  refreshToken: string,
  req: Request,
): Promise<TenantAuthTokens | null> => {
  sweepExpired(Date.now());

  const existing = refreshCache.get(refreshToken);
  if (existing) return existing.promise;

  const entry: RefreshEntry = {
    promise: refreshTenantTokens(refreshToken, req).then((tokens) => {
      entry.settledAt = Date.now();
      return tokens;
    }),
  };
  refreshCache.set(refreshToken, entry);
  return entry.promise;
};
