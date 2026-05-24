import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/auth/server-user";
import {
  getClarificationAnswers,
  getDocumentsForInitiative,
  getInitiative,
  getLatestGeneratedPrd,
  getLatestInitiativeAnalysis
} from "@/lib/services/initiative-store";
import type { WorkflowStateResponse } from "@/lib/types/initiative";
import { jsonError, parseId, toApiError } from "@/lib/validation/api";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id: idParam } = await context.params;
    const id = parseId(idParam);

    if (!id) {
      return jsonError("Invalid initiative id", 400);
    }

    const userId = await requireUserId();
    const initiative = await getInitiative(userId, id);

    if (!initiative) {
      return jsonError("Initiative not found", 404);
    }

    const [documents, analysis, clarificationAnswers, generatedPrd] =
      await Promise.all([
        getDocumentsForInitiative(userId, id),
        getLatestInitiativeAnalysis(userId, id),
        getClarificationAnswers(userId, id),
        getLatestGeneratedPrd(userId, id)
      ]);

    const response: WorkflowStateResponse = {
      initiative,
      documents,
      analysis,
      clarificationAnswers,
      generatedPrd
    };

    return NextResponse.json(response);
  } catch (error) {
    return toApiError(error);
  }
}
