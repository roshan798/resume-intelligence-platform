import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/auth";
import { SearchSimilarJDsService } from "@/modules/search/services/search-similar-jds.service";

export async function POST(request: NextRequest) {
    const session = await auth();

    if (!session?.user?.id) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const service = new SearchSimilarJDsService();

    const result = await service.execute(body.query, session.user.id);

    return NextResponse.json(result);
}
