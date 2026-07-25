"use client";

import Link from "next/link";
import {
    BriefcaseBusiness,
    ChevronRight,
    FileText,
    Home,
    MessageSquareText,
    Search,
    Settings,
    UserRound,
} from "lucide-react";
import { usePathname } from "next/navigation";

import { LogoutButton } from "@/components/auth/logout-button";
import { Button } from "@/components/ui/button";

interface BreadcrumbItem {
    label: string;
    href?: string;
}

const publicPaths = new Set(["/", "/login", "/register", "/architecture"]);
const primaryNavigation = [
    { label: "Dashboard", href: "/dashboard", icon: Home },
    { label: "Resumes", href: "/resumes", icon: FileText },
    { label: "Jobs", href: "/job-descriptions", icon: Search },
    { label: "Applications", href: "/applications", icon: BriefcaseBusiness },
    { label: "AI Chat", href: "/ai/chat", icon: MessageSquareText },
];

export function GlobalBreadcrumbs() {
    const pathname = usePathname();
    if (publicPaths.has(pathname)) return null;

    const items = buildBreadcrumbs(pathname);
    if (items.length === 0) return null;

    return (
        <header className="sticky top-0 z-40 border-b bg-background/90 shadow-sm backdrop-blur-xl">
            <div className="container mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
                <Link href="/dashboard" className="flex shrink-0 items-center gap-2" aria-label="Resume Intelligence dashboard">
                    <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                        <FileText aria-hidden="true" className="size-4" />
                    </span>
                    <span className="hidden leading-tight xl:block">
                        <span className="block text-xs text-muted-foreground">Resume Intelligence</span>
                        <span className="block text-sm font-bold">Workspace</span>
                    </span>
                </Link>
                <nav aria-label="Primary navigation" className="hidden min-w-0 flex-1 items-center justify-center gap-1 md:flex">
                    {primaryNavigation.map(({ label, href, icon: Icon }) => {
                        const isActive = pathname === href || (href !== "/dashboard" && pathname.startsWith(`${href}/`));
                        return (
                            <Link
                                key={href}
                                href={href}
                                aria-current={isActive ? "page" : undefined}
                                className="inline-flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground aria-[current=page]:bg-muted aria-[current=page]:text-foreground"
                            >
                                <Icon aria-hidden="true" className="size-4" />
                                {label}
                            </Link>
                        );
                    })}
                </nav>
                <div className="ml-auto flex shrink-0 items-center gap-1">
                    <Button variant="ghost" size="icon-sm" asChild>
                        <Link href="/settings" aria-label="Settings">
                            <Settings aria-hidden="true" />
                        </Link>
                    </Button>
                    <Button variant="ghost" size="sm" asChild>
                        <Link href="/profile">
                            <UserRound aria-hidden="true" />
                            <span className="hidden sm:inline">Profile</span>
                        </Link>
                    </Button>
                    <LogoutButton compact />
                </div>
            </div>
            <div className="border-t border-border/60">
                <div className="container mx-auto max-w-7xl px-4 sm:px-6">
                <nav aria-label="Mobile navigation" className="-mx-1 flex gap-1 overflow-x-auto py-2 md:hidden">
                    {primaryNavigation.map(({ label, href, icon: Icon }) => {
                        const isActive = pathname === href || (href !== "/dashboard" && pathname.startsWith(`${href}/`));
                        return (
                            <Link
                                key={href}
                                href={href}
                                aria-current={isActive ? "page" : undefined}
                                className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground aria-[current=page]:bg-muted aria-[current=page]:text-foreground"
                            >
                                <Icon aria-hidden="true" className="size-3.5" />
                                {label}
                            </Link>
                        );
                    })}
                </nav>
                <nav aria-label="Breadcrumb" className="hidden min-w-0 overflow-x-auto py-2 md:block">
                    <ol className="flex min-w-max items-center gap-1.5 text-xs">
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
            </div>
        </header>
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
            if (segments[1] === "chat") {
                items.push({ label: "AI chat" });
            } else if (segments[1] && segments[1] !== "suggestions") {
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
        case "profile":
            items.push({ label: "Profile" });
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
