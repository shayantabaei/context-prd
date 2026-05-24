import { NextResponse } from "next/server";
import { refinePrdSection } from "@/lib/services/prd-refinement";
import { jsonError, parseId, parseJsonRequest, toApiError } from "@/lib/validation/api";
import {
  refinePrdSectionRequestSchema,
  refinePrdSectionResponseSchema
} from "@/lib/validation/initiative";

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
      refinePrdSectionRequestSchema,
      await request.json()
    );
    const section = await refinePrdSection({
      initiativeId: id,
      prd: payload.prd,
      sectionId: payload.sectionId,
      instruction: payload.instruction,
      clarificationAnswers: payload.clarificationAnswers
    });

    return NextResponse.json(refinePrdSectionResponseSchema.parse({ section }));
  } catch (error) {
    return toApiError(error);
  }
}
