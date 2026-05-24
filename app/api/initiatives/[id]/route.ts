import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/auth/server-user";
import { getInitiative, updateInitiative } from "@/lib/services/initiative-store";
import { jsonError, parseId, parseJsonRequest, toApiError } from "@/lib/validation/api";
import { updateInitiativeRequestSchema } from "@/lib/validation/initiative";

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

    return NextResponse.json(initiative);
  } catch (error) {
    return toApiError(error);
  }
}

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
    const userId = await requireUserId();
    const initiative = await updateInitiative(userId, id, payload);

    return NextResponse.json(initiative);
  } catch (error) {
    return toApiError(error);
  }
}
