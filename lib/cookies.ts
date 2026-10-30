// Server-side only: reads/writes the httpOnly auth cookies.
import { cookies } from "next/headers";
import type { NextResponse } from "next/server";
import { env } from "./env";
import { getAccessMaxAge, getRefreshMaxAge } from "./auth-tokens";
import type { TenantAuthTokens } from "@/types/auth";

const isProd = process.env.NODE_ENV === "production";
export const JWT_COOKIE = env.JWT_COOKIE_NAME;
export const REFRESH_COOKIE = env.REFRESH_COOKIE_NAME;
const cookieDomain = env.COOKIE_DOMAIN || undefined;

export const authCookieOptions = (maxAge: number) => ({
  httpOnly: true,
  sameSite: "lax" as const,
  secure: isProd,
  path: "/",
  maxAge,
  domain: cookieDomain,
});

/** Sets both cookies via `next/headers` (route handlers returning NextResponse.json). */
export const setAuthCookies = async (tokens: TenantAuthTokens) => {
  const cookie = await cookies();
  cookie.set(
    JWT_COOKIE,
    tokens.accessToken,
    authCookieOptions(getAccessMaxAge(tokens)),
  );
  cookie.set(
    REFRESH_COOKIE,
    tokens.refreshToken,
    authCookieOptions(getRefreshMaxAge(tokens)),
  );
};

// Expire with the same options (incl. domain) so deletion works when
// COOKIE_DOMAIN is set; `cookies().delete(name)` would omit the domain.
export const clearAuthCookies = async () => {
  const cookie = await cookies();
  cookie.set(JWT_COOKIE, "", authCookieOptions(0));
  cookie.set(REFRESH_COOKIE, "", authCookieOptions(0));
};

/** Sets both cookies on a specific response (used by the streaming proxy). */
export const applyAuthCookies = (
  response: NextResponse,
  tokens: TenantAuthTokens,
) => {
  response.cookies.set(
    JWT_COOKIE,
    tokens.accessToken,
    authCookieOptions(getAccessMaxAge(tokens)),
  );
  response.cookies.set(
    REFRESH_COOKIE,
    tokens.refreshToken,
    authCookieOptions(getRefreshMaxAge(tokens)),
  );
  return response;
};

export const clearAuthCookiesOn = (response: NextResponse) => {
  response.cookies.set(JWT_COOKIE, "", authCookieOptions(0));
  response.cookies.set(REFRESH_COOKIE, "", authCookieOptions(0));
  return response;
};

export const getAccessTokenFromCookies = async () => {
  const cookieStore = await cookies();
  return cookieStore.get(JWT_COOKIE)?.value;
};

export const getRefreshTokenFromCookies = async () => {
  const cookieStore = await cookies();
  return cookieStore.get(REFRESH_COOKIE)?.value;
};
