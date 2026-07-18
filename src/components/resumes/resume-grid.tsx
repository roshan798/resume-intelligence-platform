import { ResumeCard } from "./resume-card";

export interface ResumeListItem {
    id: string;
    title: string;
    primaryStack: string | null;
    createdAt: Date;
    updatedAt: Date;
    versionCount: number;
    latestVersion: {
        id: string;
        versionNumber: number;
        status: string;
        createdAt: Date;
        matchCount: number;
    } | null;
}

interface Props {
    resumes: ResumeListItem[];
}

export function ResumeGrid({ resumes }: Props) {
    if (resumes.length === 0) {
        return (
            <div className="rounded-lg border border-dashed p-12 text-center">
                <h3 className="text-lg font-semibold">No resumes found</h3>

                <p className="mt-2 text-sm text-muted-foreground">
                    Upload your first resume to get started.
                </p>
            </div>
        );
    }

    return (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {resumes.map((resume) => (
                <ResumeCard
                    key={resume.id}
                    resume={resume}
                />
            ))}
        </div>
    );
}
