import { notFound } from "next/navigation";

import { auth } from "@/auth";

import { KeywordPanel } from "@/components/resumes/keyword-panel";
import { ParsedSections } from "@/components/resumes/parsed-sections";
import { VersionActions } from "@/components/resumes/version-actions";
import { VersionEditor } from "@/components/resumes/version-editor";
import { VersionHeader } from "@/components/resumes/version-header";
import { VersionInfo } from "@/components/resumes/version-info";
import { VersionLineage } from "@/components/resumes/version-lineage";
import { VersionRawText } from "@/components/resumes/version-raw-text";

import { GetVersionLineageService } from "@/modules/resumes/services/get-version-lineage.service";
import { GetVersionService } from "@/modules/resumes/services/get-version.service";

interface ResumeVersionPageProps {
    params: Promise<{
        resumeId: string;
        versionId: string;
    }>;
}

function toRecord(value: unknown): Record<string, unknown> | null {
    if (typeof value !== "object" || value === null || Array.isArray(value)) {
        return null;
    }

    return value as Record<string, unknown>;
}

export default async function ResumeVersionPage({
    params,
}: ResumeVersionPageProps) {
    const session = await auth();

    if (!session?.user?.id) {
        notFound();
    }

    const { resumeId, versionId } = await params;

    const versionService = new GetVersionService();
    const lineageService = new GetVersionLineageService();

    const [version, lineage] = await Promise.all([
        versionService.execute(versionId, session.user.id),
        lineageService.execute(resumeId, session.user.id),
    ]);

    if (!version || version.resumeId !== resumeId) {
        notFound();
    }

    const parsedSections = toRecord(version.parsedSections);
    const canonicalKeywords = toRecord(version.canonicalKeywords);

    return (
        <main className="container mx-auto max-w-7xl space-y-8 px-4 py-8">
            <VersionHeader version={version} />
            <VersionActions
                versionId={version.id}
                resumeId={resumeId}
                status={version.status}
                hasRawText={Boolean(version.rawText?.trim())}
                hasLatexSource={Boolean(version.latexSource?.trim())}
            />

            <VersionInfo version={version} />

            <VersionLineage
                resumeId={resumeId}
                versions={lineage}
            />

            {version.status === "TAILORED_DRAFT" ? (
                <VersionEditor
                    versionId={version.id}
                    initialRawText={version.rawText}
                    initialLatexSource={version.latexSource}
                />
            ) : (
                <VersionRawText
                    rawText={version.rawText}
                    latexSource={version.latexSource}
                />
            )}

            <KeywordPanel keywords={canonicalKeywords} />

            <ParsedSections parsedSections={parsedSections} />
        </main>
    );
}
