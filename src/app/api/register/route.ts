import { NextRequest, NextResponse } from "next/server";

import { RegisterService } from "@/modules/auth/services/register.service";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const service = new RegisterService();

        const user = await service.execute(body);

        return NextResponse.json(user, {
            status: 201,
        });
    } catch (error) {
        return NextResponse.json(
            {
                message:
                    error instanceof Error
                        ? error.message
                        : "Registration failed",
            },
            {
                status: 400,
            },
        );
    }
}
