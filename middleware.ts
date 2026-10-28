import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { DASHBOARD } from "@/shared/constants/pageUrls";

const JWT_COOKIE = process.env.JWT_COOKIE_NAME ?? "dev_drivingschoolhq_jwt";
// Dashboard routes. "/" matches only the dashboard home; other entries also
// match their sub-paths. Add new top-level dashboard sections here.
const PROTECTED = [DASHBOARD];

const isProtected = (path: string) =>
  PROTECTED.some((p) =>
    p === "/" ? path === "/" : path === p || path.startsWith(`${p}/`),
  );

export const middleware = (req: NextRequest) => {
  const path = req.nextUrl.pathname;

  const needsAuth = isProtected(path);

  if (!needsAuth) return NextResponse.next();

  const token = req.cookies.get(JWT_COOKIE)?.value;

  if (!token) {
    const url = new URL("/login", req.url);
    url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
};

export const config = {
  matcher: ["/((?!_next|favicon.ico|api/auth/login).*)"],
};
