import type { Metadata } from "next";

export const metadata: Metadata = { title: "Semantic Search", robots: { index: false, follow: false } };

export default function SemanticSearchLayout({ children }: { children: React.ReactNode }) { return children; }
