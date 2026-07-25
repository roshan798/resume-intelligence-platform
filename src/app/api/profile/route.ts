import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { logger } from "@/lib/logger";
import { ProfileService } from "@/modules/auth/services/profile.service";
import { updateProfileSchema } from "@/modules/auth/validations/update-profile.schema";

const service = new ProfileService();

export async function PATCH(request: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    const parsed = updateProfileSchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json(
            {
                message: "Please correct the profile details.",
                errors: parsed.error.flatten().fieldErrors,
            },
            { status: 422 },
        );
    }

    try {
        const profile = await service.update(session.user.id, parsed.data);
        logger.info({ userId: session.user.id }, "User profile updated");
        return NextResponse.json({ profile });
    } catch (error) {
        logger.error(
            { userId: session.user.id, error },
            "User profile update failed",
        );
        return NextResponse.json(
            { message: "Unable to update your profile. Please try again." },
            { status: 500 },
        );
    }
}
