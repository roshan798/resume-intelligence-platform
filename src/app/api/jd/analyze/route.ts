import { NextResponse } from "next/server";

import { AnalyzeJDService } from "@/modules/jd/services/analyze-jd.service";

export async function POST(request: Request) {
    const body = await request.json();

    const service = new AnalyzeJDService();
    /*const session =
  await auth();

const userId =
  session.user.id;*/
    // TODO
    const result = await service.execute("temporary-user-id", body);

    return NextResponse.json(result);
}
