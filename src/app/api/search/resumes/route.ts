import { NextRequest, NextResponse } from "next/server";

import { SearchSimilarResumesService } from "@/modules/search/services/search-similar-resumes.service";

export async function POST(request: NextRequest) {
    const body = await request.json();

    const service = new SearchSimilarResumesService();

    const result = await service.execute(body.query);

    return NextResponse.json(result);
}
