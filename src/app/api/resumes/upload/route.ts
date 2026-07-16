import { NextResponse } from "next/server";

import { UploadResumeService } from "@/modules/resumes/services/upload-resume.service";

export async function POST(request: Request) {
    const formData = await request.formData();

    const file = formData.get("file") as File;

    const title = formData.get("title") as string;

    const primaryStack = formData.get("primaryStack") as string;

    const userId = "temporary-user-id";

    const service = new UploadResumeService();

    const result = await service.execute(userId, {
        title,
        primaryStack,
        file,
    });

    return NextResponse.json(result);
}
