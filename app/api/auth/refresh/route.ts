import { NextResponse } from "next/server";
import {
  clearAuthCookies,
  getRefreshTokenFromCookies,
  setAuthCookies,
} from "@/lib/cookies";
import { refreshTenantTokensOnce } from "@/lib/auth-tokens";
import { forbiddenOrigin, isSameOriginRequest } from "@/lib/same-origin";
import type { LoginResponse } from "@/types/auth";

// Rarely needed by the client: the proxy refreshes on its own.
export const POST = async (req: Request) => {
  if (!(await isSameOriginRequest(req))) return forbiddenOrigin();

  const refreshToken = await getRefreshTokenFromCookies();
  const tokens = refreshToken
    ? await refreshTenantTokensOnce(refreshToken, req)
    : null;

  if (!tokens) {
    await clearAuthCookies();
    return NextResponse.json(
      { statusCode: 401, code: "SESSION_EXPIRED", message: "Refresh failed" },
      { status: 401 },
    );
  }

  await setAuthCookies(tokens);

  // Tokens stay in httpOnly cookies; never return them to the browser.
  const response: LoginResponse = {
    ok: true,
    mustChangePassword: tokens.mustChangePassword === true,
  };
  return NextResponse.json(response);
};
