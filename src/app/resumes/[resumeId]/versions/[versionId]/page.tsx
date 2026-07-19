import { notFound } from "next/navigation";

import { auth } from "@/auth";

import { KeywordPanel } from "@/components/resumes/keyword-panel";
import { ParsedSections } from "@/components/resumes/parsed-sections";
import { ResumePdfPreview } from "@/components/resumes/resume-pdf-preview";
import { VersionActions } from "@/components/resumes/version-actions";
import { VersionEditor } from "@/components/resumes/version-editor";
import { VersionHeader } from "@/components/resumes/version-header";
import { VersionInfo } from "@/components/resumes/version-info";
import { VersionLineage } from "@/components/resumes/version-lineage";
import { VersionRawText } from "@/components/resumes/version-raw-text";
import { VersionSimilarity } from "@/components/resumes/version-similarity";
import {
    LatexSuggestionPanel,
    type DraftSuggestion,
} from "@/components/resumes/latex-suggestion-panel";

import { GetVersionLineageService } from "@/modules/resumes/services/get-version-lineage.service";
import { GetVersionService } from "@/modules/resumes/services/get-version.service";
import { GetVersionSimilarityService } from "@/modules/resumes/services/get-version-similarity.service";
import { AISuggestionService } from "@/modules/ai/services/ai-suggestion.service";

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
    const similarityService = new GetVersionSimilarityService();

    const [version, lineage, similarity] = await Promise.all([
        versionService.execute(versionId, session.user.id),
        lineageService.execute(resumeId, session.user.id),
        similarityService.execute(versionId, session.user.id),
    ]);

    if (!version || !similarity || version.resumeId !== resumeId) {
        notFound();
    }

    const parsedSections = toRecord(version.parsedSections);
    const canonicalKeywords = toRecord(version.canonicalKeywords);
    const linkedSuggestions =
        version.status === "TAILORED_DRAFT" &&
        version.sourceFormat === "LATEX" &&
        version.parentVersionId &&
        version.jdSnapshotId
            ? await new AISuggestionService().listForDraft(
                  version.parentVersionId,
                  version.jdSnapshotId,
                  session.user.id,
              )
            : [];
    const draftSuggestions = linkedSuggestions.map(toDraftSuggestion);

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

            <ResumePdfPreview
                versionId={version.id}
                sourceFormat={version.sourceFormat}
                fileMimeType={version.fileAsset?.mimeType}
            />

            <VersionSimilarity analysis={similarity} />

            <VersionLineage
                resumeId={resumeId}
                versions={lineage}
            />

            {version.status === "TAILORED_DRAFT" && version.sourceFormat === "LATEX" ? (
                <LatexSuggestionPanel
                    versionId={version.id}
                    suggestions={draftSuggestions}
                />
            ) : null}

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

function toDraftSuggestion(suggestion: {
    id: string;
    status: string;
    outputPayload: unknown;
}): DraftSuggestion {
    const output = toRecord(suggestion.outputPayload);
    const rawRecommendations = Array.isArray(output?.recommendations)
        ? output.recommendations
        : [];
    const recommendations = rawRecommendations.flatMap((item) => {
        const record = toRecord(item);
        if (!record) return [];
        const keyword = typeof record.keyword === "string" ? record.keyword : "Suggestion";
        const suggestedSection = typeof record.suggestedSection === "string" ? record.suggestedSection : "content";
        const suggestionText = typeof record.suggestion === "string" ? record.suggestion : "";
        const safetyNote = typeof record.safetyNote === "string" ? record.safetyNote : "Confirm that the content is accurate.";
        if (!suggestionText) return [];
        return [{ keyword, suggestedSection, suggestion: suggestionText, safetyNote }];
    });

    return {
        id: suggestion.id,
        status:
            suggestion.status === "APPLIED" || suggestion.status === "MANUALLY_APPLIED"
                ? suggestion.status
                : "ACCEPTED",
        recommendations,
    };
}
