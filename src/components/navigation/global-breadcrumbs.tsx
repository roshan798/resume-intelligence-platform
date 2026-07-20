"use client";

import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { usePathname } from "next/navigation";

interface BreadcrumbItem {
    label: string;
    href?: string;
}

const publicPaths = new Set(["/", "/login", "/register", "/architecture"]);

export function GlobalBreadcrumbs() {
    const pathname = usePathname();
    if (publicPaths.has(pathname)) return null;

    const items = buildBreadcrumbs(pathname);
    if (items.length === 0) return null;

    return (
        <div className="border-b bg-background/95">
            <nav
                aria-label="Breadcrumb"
                className="container mx-auto max-w-7xl overflow-x-auto px-4 py-3"
            >
                <ol className="flex min-w-max items-center gap-2 text-sm">
                    {items.map((item, index) => {
                        const isCurrent = index === items.length - 1;
                        return (
                            <li key={`${item.label}-${index}`} className="flex items-center gap-2">
                                {index > 0 ? (
                                    <ChevronRight aria-hidden="true" className="size-4 text-muted-foreground" />
                                ) : null}
                                {item.href && !isCurrent ? (
                                    <Link
                                        href={item.href}
                                        className="flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground"
                                    >
                                        {index === 0 ? <Home aria-hidden="true" className="size-4" /> : null}
                                        {item.label}
                                    </Link>
                                ) : (
                                    <span
                                        aria-current={isCurrent ? "page" : undefined}
                                        className={isCurrent ? "font-medium text-foreground" : "text-muted-foreground"}
                                    >
                                        {index === 0 ? <Home aria-hidden="true" className="mr-1.5 inline size-4" /> : null}
                                        {item.label}
                                    </span>
                                )}
                            </li>
                        );
                    })}
                </ol>
            </nav>
        </div>
    );
}

function buildBreadcrumbs(pathname: string): BreadcrumbItem[] {
    const segments = pathname.split("/").filter(Boolean);
    const first = segments[0];
    const items: BreadcrumbItem[] = [
        { label: "Dashboard", href: "/dashboard" },
    ];

    if (!first || first === "dashboard") return [{ label: "Dashboard" }];

    switch (first) {
        case "resumes":
            items.push({ label: "Resumes", href: "/resumes" });
            if (segments[1] === "upload") items.push({ label: "Upload resume" });
            else if (segments[1]) {
                items.push({ label: "Resume", href: `/resumes/${segments[1]}` });
                if (segments[2] === "versions" && segments[3]) {
                    items.push({ label: "Version details" });
                }
            }
            break;
        case "job-descriptions":
            items.push({ label: "Job descriptions", href: "/job-descriptions" });
            if (segments[1] === "new") items.push({ label: "New job description" });
            else if (segments[1]) items.push({ label: "Job description details" });
            break;
        case "match-results":
            items.push({ label: "Job descriptions", href: "/job-descriptions" });
            items.push({ label: "Ranked matches" });
            break;
        case "matches":
            items.push({ label: "Job descriptions", href: "/job-descriptions" });
            items.push({ label: "Match breakdown" });
            break;
        case "ai":
            items.push({ label: "AI suggestions", href: "/ai/suggestions" });
            if (segments[1] && segments[1] !== "suggestions") {
                items.push({ label: titleCase(segments[1]) });
            }
            break;
        case "semantic-search":
            items.push({ label: "Semantic search" });
            break;
        case "applications":
            items.push({ label: "Applications" });
            break;
        case "settings":
            items.push({ label: "Settings" });
            break;
        default:
            items.push({ label: titleCase(first) });
    }

    const last = items.at(-1);
    if (last?.href && pathname === last.href) delete last.href;
    return items;
}

function titleCase(value: string): string {
    return value
        .split("-")
        .map((word) => word.charAt(0).toLocaleUpperCase() + word.slice(1))
        .join(" ");
}
