import { auth } from "@/auth";

import { ResumeGrid } from "@/components/resumes/resume-grid";
import { ResumeUploadDialog } from "@/components/resumes/resume-upload-dialog";

import { GetResumesService } from "@/modules/resumes/services/get-resumes.service";

export default async function ResumesPage() {
    const session = await auth();

    if (!session?.user?.id) {
        return null;
    }

    const service = new GetResumesService();

    const resumes = await service.execute(session.user.id);

    return (
        <main className="mx-auto max-w-7xl space-y-8 p-8">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Resume Library</h1>
            </div>

            <ResumeUploadDialog />

            <ResumeGrid resumes={resumes} />
        </main>
    );
}
