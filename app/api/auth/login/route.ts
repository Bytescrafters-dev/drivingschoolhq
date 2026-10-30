import { NextResponse } from "next/server";
import { z } from "zod";
import { setAuthCookies } from "@/lib/cookies";
import { env } from "@/lib/env";
import { backendHeaders } from "@/lib/backend-headers";
import { isTenantAuthTokens } from "@/lib/auth-tokens";
import { forbiddenOrigin, isSameOriginRequest } from "@/lib/same-origin";
import { readJsonBody } from "@/lib/api/client";
import type { LoginResponse } from "@/types/auth";

const LoginSchema = z.object({
  dsCode: z.string().trim().min(1).max(30),
  email: z.string().trim().max(254).pipe(z.email()),
  password: z.string().min(1).max(128),
});

const errorJson = (status: number, code: string, message: unknown) =>
  NextResponse.json({ statusCode: status, code, message }, { status });

export const POST = async (req: Request) => {
  if (!(await isSameOriginRequest(req))) return forbiddenOrigin();

  const parsed = LoginSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return errorJson(
      400,
      "BAD_REQUEST",
      "Enter your DS code, email and password.",
    );
  }

  try {
    const res = await fetch(`${env.BACKEND_URL}/tenant/auth/login`, {
      method: "POST",
      headers: backendHeaders(req, { hasBody: true }),
      body: JSON.stringify(parsed.data),
      cache: "no-store",
    });

    const data = await readJsonBody(res);

    // Pass the backend error through: the UI switches on `code`
    // (INVALID_CREDENTIALS, TENANT_CLOSED, TOO_MANY_REQUESTS, BAD_REQUEST).
    if (!res.ok) {
      const body = (data ?? {}) as { code?: unknown; message?: unknown };
      return errorJson(
        res.status,
        typeof body.code === "string" ? body.code : "LOGIN_FAILED",
        body.message ?? "Login failed",
      );
    }

    if (!isTenantAuthTokens(data)) {
      console.error(
        "[login] unexpected backend response shape:",
        data && typeof data === "object" ? Object.keys(data) : typeof data,
      );
      return errorJson(502, "BAD_GATEWAY", "Invalid login response");
    }

    await setAuthCookies(data);

    // Tokens stay in httpOnly cookies; never return them to the browser.
    const response: LoginResponse = {
      ok: true,
      mustChangePassword: data.mustChangePassword === true,
    };
    return NextResponse.json(response);
  } catch (err) {
    console.error(
      "[login] error:",
      err instanceof Error ? err.message : String(err),
    );
    return errorJson(
      502,
      "BAD_GATEWAY",
      "Unable to reach the server. Try again.",
    );
  }
};
