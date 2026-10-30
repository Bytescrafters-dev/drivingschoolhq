// Server-side only: builds headers for BFF → backend calls.

type BackendHeaderOptions = {
  accessToken?: string;
  hasBody?: boolean;
};

/** The browser's IP: first hop of the hosting proxy's X-Forwarded-For, else X-Real-IP. */
export const getClientIp = (req: Request): string | undefined => {
  const forwarded = req.headers.get("x-forwarded-for");
  const first = forwarded?.split(",")[0]?.trim();
  if (first) return first;
  return req.headers.get("x-real-ip")?.trim() || undefined;
};

/**
 * Headers for every backend call (auth routes and proxy).
 * Built from an allow-list: browser cookies, host and hop-by-hop headers are
 * never forwarded. Forwards client IP/UA so backend throttling and audit logs
 * see the real user rather than the BFF (requires TRUST_PROXY on the API).
 */
export const backendHeaders = (
  req: Request,
  { accessToken, hasBody = false }: BackendHeaderOptions = {},
): Headers => {
  const headers = new Headers();

  if (hasBody) {
    headers.set(
      "content-type",
      req.headers.get("content-type") ?? "application/json",
    );
  }

  const accept = req.headers.get("accept");
  if (accept) headers.set("accept", accept);

  const userAgent = req.headers.get("user-agent");
  if (userAgent) headers.set("user-agent", userAgent);

  const branchId = req.headers.get("x-branch-id");
  if (branchId) headers.set("x-branch-id", branchId);

  const clientIp = getClientIp(req);
  if (clientIp) headers.set("x-forwarded-for", clientIp);

  if (accessToken) headers.set("authorization", `Bearer ${accessToken}`);

  return headers;
};
