import { auth } from "@/auth";

import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard", robots: { index: false, follow: false } };

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export default async function DashboardLayout({
    children,
}: DashboardLayoutProps) {
    const session = await auth();

    if (!session?.user) {
        redirect("/login");
    }

    return children;
}
