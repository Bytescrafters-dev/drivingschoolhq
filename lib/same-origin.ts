import { NextResponse } from "next/server";
import { getAppBaseUrl } from "./base-url";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

/**
 * CSRF defence on top of `sameSite=lax`: mutating BFF requests must carry an
 * `Origin` header equal to this app's own origin.
 */
export const isSameOriginRequest = async (req: Request): Promise<boolean> => {
  if (SAFE_METHODS.has(req.method.toUpperCase())) return true;

  const origin = req.headers.get("origin");
  if (!origin) return false;

  try {
    return new URL(origin).origin === new URL(await getAppBaseUrl()).origin;
  } catch {
    return false;
  }
};

export const forbiddenOrigin = () =>
  NextResponse.json(
    { statusCode: 403, code: "FORBIDDEN_ORIGIN", message: "Forbidden" },
    { status: 403 },
  );
