import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { REFRESH_COOKIE_NAME } from "@/lib/cookie-names";
import { DASHBOARD, LOGIN } from "@/shared/constants/pageUrls";

/**
 * Presence check only. Checks the REFRESH cookie (7 days), not the access
 * cookie (15 minutes): the proxy can refresh an expired access token, so
 * checking it would bounce users to login unnecessarily. Token validity is
 * owned by the BFF refresh flow and the backend.
 */
export const middleware = (req: NextRequest) => {
  const { pathname, search } = req.nextUrl;
  const hasSession = Boolean(req.cookies.get(REFRESH_COOKIE_NAME)?.value);

  if (pathname === LOGIN) {
    return hasSession
      ? NextResponse.redirect(new URL(DASHBOARD, req.url))
      : NextResponse.next();
  }

  // Everything else matched (dashboard pages and /forceChangePassword)
  // needs a session.
  if (!hasSession) {
    const url = new URL(LOGIN, req.url);
    url.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
};

export const config = {
  // API routes do their own auth; skip Next internals and static files.
  matcher: ["/((?!api|_next|favicon.ico|.*\\..*).*)"],
};
