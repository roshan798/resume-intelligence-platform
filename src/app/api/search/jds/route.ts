import { NextRequest, NextResponse } from "next/server";

import { SearchSimilarJDsService } from "@/modules/search/services/search-similar-jds.service";

export async function POST(request: NextRequest) {
    const body = await request.json();

    const service = new SearchSimilarJDsService();

    const result = await service.execute(body.query);

    return NextResponse.json(result);
}
