import { NextResponse } from "next/server";
import {
  clearAuthCookies,
  getRefreshTokenFromCookies,
  setAuthCookies,
} from "@/lib/cookies";
import {
  getAccessMaxAge,
  getRefreshMaxAge,
  refreshPlatformTokens,
} from "@/lib/auth-tokens";

export const POST = async () => {
  const refreshToken = await getRefreshTokenFromCookies();
  if (!refreshToken) {
    return NextResponse.json({ message: "No refresh token" }, { status: 401 });
  }

  const tokens = await refreshPlatformTokens(refreshToken);
  if (!tokens) {
    await clearAuthCookies();
    return NextResponse.json({ message: "Refresh failed" }, { status: 401 });
  }

  await setAuthCookies(
    tokens.accessToken,
    getAccessMaxAge(tokens),
    tokens.refreshToken,
    getRefreshMaxAge(tokens),
  );

  // Tokens stay in httpOnly cookies; never return them to the browser.
  return NextResponse.json({
    ok: true,
    mustChangePassword: tokens.mustChangePassword === true,
  });
};
