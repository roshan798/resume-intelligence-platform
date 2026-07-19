import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

interface RateBucket { count: number; resetAt: number }
const buckets = new Map<string, RateBucket>();

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const requestId = request.headers.get("x-request-id") ?? randomUUID();
    const limit = ratePolicy(pathname, request.method);
    if (limit) {
        const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
        const client = forwarded || request.headers.get("x-real-ip") || "unknown";
        const result = consume(`${client}:${limit.group}`, limit.requests, limit.windowMs);
        if (!result.allowed) {
            return NextResponse.json(
                { message: "Too many requests. Please try again later.", requestId },
                { status: 429, headers: { "Retry-After": String(Math.ceil((result.resetAt - Date.now()) / 1000)), "X-Request-Id": requestId } },
            );
        }
    }

    const sessionToken =
        request.cookies.get("__Secure-authjs.session-token")?.value ||
        request.cookies.get("authjs.session-token")?.value ||
        request.cookies.get("__Secure-next-auth.session-token")?.value ||
        request.cookies.get("next-auth.session-token")?.value;
    const protectedPage = ["/dashboard", "/resumes", "/applications", "/ai", "/settings", "/matches", "/match-results", "/semantic-search", "/job-descriptions"].some((prefix) => pathname.startsWith(prefix));
    if (!sessionToken && protectedPage) return NextResponse.redirect(new URL("/login", request.url));
    if (sessionToken && (pathname === "/login" || pathname === "/register")) return NextResponse.redirect(new URL("/dashboard", request.url));

    const headers = new Headers(request.headers);
    headers.set("x-request-id", requestId);
    const response = NextResponse.next({ request: { headers } });
    response.headers.set("X-Request-Id", requestId);
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
    response.headers.set("Content-Security-Policy", "frame-ancestors 'self'");
    return response;
}

function ratePolicy(pathname: string, method: string) {
    if (method === "GET" || method === "HEAD" || method === "OPTIONS") return null;
    if (pathname.startsWith("/api/ai/") || pathname.includes("/suggestions/")) return { group: "ai", requests: 20, windowMs: 60_000 };
    if (pathname === "/api/register" || pathname.startsWith("/api/auth/")) return { group: "auth", requests: 10, windowMs: 15 * 60_000 };
    if (pathname === "/api/resumes" || pathname === "/api/resumes/upload") return { group: "upload", requests: 10, windowMs: 10 * 60_000 };
    if (pathname.startsWith("/api/")) return { group: "api-write", requests: 120, windowMs: 60_000 };
    return null;
}

function consume(key: string, limit: number, windowMs: number) {
    const now = Date.now();
    const bucket = buckets.get(key);
    if (!bucket || bucket.resetAt <= now) {
        const next = { count: 1, resetAt: now + windowMs };
        buckets.set(key, next);
        if (buckets.size > 10_000) for (const [entry, value] of buckets) if (value.resetAt <= now) buckets.delete(entry);
        return { allowed: true, resetAt: next.resetAt };
    }
    bucket.count += 1;
    return { allowed: bucket.count <= limit, resetAt: bucket.resetAt };
}

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
