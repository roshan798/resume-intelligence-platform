import { NextResponse } from "next/server";

import { UploadResumeService } from "@/modules/resumes/services/upload-resume.service";
import { auth } from "@/auth";

export async function POST(request: Request) {
    const formData = await request.formData();

    const file = formData.get("file") as File;

    const title = formData.get("title") as string;

    const primaryStack = formData.get("primaryStack") as string;

    const session = await auth();

    if (!session?.user) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;


    const service = new UploadResumeService();

    const result = await service.execute(userId, {
        title,
        primaryStack,
        file,
    });

    return NextResponse.json(result);
}
