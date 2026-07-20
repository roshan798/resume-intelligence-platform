import type { Metadata } from "next";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
    ArrowDown,
    ArrowLeft,
    ArrowRight,
    Bot,
    BrainCircuit,
    BriefcaseBusiness,
    CheckCircle2,
    Cloud,
    Code2,
    Database,
    FileSearch,
    FileText,
    GitBranch,
    Layers3,
    Network,
    Search,
    ServerCog,
    ShieldCheck,
    Sparkles,
    Upload,
    UserRound,
} from "lucide-react";

export const metadata: Metadata = {
    title: "Architecture & Workflow | Resume Intelligence Platform",
    description:
        "A visual guide to the Resume Intelligence Platform architecture, data flow, matching, AI assistance, and application tracking.",
};

const workflowSteps: Array<{
    number: string;
    title: string;
    description: string;
    icon: LucideIcon;
}> = [
    {
        number: "01",
        title: "Upload a resume",
        description: "Add PDF, DOCX, or LaTeX. LaTeX can include its CLS or STY file for faithful previews.",
        icon: Upload,
    },
    {
        number: "02",
        title: "Parse and normalize",
        description: "Extract text, recognize section aliases, normalize skills, and create a version fingerprint.",
        icon: FileSearch,
    },
    {
        number: "03",
        title: "Analyze a job description",
        description: "Store an immutable snapshot and deterministically extract required and preferred keywords.",
        icon: BriefcaseBusiness,
    },
    {
        number: "04",
        title: "Calculate the match",
        description: "Compare the selected resume version with the JD and explain matched, missing, and weak terms.",
        icon: Search,
    },
    {
        number: "05",
        title: "Improve with control",
        description: "Generate optional AI suggestions, accept only useful changes, and safely apply them to LaTeX drafts.",
        icon: Sparkles,
    },
    {
        number: "06",
        title: "Track the application",
        description: "Record the company, role, linked resume and JD, status changes, notes, and follow-ups.",
        icon: GitBranch,
    },
];

const layers = [
    {
        label: "Experience layer",
        icon: UserRound,
        items: "Next.js pages · dashboards · resume editor · match explorer · application board",
    },
    {
        label: "Application layer",
        icon: ServerCog,
        items: "Route handlers · authentication · authorization · validation · rate limiting · structured logging",
    },
    {
        label: "Domain layer",
        icon: BrainCircuit,
        items: "Parsing · keyword extraction · deterministic scoring · versioning · AI orchestration · tracking",
    },
    {
        label: "Data and jobs layer",
        icon: Database,
        items: "PostgreSQL + pgvector · Prisma · object storage · Redis · BullMQ workers",
    },
    {
        label: "External providers",
        icon: Cloud,
        items: "Gemini · Groq · optional future providers · storage and observability integrations",
    },
];

const safeguards = [
    "Deterministic match results remain the source of truth; AI is downstream and optional.",
    "Suggestions require explicit acceptance before they can change a resume draft.",
    "LaTeX changes are limited to safe document-body targets; preamble, macros, packages, and styling stay protected.",
    "Every query and mutation is scoped to the authenticated user, with validation and rate limits at the boundary.",
    "Provider priority, per-feature models, usage limits, and monthly budgets control AI availability and cost.",
];

