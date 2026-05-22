import { NextResponse } from "next/server";
import { analyzeInitiative } from "@/lib/services/initiative-analysis";
import { jsonError, parseId, toApiError } from "@/lib/validation/api";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(_request: Request, context: RouteContext) {
  try {
    const { id: idParam } = await context.params;
    const id = parseId(idParam);

    if (!id) {
      return jsonError("Invalid initiative id", 400);
    }

    const analysis = await analyzeInitiative(id);

    return NextResponse.json(analysis);
  } catch (error) {
    return toApiError(error);
  }
}
