import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { GetResumesService } from "@/modules/resumes/services/get-resumes.service";
import { UploadResumeService } from "@/modules/resumes/services/upload-resume.service";
import { uploadResumeSchema } from "@/modules/resumes/validations/upload-resume.schema";
import { AppError } from "@/shared/errors/app.error";

export async function GET() {
    const session = await auth();

    if (!session?.user?.id) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const service = new GetResumesService();
    const resumes = await service.execute(session.user.id);

    return NextResponse.json(resumes);
}

export async function POST(request: Request) {
    const session = await auth();

    if (!session?.user?.id) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const formData = await request.formData();
        const file = formData.get("file");
        const styleFileValue = formData.get("styleFile");
        const metadata = uploadResumeSchema.safeParse({
            title: formData.get("title"),
            primaryStack: formData.get("primaryStack") || undefined,
            tags: formData
                .getAll("tags")
                .filter((tag): tag is string => typeof tag === "string"),
        });

        if (!(file instanceof File) || !metadata.success) {
            return NextResponse.json(
                {
                    message: "Provide valid resume metadata and a resume file.",
                    errors: metadata.success
                        ? undefined
                        : metadata.error.flatten().fieldErrors,
                },
                { status: 400 },
            );
        }

        const service = new UploadResumeService();
        const result = await service.execute(session.user.id, {
            ...metadata.data,
            file,
            styleFile:
                styleFileValue instanceof File && styleFileValue.size > 0
                    ? styleFileValue
                    : undefined,
        });

        return NextResponse.json(result, { status: 201 });
    } catch (error) {
        if (error instanceof AppError) {
            return NextResponse.json(
                { code: error.code, message: error.message },
                { status: error.statusCode },
            );
        }

        return NextResponse.json(
            { message: "Unable to upload the resume. Please try again." },
            { status: 500 },
        );
    }
}
