import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    return {
        rules: {
            userAgent: "*",
            allow: ["/", "/architecture"],
            disallow: ["/api/", "/dashboard", "/resumes", "/job-descriptions", "/matches", "/match-results", "/applications", "/ai", "/settings", "/semantic-search"],
        },
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
