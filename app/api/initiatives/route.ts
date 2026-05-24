import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/auth/server-user";
import { createInitiative } from "@/lib/services/initiative-store";
import { createInitiativeRequestSchema } from "@/lib/validation/initiative";
import { parseJsonRequest, toApiError } from "@/lib/validation/api";

export async function POST(request: Request) {
  try {
    const payload = parseJsonRequest(
      createInitiativeRequestSchema,
      await request.json()
    );
    const userId = await requireUserId();
    const initiative = await createInitiative(userId, payload);

    return NextResponse.json(initiative, { status: 201 });
  } catch (error) {
    return toApiError(error);
  }
}
