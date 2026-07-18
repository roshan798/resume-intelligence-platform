export { auth as middleware } from "@/auth";

export const config = {
    matcher: [
        "/dashboard/:path*",
        "/resumes/:path*",
        "/applications/:path*",
        "/ai/:path*",
        "/settings/:path*",
    ],
};
