import { NextResponse } from "next/server";
import { applyAuthCookies } from "@/lib/cookies";
import { forbiddenOrigin, isSameOriginRequest } from "@/lib/same-origin";
import {
  discardBody,
  proxyToBackendWithAccess,
  readRequestBody,
  sessionExpiredResponse,
} from "@/lib/with-auth-proxy";
import { readJsonBody } from "@/lib/api/client";

export const POST = async (req: Request) => {
  if (!(await isSameOriginRequest(req))) return forbiddenOrigin();

  try {
    const body = await readRequestBody(req);
    const result = await proxyToBackendWithAccess(
      req,
      "tenant/auth/change-password",
      { body, method: "POST" },
    );

    if (result.expired) return sessionExpiredResponse();

    const { res, tokens } = result;
    let response: NextResponse;

    if (res.ok) {
      // Backend responds 204. The current session stays valid (only other
      // sessions are signed out), so the cookies are kept.
      await discardBody(res);
      response = NextResponse.json({ ok: true });
    } else {
      const data = (await readJsonBody(res)) as
        { code?: unknown; message?: unknown } | undefined;
      response = NextResponse.json(
        {
          statusCode: res.status,
          code: typeof data?.code === "string" ? data.code : undefined,
          message: data?.message ?? "Failed to change password",
        },
        { status: res.status },
      );
    }

    if (tokens) applyAuthCookies(response, tokens);
    return response;
  } catch (err) {
    console.error(
      "[change-password] error:",
      err instanceof Error ? err.message : String(err),
    );
    return NextResponse.json(
      {
        statusCode: 502,
        code: "BAD_GATEWAY",
        message: "Unable to reach the server. Try again.",
      },
      { status: 502 },
    );
  }
};
