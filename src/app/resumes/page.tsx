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
        <main className="app-page">
            <div className="page-header">
                <div>
                    <p className="page-eyebrow">Your source of truth</p>
                    <h1 className="page-title">Resume library</h1>
                    <p className="page-description">Upload, parse, version, and tailor every resume from one workspace.</p>
                </div>
            </div>

            <ResumeUploadDialog />

            <ResumeGrid resumes={resumes} />
        </main>
    );
}
