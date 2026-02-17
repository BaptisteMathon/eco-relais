import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = ["/login", "/register"];
const AUTH_PREFIX = "/login";

function isPublic(pathname: string) {
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (isPublic(pathname)) {
    return NextResponse.next();
  }

  // Redirect root to login (or dashboard if we had a cookie - we check JWT in client)
  if (pathname === "/") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Protected routes: /client, /partner, /admin - JWT is validated by API; we only redirect unauthenticated when API returns 401 (handled in axios interceptor). So we don't have access to JWT in middleware (it's in localStorage). So we can't do server-side JWT check in Edge middleware without cookies.
  // Option: use cookies for token in production. For now we allow navigation; the layout will redirect to login if no user in store (client-side).
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
