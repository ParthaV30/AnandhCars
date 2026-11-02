import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import { applySecurityHeaders } from "@/lib/security-headers";
import { apiRateLimiter, authRateLimiter } from "@/lib/rate-limiter";

export default async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.AUTH_SECRET });
  const isLoggedIn = !!token;
  const isOnAuth = req.nextUrl.pathname.startsWith("/auth");
  const isOnDashboard = req.nextUrl.pathname.startsWith("/dashboard");

  // Apply rate limiting to API routes
  const url = new URL(req.url);
  if (url.pathname.startsWith("/api/")) {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";

    // Use stricter rate limiting for auth endpoints
    if (url.pathname.startsWith("/api/auth/")) {
      const rateLimitResult = await authRateLimiter(ip);
      if (!rateLimitResult.success) {
        return NextResponse.json(
          { error: "Too many requests. Please try again later." },
          {
            status: 429,
            headers: {
              "Retry-After": String(rateLimitResult.retryAfter || 60),
              "X-RateLimit-Remaining": String(rateLimitResult.remaining),
              "X-RateLimit-Reset": String(
                Math.ceil(rateLimitResult.resetTime / 1000)
              ),
            },
          }
        );
      }
    } else {
      // General API rate limiting
      const rateLimitResult = await apiRateLimiter(ip);
      if (!rateLimitResult.success) {
        return NextResponse.json(
          { error: "Too many requests. Please try again later." },
          {
            status: 429,
            headers: {
              "Retry-After": String(rateLimitResult.retryAfter || 60),
              "X-RateLimit-Remaining": String(rateLimitResult.remaining),
              "X-RateLimit-Reset": String(
                Math.ceil(rateLimitResult.resetTime / 1000)
              ),
            },
          }
        );
      }
    }
  }

  // Handle auth redirects
  if (isOnAuth) {
    if (isLoggedIn) {
      const response = NextResponse.redirect(new URL("/dashboard", req.nextUrl));
      return applySecurityHeaders(response);
    }
    return applySecurityHeaders(NextResponse.next());
  }

  if (isOnDashboard) {
    if (!isLoggedIn) {
      const loginUrl = new URL("/auth/login", req.nextUrl.origin);
      loginUrl.searchParams.set(
        "callbackUrl",
        req.nextUrl.pathname + req.nextUrl.search
      );
      const response = NextResponse.redirect(loginUrl);
      return applySecurityHeaders(response);
    }
    return applySecurityHeaders(NextResponse.next());
  }

  if (req.nextUrl.pathname === "/") {
    if (isLoggedIn) {
      const response = NextResponse.redirect(new URL("/dashboard", req.nextUrl));
      return applySecurityHeaders(response);
    }
    const response = NextResponse.redirect(new URL("/auth/login", req.nextUrl.origin));
    return applySecurityHeaders(response);
  }

  return applySecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
};