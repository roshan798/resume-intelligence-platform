import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { GetResumesService } from "@/modules/resumes/services/get-resumes.service";
import { UploadResumeService } from "@/modules/resumes/services/upload-resume.service";
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
    const formData = await request.formData();
    const title = formData.get("title");
    const primaryStack = formData.get("primaryStack");
    const file = formData.get("file");
    if (typeof title !== "string" || !(file instanceof File)) {
        return NextResponse.json(
            { message: "Invalid request" },
            { status: 400 },
        );
    }
    const service = new UploadResumeService();
    const result = await service.execute(session.user.id, {
        title,
        primaryStack:
            typeof primaryStack === "string" ? primaryStack : undefined,
        file,
    });
    return NextResponse.json(result, { status: 201 });
}
