import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { VersionCard } from "@/components/resumes/version-card";
import { GetResumeService } from "@/modules/resumes/services/get-resume.service";
interface Props {
    params: Promise<{ resumeId: string }>;
}
export default async function ResumePage(props: Props) {
    const session = await auth();
    if (!session?.user?.id) {
        return null;
    }
    const params = await props.params;
    const service = new GetResumeService();
    const resume = await service.execute(session.user.id, params.resumeId);
    if (!resume) {
        notFound();
    }
    return (
        <main className="mx-auto max-w-5xl space-y-8 p-8">
            {" "}
            <div>
                {" "}
                <h1 className="text-3xl font-bold">{resume.title}</h1>{" "}
                <p className="text-muted-foreground">
                    {resume.primaryStack}
                </p>{" "}
            </div>{" "}
            <div className="space-y-4">
                {" "}
                {resume.versions.map((version) => (
                    <VersionCard
                        key={version.id}
                        version={{
                            id: version.id,
                            versionNumber: version.versionNumber,
                            status: version.status,
                            createdAt: version.createdAt.toISOString(),
                        }}
                    />
                ))}{" "}
            </div>{" "}
        </main>
    );
}
