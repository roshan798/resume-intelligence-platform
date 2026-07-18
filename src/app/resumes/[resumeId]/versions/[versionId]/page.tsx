import { notFound } from "next/navigation";

import { auth } from "@/auth";

import { VersionActions } from "@/components/resumes/version-actions";
import { VersionHeader } from "@/components/resumes/version-header";
import { VersionInfo } from "@/components/resumes/version-info";
import { VersionLineage } from "@/components/resumes/version-lineage";
import { ParsedSections } from "@/components/resumes/parsed-sections";
import { KeywordPanel } from "@/components/resumes/keyword-panel";

import { GetVersionService } from "@/modules/resumes/services/get-version.service";
import { GetVersionLineageService } from "@/modules/resumes/services/get-version-lineage.service";

interface Props {
    params: Promise<{
        resumeId: string;
        versionId: string;
    }>;
}

export default async function ResumeVersionPage({ params }: Props) {
    const session = await auth();

    if (!session?.user?.id) {
        notFound();
    }

    const { resumeId, versionId } = await params;

    const versionService = new GetVersionService();
    const lineageService = new GetVersionLineageService();

    const version = await versionService.execute(versionId, session.user.id);

    if (!version) {
        notFound();
    }

    const lineage = await lineageService.execute(resumeId, session.user.id);

    return (
        <div className="container mx-auto space-y-8 p-2 py-8">
            <VersionHeader version={version} />

            <VersionActions versionId={version.id} />

            <VersionInfo version={version} />

            <VersionLineage
                resumeId={resumeId}
                versions={lineage}
            />

            <KeywordPanel
                keywords={version.canonicalKeywords as Record<string, unknown>}
            />

            <ParsedSections
                parsedSections={
                    version.parsedSections as Record<string, unknown>
                }
            />
        </div>
    );
}
