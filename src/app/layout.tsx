import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Sans, Playfair_Display } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Suspense } from "react";
import { GlobalBreadcrumbs } from "@/components/navigation/global-breadcrumbs";
import { NavigationProgress } from "@/components/navigation/navigation-progress";
import { ThemeSwitcher } from "@/components/theme/theme-switcher";

const themeInitializationScript = `
try {
  const savedTheme = localStorage.getItem("theme");
  const theme = ["light", "dark", "system"].includes(savedTheme) ? savedTheme : "system";
  const dark = theme === "dark" || (theme === "system" && matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", dark);
  document.documentElement.dataset.theme = theme;
} catch {}
`;

const playfairDisplayHeading = Playfair_Display({subsets:['latin'],variable:'--font-heading'});

const notoSans = Noto_Sans({subsets:['latin'],variable:'--font-sans'});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  applicationName: "Resume Intelligence Platform",
  title: {
    default: "Resume Intelligence Platform | ATS Matching & Resume Tracking",
    template: "%s | Resume Intelligence Platform",
  },
  description: "Manage resume versions, analyze job descriptions, calculate explainable ATS matches, improve LaTeX resumes with controlled AI suggestions, and track every application.",
  keywords: ["resume manager", "ATS resume matcher", "job description analysis", "resume keyword matching", "application tracker", "AI resume suggestions", "LaTeX resume"],
  authors: [{ name: "Resume Intelligence Platform" }],
  creator: "Resume Intelligence Platform",
  category: "productivity",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Resume Intelligence Platform",
    title: "Resume Intelligence Platform",
    description: "Explainable ATS matching, controlled AI resume improvements, version management, and application tracking in one platform.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Resume Intelligence Platform",
    description: "Explainable ATS matching, controlled AI resume improvements, and application tracking.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("h-full", "antialiased", geistSans.variable, geistMono.variable, "font-sans", notoSans.variable, playfairDisplayHeading.variable)}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitializationScript }} />
      </head>
      <body className="min-h-full flex flex-col">
        <Suspense fallback={null}>
          <NavigationProgress />
        </Suspense>
        <Suspense fallback={null}>
          <GlobalBreadcrumbs />
        </Suspense>
        {children}
        <ThemeSwitcher />
      </body>
    </html>
  );
}
