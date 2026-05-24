import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/auth/server-user";
import {
  getInitiative,
  upsertClarificationAnswers
} from "@/lib/services/initiative-store";
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
    const userId = await requireUserId();
    const initiative = await getInitiative(userId, id);

    if (!initiative) {
      return jsonError("Initiative not found", 404);
    }

    await upsertClarificationAnswers(
      userId,
      id,
      payload.clarificationAnswers
    );

    return NextResponse.json({ clarificationAnswers: payload.clarificationAnswers });
  } catch (error) {
    return toApiError(error);
  }
}
