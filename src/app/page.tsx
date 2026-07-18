import Link from "next/link";
import {
    ArrowRight,
    FileText,
    Brain,
    Search,
    GitBranch,
    CheckCircle2,
    BarChart3,
    Sparkles,
} from "lucide-react";

export default function Home() {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur p-2">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
                    <Link
                        href="/"
                        className="flex items-center gap-2">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <FileText className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">
                                Resume Intelligence
                            </p>
                            <h1 className="text-base font-bold leading-none">
                                Platform
                            </h1>
                        </div>
                    </Link>

                    <nav className="flex items-center gap-3">
                        <Link
                            href="/login"
                            className="rounded-lg border px-4 py-2 text-sm font-medium transition hover:bg-muted">
                            Login
                        </Link>

                        <Link
                            href="/register"
                            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90">
                            Register
                        </Link>
                    </nav>
                </div>
            </header>

            <main>
                <section className="relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background" />
                    <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 md:py-28 lg:grid-cols-2 lg:items-center">
                        <div className="relative z-10 mt-2">
                            <span className="inline-flex items-center rounded-full border bg-background px-4 py-1 text-sm text-muted-foreground shadow-sm">
                                Deterministic ATS Matching + Optional AI
                            </span>

                            <h2 className="mt-6 max-w-3xl text-4xl font-bold leading-tight tracking-tight md:text-5xl lg:text-6xl">
                                Manage every resume.
                                <br />
                                Match every job description.
                                <br />
                                Know exactly{" "}
                                <span className="text-primary">why.</span>
                            </h2>

                            <p className="mt-6 max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
                                Upload multiple resume variants, analyze job
                                descriptions, receive deterministic ATS scores,
                                discover missing keywords, manage resume
                                versions, and use AI only where it actually
                                helps.
                            </p>

                            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                                <Link
                                    href="/register"
                                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground transition hover:opacity-90">
                                    Get Started
                                    <ArrowRight className="h-4 w-4" />
                                </Link>

                                <Link
                                    href="/login"
                                    className="inline-flex items-center justify-center rounded-lg border px-6 py-3 font-medium transition hover:bg-muted">
                                    Sign In
                                </Link>
                            </div>

                            <div className="mt-8 flex flex-wrap gap-3 text-sm text-muted-foreground">
                                <span className="rounded-full border px-3 py-1">
                                    PDF / DOCX / LaTeX
                                </span>
                                <span className="rounded-full border px-3 py-1">
                                    Keyword Matching
                                </span>
                                <span className="rounded-full border px-3 py-1">
                                    Version History
                                </span>
                                <span className="rounded-full border px-3 py-1">
                                    Application Tracker
                                </span>
                            </div>
                        </div>

                        <div className="relative z-10">
                            <div className="rounded-2xl border bg-card p-6 shadow-sm">
                                <div className="flex items-center justify-between border-b pb-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground">
                                            Best match for JD
                                        </p>
                                        <h3 className="text-lg font-semibold">
                                            Java Backend Resume v4
                                        </h3>
                                    </div>
                                    <div className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
                                        82% Match
                                    </div>
                                </div>

                                <div className="mt-6 space-y-4">
                                    <PreviewRow
                                        label="Matched Keywords"
                                        value="Java, Spring Boot, REST, Microservices"
                                    />
                                    <PreviewRow
                                        label="Missing Keywords"
                                        value="Kafka, Redis, AWS"
                                    />
                                    <PreviewRow
                                        label="Weak Section"
                                        value="Projects section needs stronger backend depth"
                                    />
                                </div>

                                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                                    <MiniStat
                                        title="Resumes"
                                        value="12"
                                        icon={<FileText className="h-4 w-4" />}
                                    />
                                    <MiniStat
                                        title="JD Analyses"
                                        value="48"
                                        icon={<BarChart3 className="h-4 w-4" />}
                                    />
                                    <MiniStat
                                        title="Versions"
                                        value="31"
                                        icon={<GitBranch className="h-4 w-4" />}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="mx-auto max-w-7xl px-6 py-20">
                    <div className="mx-auto max-w-2xl text-center">
                        <p className="text-sm font-medium text-primary">
                            Core capabilities
                        </p>
                        <h3 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
                            Built for repeat applications without repeated work
                        </h3>
                        <p className="mt-4 text-muted-foreground">
                            Keep every resume variant in one place, understand
                            match quality instantly, and only tailor when the
                            data says it is worth doing.
                        </p>
                    </div>

                    <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                        <FeatureCard
                            icon={<FileText className="h-6 w-6" />}
                            title="Resume Library"
                            description="Store multiple resume variants with tags, notes, and immutable version history."
                        />

                        <FeatureCard
                            icon={<Search className="h-6 w-6" />}
                            title="ATS Matching"
                            description="Use deterministic keyword scoring with section-wise explanations and missing terms."
                        />

                        <FeatureCard
                            icon={<Brain className="h-6 w-6" />}
                            title="AI Assistance"
                            description="Rewrite bullets, tailor content, and generate suggestions only when you explicitly want it."
                        />

                        <FeatureCard
                            icon={<GitBranch className="h-6 w-6" />}
                            title="Version Lineage"
                            description="Fork, finalize, archive, and trace every resume revision with confidence."
                        />
                    </div>
                </section>

                <section className="border-y bg-muted/30">
                    <div className="mx-auto max-w-7xl px-6 py-20">
                        <div className="mx-auto max-w-2xl text-center">
                            <p className="text-sm font-medium text-primary">
                                Implemented modules
                            </p>
                            <h3 className="mt-3 text-3xl font-bold tracking-tight">
                                Everything you’ve already built
                            </h3>
                            <p className="mt-4 text-muted-foreground">
                                A strong foundation is already in place across
                                parsing, scoring, tracking, and workflow
                                automation.
                            </p>
                        </div>

                        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {[
                                "Resume Upload & Parsing",
                                "PDF / DOCX / LaTeX Support",
                                "Keyword Extraction",
                                "JD Analysis",
                                "ATS Match Engine",
                                "Formatting Health Check",
                                "Resume Versioning",
                                "Application Tracker",
                                "Kanban Board",
                                "Semantic Search",
                                "Resume Recommendations",
                                "Background Workers",
                            ].map((item) => (
                                <Feature
                                    key={item}
                                    title={item}
                                />
                            ))}
                        </div>
                    </div>
                </section>

                <section className="mx-auto max-w-7xl px-6 py-20">
                    <div className="rounded-3xl border bg-card px-8 py-12 text-center shadow-sm">
                        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                            <Sparkles className="h-6 w-6" />
                        </div>
                        <h3 className="text-3xl font-bold tracking-tight">
                            Stop rebuilding the same resume twice
                        </h3>
                        <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
                            Keep one system for resume storage, JD analysis,
                            versioning, and job tracking so every future
                            application gets faster.
                        </p>

                        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                            <Link
                                href="/register"
                                className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground transition hover:opacity-90">
                                Create Account
                                <ArrowRight className="h-4 w-4" />
                            </Link>

                            <Link
                                href="/login"
                                className="inline-flex items-center justify-center rounded-lg border px-6 py-3 font-medium transition hover:bg-muted">
                                Login
                            </Link>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="border-t">
                <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-8 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
                    <p>Resume Intelligence Platform</p>
                    <p>Built with Next.js, Prisma, Supabase and AI</p>
                </div>
            </footer>
        </div>
    );
}

function FeatureCard({
    icon,
    title,
    description,
}: {
    icon: React.ReactNode;
    title: string;
    description: string;
}) {
    return (
        <div className="group rounded-2xl border bg-card p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                {icon}
            </div>
            <h3 className="mb-2 text-lg font-semibold">{title}</h3>
            <p className="text-sm leading-6 text-muted-foreground">
                {description}
            </p>
        </div>
    );
}

function Feature({ title }: { title: string }) {
    return (
        <div className="flex items-center gap-3 rounded-xl border bg-background p-4 shadow-sm">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            <p className="font-medium">{title}</p>
        </div>
    );
}

function PreviewRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-xl border bg-muted/40 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {label}
            </p>
            <p className="mt-2 text-sm font-medium">{value}</p>
        </div>
    );
}

function MiniStat({
    title,
    value,
    icon,
}: {
    title: string;
    value: string;
    icon: React.ReactNode;
}) {
    return (
        <div className="rounded-xl border p-4">
            <div className="mb-2 flex items-center gap-2 text-muted-foreground">
                {icon}
                <span className="text-xs uppercase tracking-wide">{title}</span>
            </div>
            <p className="text-2xl font-bold">{value}</p>
        </div>
    );
}
