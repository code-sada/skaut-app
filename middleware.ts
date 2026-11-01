import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicPaths = ["/login", "/change-password", "/privacy", "/terms"];

function hasValidSessionCookieFormat(request: NextRequest): boolean {
  const userId = request.cookies.get("userId")?.value;
  const sessionSig = request.cookies.get("sessionSig")?.value;
  if (!userId || !sessionSig) return false;
  return /^[a-f0-9]{64}$/i.test(sessionSig);
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const isAuthenticated = hasValidSessionCookieFormat(request);

  if (publicPaths.includes(pathname)) {
    if (pathname === "/login" && isAuthenticated) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    if (pathname === "/change-password" && !isAuthenticated) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    return NextResponse.next();
  }

  if (!isAuthenticated) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}
