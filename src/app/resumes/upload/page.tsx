import { ResumeUploadDialog } from "@/components/resumes/resume-upload-dialog";

export default function UploadResumePage() {
    return (
        <main className="container mx-auto max-w-4xl space-y-8 py-10">
            <div>
                <h1 className="text-4xl font-bold">Upload Resume</h1>

                <p className="mt-2 text-muted-foreground">
                    Upload a resume to create a master version. The platform
                    will automatically parse sections, extract keywords and
                    prepare it for AI tailoring.
                </p>
            </div>

            <ResumeUploadDialog />
        </main>
    );
}
