import { NextResponse } from "next/server";
import { updateInitiative } from "@/lib/services/initiative-store";
import { jsonError, parseId, parseJsonRequest, toApiError } from "@/lib/validation/api";
import { updateInitiativeRequestSchema } from "@/lib/validation/initiative";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PUT(request: Request, context: RouteContext) {
  try {
    const { id: idParam } = await context.params;
    const id = parseId(idParam);

    if (!id) {
      return jsonError("Invalid initiative id", 400);
    }

    const payload = parseJsonRequest(
      updateInitiativeRequestSchema,
      await request.json()
    );
    const initiative = updateInitiative(id, payload);

    return NextResponse.json(initiative);
  } catch (error) {
    return toApiError(error);
  }
}
