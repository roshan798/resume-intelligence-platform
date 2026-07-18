import Link from "next/link";
import { FileText, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";

export function ResumeEmptyState() {
    return (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-20 text-center">
            <FileText className="mb-6 h-14 w-14 text-muted-foreground" />

            <h2 className="text-2xl font-semibold">No resumes yet</h2>

            <p className="mt-2 max-w-md text-muted-foreground">
                Upload your first resume to begin AI analysis, ATS scoring,
                semantic matching, and version tracking.
            </p>

            <Button
                className="mt-8"
                asChild>
                <Link href="/resumes/upload">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Resume
                </Link>
            </Button>
        </div>
    );
}
