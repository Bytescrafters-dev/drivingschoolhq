// Server-side only: handles raw backend tokens. Never import from client code.
import { env } from "./env";
import type { PlatformAuthTokens } from "@/types/auth";

// Fallbacks used only if the backend omits/garbles expiry information.
const DEFAULT_ACCESS_MAX_AGE_SECONDS = 10 * 60 * 60;
const DEFAULT_REFRESH_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

export const isPlatformAuthTokens = (
  data: unknown,
): data is PlatformAuthTokens => {
  if (!data || typeof data !== "object") return false;
  const d = data as Record<string, unknown>;
  return (
    typeof d.accessToken === "string" &&
    d.accessToken.length > 0 &&
    typeof d.refreshToken === "string" &&
    d.refreshToken.length > 0
  );
};

export const getAccessMaxAge = (tokens: PlatformAuthTokens): number => {
  const expiresIn = tokens.accessTokenExpiresIn;
  return typeof expiresIn === "number" &&
    Number.isFinite(expiresIn) &&
    expiresIn > 0
    ? Math.floor(expiresIn)
    : DEFAULT_ACCESS_MAX_AGE_SECONDS;
};

export const getRefreshMaxAge = (tokens: PlatformAuthTokens): number => {
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
 * Exchanges a refresh token for a new token pair.
 * Returns `null` when the backend rejects the refresh or responds unexpectedly.
 */
export const refreshPlatformTokens = async (
  refreshToken: string,
): Promise<PlatformAuthTokens | null> => {
  try {
    const res = await fetch(`${env.BACKEND_URL}/tenant/auth/refresh`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) return null;

    const data: unknown = await res.json();
    if (!isPlatformAuthTokens(data)) {
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
