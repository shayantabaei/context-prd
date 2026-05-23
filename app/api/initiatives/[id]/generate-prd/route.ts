import { NextResponse } from "next/server";
import { generatePrd } from "@/lib/services/prd-generation";
import { jsonError, parseId, parseJsonRequest, toApiError } from "@/lib/validation/api";
import { generatePrdRequestSchema } from "@/lib/validation/initiative";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(request: Request, context: RouteContext) {
  try {
    const { id: idParam } = await context.params;
    const id = parseId(idParam);

    if (!id) {
      return jsonError("Invalid initiative id", 400);
    }

    const payload = parseJsonRequest(
      generatePrdRequestSchema,
      await request.json()
    );
    const prd = await generatePrd(id, payload.clarificationAnswers);

    return NextResponse.json(prd);
  } catch (error) {
    return toApiError(error);
  }
}
