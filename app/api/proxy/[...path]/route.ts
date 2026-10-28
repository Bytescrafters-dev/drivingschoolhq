import { NextRequest, NextResponse } from "next/server";
import {
  authCookieOptions,
  getRefreshTokenFromCookies,
  JWT_COOKIE,
  REFRESH_COOKIE,
} from "@/lib/cookies";
import {
  getAccessMaxAge,
  getRefreshMaxAge,
  refreshPlatformTokens,
} from "@/lib/auth-tokens";
import type { PlatformAuthTokens } from "@/types/auth";
import {
  proxyToBackend,
  proxyToBackendWithAccess,
} from "@/lib/with-auth-proxy";

// In-flight refreshes keyed by refresh token, so simultaneous 401s for the same
// session share one backend refresh without ever mixing different sessions.
const pendingRefreshes = new Map<string, Promise<PlatformAuthTokens | null>>();

function getRefresh(refreshToken: string): Promise<PlatformAuthTokens | null> {
  let pending = pendingRefreshes.get(refreshToken);
  if (!pending) {
    pending = refreshPlatformTokens(refreshToken).finally(() => {
      pendingRefreshes.delete(refreshToken);
    });
    pendingRefreshes.set(refreshToken, pending);
  }
  return pending;
}

// The session cannot be recovered: clear auth cookies and answer with a plain
// 401 so client code can send the admin to the login page itself. (A redirect
// would be silently followed by fetch and hand the login HTML to the caller.)
function sessionExpired() {
  const response = NextResponse.json(
    { message: "Your session has expired. Please log in again." },
    { status: 401 },
  );
  response.cookies.set(JWT_COOKIE, "", authCookieOptions(0));
  response.cookies.set(REFRESH_COOKIE, "", authCookieOptions(0));
  return response;
}

async function attempt(req: NextRequest, path: string) {
  const res = await proxyToBackend(req, path);
  return res;
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  return handle(req, path);
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  return handle(req, path);
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  return handle(req, path);
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  return handle(req, path);
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  return handle(req, path);
}

async function handle(req: NextRequest, pathArr: string[]) {
  const path = pathArr.join("/");

  let res = await attempt(req, path);
  if (res.status !== 401) return res;

  const refreshToken = await getRefreshTokenFromCookies();
  const tokens = refreshToken ? await getRefresh(refreshToken) : null;

  if (!tokens) return sessionExpired();

  res = await proxyToBackendWithAccess(req, path, tokens.accessToken);

  if (res.status === 401) return sessionExpired();

  const response = new NextResponse(res.body, {
    status: res.status,
    statusText: res.statusText,
    headers: new Headers(res.headers),
  });
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
}
