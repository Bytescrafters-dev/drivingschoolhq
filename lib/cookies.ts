import { cookies } from "next/headers";
import { env } from "./env";

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

export const setAuthCookies = async (
  accessToken: string,
  accessExpSeconds: number,
  refreshToken: string,
  refreshExpSeconds: number,
) => {
  const cookie = await cookies();
  cookie.set(JWT_COOKIE, accessToken, authCookieOptions(accessExpSeconds));
  cookie.set(
    REFRESH_COOKIE,
    refreshToken,
    authCookieOptions(refreshExpSeconds),
  );
};

export const clearAuthCookies = async () => {
  const cookie = await cookies();
  cookie.delete(JWT_COOKIE);
  cookie.delete(REFRESH_COOKIE);
};

export const getAccessTokenFromCookies = async () => {
  const cookieStore = await cookies();

  return cookieStore.get(JWT_COOKIE)?.value;
};

export const getRefreshTokenFromCookies = async () => {
  const cookieStore = await cookies();

  return cookieStore.get(REFRESH_COOKIE)?.value;
};
