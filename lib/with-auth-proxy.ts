// Server-side only: forwards requests to the backend with the session's
// bearer token and owns refresh-on-401. Never import from client code.
import { NextResponse } from "next/server";
import { backendHeaders } from "./backend-headers";
import { refreshTenantTokensOnce } from "./auth-tokens";
import {
  applyAuthCookies,
  clearAuthCookiesOn,
  getAccessTokenFromCookies,
  getRefreshTokenFromCookies,
} from "./cookies";
import { env } from "./env";
import type { TenantAuthTokens } from "@/types/auth";

const BODYLESS_METHODS = new Set(["GET", "HEAD"]);

// Headers that must not be copied from the backend response to the browser.
// `fetch` already decoded the body, so encoding/length no longer apply; backend
// cookies never reach the browser.
const STRIPPED_RESPONSE_HEADERS = [
  "content-encoding",
  "content-length",
  "transfer-encoding",
  "connection",
  "keep-alive",
  "set-cookie",
];

/** Reads the request body once so it can be reused for the retry after refresh. */
export const readRequestBody = async (
  req: Request,
): Promise<ArrayBuffer | undefined> => {
  if (BODYLESS_METHODS.has(req.method.toUpperCase())) return undefined;
  const body = await req.arrayBuffer();
  return body.byteLength > 0 ? body : undefined;
};

/**
 * Consumes a response body we don't need (small error/204 bodies).
 * Draining instead of `body.cancel()`: Next's patched fetch may return a tee'd
 * stream, and cancelling one tee branch never settles while the other is open.
 */
export const discardBody = async (res: Response) => {
  await res.arrayBuffer().catch(() => undefined);
};

type ProxyOptions = {
  accessToken?: string;
  body?: ArrayBuffer;
  /** Overrides the incoming method (auth routes always POST). */
  method?: string;
};

/** A single backend call: no refresh, no cookie handling. */
export async function proxyToBackend(
  req: Request,
  backendPath: string,
  { accessToken, body, method = req.method }: ProxyOptions = {},
): Promise<Response> {
  const url = new URL(req.url);
  const target = `${env.BACKEND_URL}/${backendPath.replace(/^\//, "")}${url.search}`;

  return fetch(target, {
    method,
    headers: backendHeaders(req, { accessToken, hasBody: body !== undefined }),
    body,
    redirect: "manual",
    cache: "no-store",
  });
}

export type AuthedBackendResult =
  | { expired: true }
  | { expired: false; res: Response; tokens: TenantAuthTokens | null };

/**
 * Calls the backend with the session's access token.
 * - No access cookie but a refresh cookie: refresh first.
 * - Backend 401: refresh once (deduplicated) and retry once.
 * - 403 is never refreshed (PASSWORD_CHANGE_REQUIRED, permission/branch denials).
 * `tokens` is set when a refresh happened; the caller must write the cookies.
 * `expired` means the session cannot be recovered; the caller must clear cookies.
 */
export async function proxyToBackendWithAccess(
  req: Request,
  backendPath: string,
  { body, method }: Omit<ProxyOptions, "accessToken"> = {},
): Promise<AuthedBackendResult> {
  const accessToken = await getAccessTokenFromCookies();

  if (accessToken) {
    const res = await proxyToBackend(req, backendPath, {
      accessToken,
      body,
      method,
    });
    if (res.status !== 401) return { expired: false, res, tokens: null };
    await discardBody(res); // Unused 401 body; retry after refresh.
  }

  const refreshToken = await getRefreshTokenFromCookies();
  const tokens = refreshToken
    ? await refreshTenantTokensOnce(refreshToken, req)
    : null;
  if (!tokens) return { expired: true };

  const retried = await proxyToBackend(req, backendPath, {
    accessToken: tokens.accessToken,
    body,
    method,
  });
  if (retried.status === 401) {
    await discardBody(retried);
    return { expired: true };
  }
  return { expired: false, res: retried, tokens };
}

/** Copies a backend response for the browser, dropping unsafe headers. */
export const toClientResponse = (res: Response): NextResponse => {
  const headers = new Headers(res.headers);
  for (const name of STRIPPED_RESPONSE_HEADERS) headers.delete(name);
  // 204/304 must not carry a body.
  const body = res.status === 204 || res.status === 304 ? null : res.body;
  return new NextResponse(body, {
    status: res.status,
    statusText: res.statusText,
    headers,
  });
};

/**
 * The session cannot be recovered: clear the cookies and answer with a plain
 * JSON 401 so client code redirects to login itself. (A redirect would be
 * silently followed by fetch and hand the login HTML to the caller.)
 */
export const sessionExpiredResponse = () =>
  clearAuthCookiesOn(
    NextResponse.json(
      {
        statusCode: 401,
        code: "SESSION_EXPIRED",
        message: "Your session has expired. Please log in again.",
      },
      { status: 401 },
    ),
  );

/** Full generic-proxy handling for `/api/proxy/[...path]`. */
export async function handleProxyRequest(
  req: Request,
  backendPath: string,
): Promise<NextResponse> {
  const body = await readRequestBody(req);
  const result = await proxyToBackendWithAccess(req, backendPath, { body });

  if (result.expired) return sessionExpiredResponse();

  const response = toClientResponse(result.res);
  if (result.tokens) applyAuthCookies(response, result.tokens);
  return response;
}
