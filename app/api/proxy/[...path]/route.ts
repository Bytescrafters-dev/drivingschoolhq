import { NextRequest, NextResponse } from "next/server";
import { forbiddenOrigin, isSameOriginRequest } from "@/lib/same-origin";
import { handleProxyRequest } from "@/lib/with-auth-proxy";

type RouteContext = { params: Promise<{ path: string[] }> };

// Generic BFF proxy: /api/proxy/<backend-path> → ${BACKEND_URL}/<backend-path>.
// Injects the session bearer token and refreshes on 401.
const handle = async (req: NextRequest, context: RouteContext) => {
  if (!(await isSameOriginRequest(req))) return forbiddenOrigin();

  const { path } = await context.params;
  // The tenant app only talks to tenant endpoints. Dot segments would be
  // normalised away by fetch and could escape the intended backend path.
  if (
    path[0] !== "tenant" ||
    path.some((segment) => segment === "." || segment === "..")
  ) {
    return NextResponse.json(
      { statusCode: 400, code: "BAD_REQUEST", message: "Invalid path" },
      { status: 400 },
    );
  }
  const backendPath = path.map(encodeURIComponent).join("/");
  return handleProxyRequest(req, backendPath);
};

export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const PATCH = handle;
export const DELETE = handle;
