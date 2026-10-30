import { NextResponse } from "next/server";
import { clearAuthCookiesOn } from "@/lib/cookies";
import { forbiddenOrigin, isSameOriginRequest } from "@/lib/same-origin";
import { discardBody, proxyToBackendWithAccess } from "@/lib/with-auth-proxy";

export const POST = async (req: Request) => {
  if (!(await isSameOriginRequest(req))) return forbiddenOrigin();

  // Revoke the session server-side so no live refresh token is left behind.
  // Failures (incl. an already-invalid session) are ignored: logout always
  // succeeds locally.
  try {
    const result = await proxyToBackendWithAccess(req, "tenant/auth/logout", {
      method: "POST",
    });
    if (!result.expired) {
      await discardBody(result.res);
    }
  } catch (err) {
    console.error(
      "[logout] backend revoke failed:",
      err instanceof Error ? err.message : String(err),
    );
  }

  return clearAuthCookiesOn(NextResponse.json({ ok: true }));
};
