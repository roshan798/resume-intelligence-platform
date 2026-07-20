import { redirect } from "next/navigation";

import { auth } from "@/auth";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Job Descriptions", robots: { index: false, follow: false } };

export default async function JobDescriptionsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();
    if (!session?.user?.id) redirect("/login");
    return children;
}
