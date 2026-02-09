import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip auth checks for public/auth pages
  if (pathname.startsWith("/auth")) {
    return NextResponse.next();
  }

  const isAuthApi = pathname.startsWith("/api/auth");

  // Public API endpoints (no auth required)
  const publicApiPrefixes = [
    "/api/reviews/platform-stats",
    "/api/analytics/platform-usage",
    "/api/analytics/profile-view",
  ];
  if (publicApiPrefixes.some((prefix) => pathname.startsWith(prefix))) {
    return NextResponse.next();
  }

  // Allow NextAuth's own endpoints through without auth to avoid edge/runtime issues
  if (isAuthApi) {
    return NextResponse.next();
  }

  // Check NextAuth token; if none, redirect to login
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

  if (!token?.sub) {
    const url = new URL("/auth/login", request.url);
    url.searchParams.set("callbackUrl", request.nextUrl.pathname + request.nextUrl.search);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/profile/:path*",
    "/services/:path*",
    "/professionals/:path*",
    "/notifications/:path*",
    "/activity/:path*",
    "/dashboard/:path*",
    "/messages/:path*",
    "/settings/:path*",
    "/bookings/:path*",
    "/admin/:path*",
    "/api/:path*",
  ],
};
