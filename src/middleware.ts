import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // 1. Scan across all standard, local, and secure variations NextAuth uses
    const sessionToken =
        request.cookies.get("__Secure-authjs.session-token")?.value ||
        request.cookies.get("authjs.session-token")?.value ||
        request.cookies.get("__Secure-next-auth.session-token")?.value ||
        request.cookies.get("next-auth.session-token")?.value ||
        // Check for any fallback cookie names containing "session-token"
        request.cookies.getAll().find((c) => c.name.includes("session-token"))
            ?.value;

    // 2. Logging check (Optional: Keep this temporarily to see what cookies exist)
    console.log(
        `[Middleware Check] Path: ${pathname} | Authenticated: ${!!sessionToken}`,
    );

    // 3. Security Boundary: If trying to hit dashboard without a token, redirect to login
    if (!sessionToken && pathname.startsWith("/dashboard")) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    // 4. Reverse Boundary: If already authenticated, don't let them sit on the login page
    if (sessionToken && (pathname === "/login" || pathname === "/register")) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/dashboard/:path*",
        "/resumes/:path*",
        "/applications/:path*",
        "/ai/:path*",
        "/settings/:path*",
        "/matches/:path*",
        "/match-results/:path*",
        "/login",
        "/register",
    ],
};
