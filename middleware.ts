import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  const sessionToken =
    request.cookies.get("rp_session")?.value ||
    request.cookies.get("reelspulse_session")?.value ||
    request.cookies.get("token")?.value;

  const isSuperAdmin =
    request.cookies.get("rp_is_superadmin")?.value === "true";

  const isAuthenticated = Boolean(sessionToken && sessionToken.trim().length > 0);

  // 1. Auth & invitation routes (/login, /signup, /join) - allow unhindered public access
  if (pathname === "/login" || pathname === "/signup" || pathname.startsWith("/join")) {
    return NextResponse.next();
  }

  // 2. Protected admin routes (/admin, /admin/*)
  if (pathname.startsWith("/admin")) {
    if (!isAuthenticated) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (!isSuperAdmin) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // 3. Protected dashboard & tenant routes (/dashboard, /team)
  if (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/team")
  ) {
    if (!isAuthenticated) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/team/:path*",
    "/join/:path*",
    "/login",
    "/signup",
  ],
};