export default function ArchitecturePage() {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
                    <Link href="/" className="flex items-center gap-2 font-semibold">
                        <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <Network className="size-5" aria-hidden="true" />
                        </div>
                        <span>Architecture & workflow</span>
                    </Link>
                    <Link href="/" className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition hover:bg-muted">
                        <ArrowLeft className="size-4" aria-hidden="true" />
                        Home
                    </Link>
                </div>
            </header>

            <main>
                <section className="relative overflow-hidden border-b">
                    <div className="absolute inset-0 bg-linear-to-b from-primary/5 via-background to-background" />
                    <div className="relative mx-auto max-w-7xl px-6 py-20 md:py-28">
                        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">System map</p>
                        <h1 className="mt-4 max-w-4xl font-heading text-4xl font-bold tracking-tight md:text-6xl">
                            From uploaded resume to a tracked application.
                        </h1>
                        <p className="mt-6 max-w-3xl text-lg leading-8 text-muted-foreground">
                            This page shows how the product turns source documents into explainable matches, controlled AI improvements, and a complete application history.
                        </p>
                        <nav aria-label="Architecture sections" className="mt-8 flex flex-wrap gap-3 text-sm">
                            {[
                                ["#user-workflow", "User workflow"],
                                ["#system-architecture", "System architecture"],
                                ["#data-model", "Data model"],
                                ["#ai-safety", "AI safety"],
                                ["#deployment", "Deployment"],
                            ].map(([href, label]) => (
                                <a key={href} href={href} className="rounded-full border bg-background px-4 py-2 transition hover:bg-muted">{label}</a>
                            ))}
                        </nav>
                    </div>
                </section>

                <section id="user-workflow" className="scroll-mt-24 mx-auto max-w-7xl px-6 py-20">
                    <SectionHeading eyebrow="User journey" title="One connected workflow" description="Each stage preserves the inputs and decisions needed by the next, so the result stays traceable." />
                    <ol className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {workflowSteps.map((step, index) => {
                            const Icon = step.icon;
                            return (
                                <li key={step.number} className="relative rounded-2xl border bg-card p-6 shadow-sm">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary"><Icon className="size-5" aria-hidden="true" /></div>
                                        <span className="font-mono text-sm text-muted-foreground">{step.number}</span>
                                    </div>
                                    <h3 className="mt-5 text-lg font-semibold">{step.title}</h3>
                                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{step.description}</p>
                                    {index < workflowSteps.length - 1 ? <ArrowRight className="absolute -right-3 top-1/2 z-10 hidden size-6 rounded-full border bg-background p-1 text-muted-foreground xl:block" aria-hidden="true" /> : null}
                                </li>
                            );
                        })}
                    </ol>
                </section>

                <section id="system-architecture" className="scroll-mt-24 border-y bg-muted/30">
                    <div className="mx-auto max-w-7xl px-6 py-20">
                        <SectionHeading eyebrow="Technical architecture" title="A layered production system" description="The UI stays separate from domain logic, infrastructure, and external providers, making each part replaceable and testable." />
                        <div className="mt-12 mx-auto max-w-5xl space-y-3">
                            {layers.map((layer, index) => {
                                const Icon = layer.icon;
                                return (
                                    <div key={layer.label}>
                                        <div className="grid gap-4 rounded-2xl border bg-background p-5 shadow-sm md:grid-cols-[15rem_1fr] md:items-center">
                                            <div className="flex items-center gap-3 font-semibold"><span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><Icon className="size-5" aria-hidden="true" /></span>{layer.label}</div>
                                            <p className="text-sm leading-6 text-muted-foreground">{layer.items}</p>
                                        </div>
                                        {index < layers.length - 1 ? <ArrowDown className="mx-auto my-1 size-5 text-muted-foreground" aria-hidden="true" /> : null}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                <section id="data-model" className="scroll-mt-24 mx-auto max-w-7xl px-6 py-20">
                    <SectionHeading eyebrow="Data lineage" title="Every result points back to its source" description="Immutable versions and snapshots prevent later edits from silently changing an old match or application." />
                    <div className="mt-12 overflow-x-auto pb-4">
                        <div className="mx-auto flex min-w-225 items-center justify-center gap-3" role="img" aria-label="User owns resumes and job descriptions. Resume versions and job description analyses produce match results, AI suggestions, and applications.">
                            <Entity icon={UserRound} title="User" detail="Owner" />
                            <Connector />
                            <div className="space-y-4">
                                <Entity icon={FileText} title="Resume" detail="Metadata" />
                                <Entity icon={BriefcaseBusiness} title="Job Description" detail="Snapshots" />
                            </div>
                            <Connector />
                            <div className="space-y-4">
                                <Entity icon={GitBranch} title="Resume Version" detail="Parsed source" />
                                <Entity icon={FileSearch} title="JD Analysis" detail="Keywords" />
                            </div>
                            <Connector />
                            <Entity icon={Search} title="Match Result" detail="Scores + evidence" />
                            <Connector />
                            <div className="space-y-4">
                                <Entity icon={Bot} title="AI Suggestion" detail="Review state" />
                                <Entity icon={BriefcaseBusiness} title="Application" detail="Status history" />
                            </div>
                        </div>
                    </div>
                </section>

                <section id="ai-safety" className="scroll-mt-24 border-y bg-muted/30">
                    <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
                        <SectionHeading eyebrow="AI control plane" title="AI assists; it does not decide" description="Gemini and Groq receive constrained tasks only after deterministic analysis identifies what needs attention." />
                        <div className="rounded-2xl border bg-background p-6 shadow-sm">
                            <div className="flex flex-wrap items-center gap-3 text-sm font-medium">
                                <FlowChip icon={Search} label="Match evidence" />
                                <ArrowRight className="size-4 text-muted-foreground" aria-hidden="true" />
                                <FlowChip icon={Bot} label="Provider gateway" />
                                <ArrowRight className="size-4 text-muted-foreground" aria-hidden="true" />
                                <FlowChip icon={CheckCircle2} label="User approval" />
                                <ArrowRight className="size-4 text-muted-foreground" aria-hidden="true" />
                                <FlowChip icon={Code2} label="Safe LaTeX patch" />
                            </div>
                            <ul className="mt-8 space-y-4">
                                {safeguards.map((item) => (
                                    <li key={item} className="flex gap-3 text-sm leading-6"><ShieldCheck className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" /><span>{item}</span></li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </section>

                <section id="deployment" className="scroll-mt-24 mx-auto max-w-7xl px-6 py-20">
                    <SectionHeading eyebrow="Deployment" title="Two container stacks, one architecture" description="Development favors fast feedback and mounted source code. Production uses optimized images, health checks, persistent services, and background workers." />
                    <div className="mt-12 grid gap-6 lg:grid-cols-2">
                        <RuntimeCard title="Development" icon={Code2} items={["Next.js development server with hot reload", "PostgreSQL with pgvector", "Redis for queues and rate limits", "Worker process using the same source tree"]} />
                        <RuntimeCard title="Production" icon={Layers3} items={["Optimized standalone Next.js image", "Migration and health-check lifecycle", "Dedicated background worker", "Persistent database, Redis, and object storage"]} />
                    </div>
                </section>

                <section className="border-t bg-primary text-primary-foreground">
                    <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-14 md:flex-row md:items-center md:justify-between">
                        <div><h2 className="text-2xl font-bold">Ready to use the workflow?</h2><p className="mt-2 text-sm text-primary-foreground/75">Start with one resume, then analyze a job description and compare the result.</p></div>
                        <div className="flex flex-wrap gap-3"><Link href="/register" className="inline-flex items-center gap-2 rounded-lg bg-background px-5 py-3 text-sm font-semibold text-foreground">Create account <ArrowRight className="size-4" /></Link><Link href="/login" className="rounded-lg border border-primary-foreground/30 px-5 py-3 text-sm font-semibold">Sign in</Link></div>
                    </div>
                </section>
            </main>
        </div>
    );
}

function SectionHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
    return <div className="max-w-3xl"><p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">{eyebrow}</p><h2 className="mt-3 font-heading text-3xl font-bold tracking-tight md:text-4xl">{title}</h2><p className="mt-4 leading-7 text-muted-foreground">{description}</p></div>;
}

function Entity({ icon: Icon, title, detail }: { icon: LucideIcon; title: string; detail: string }) {
    return <div className="w-40 rounded-xl border bg-card p-4 text-center shadow-sm"><Icon className="mx-auto size-5 text-primary" aria-hidden="true" /><p className="mt-2 text-sm font-semibold">{title}</p><p className="mt-1 text-xs text-muted-foreground">{detail}</p></div>;
}

function Connector() {
    return <div className="flex items-center text-muted-foreground" aria-hidden="true"><span className="h-px w-6 bg-border" /><ArrowRight className="size-4" /></div>;
}

function FlowChip({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
    return <span className="inline-flex items-center gap-2 rounded-lg bg-muted px-3 py-2"><Icon className="size-4" aria-hidden="true" />{label}</span>;
}

function RuntimeCard({ title, icon: Icon, items }: { title: string; icon: LucideIcon; items: string[] }) {
    return <article className="rounded-2xl border bg-card p-6 shadow-sm"><div className="flex items-center gap-3"><span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary"><Icon className="size-5" aria-hidden="true" /></span><h3 className="text-xl font-semibold">{title}</h3></div><ul className="mt-6 space-y-3">{items.map((item) => <li key={item} className="flex gap-3 text-sm leading-6 text-muted-foreground"><CheckCircle2 className="mt-1 size-4 shrink-0 text-primary" aria-hidden="true" />{item}</li>)}</ul></article>;
}
