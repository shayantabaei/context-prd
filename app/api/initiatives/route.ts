import { NextResponse } from "next/server";
import { createInitiative } from "@/lib/services/initiative-store";
import { createInitiativeRequestSchema } from "@/lib/validation/initiative";
import { parseJsonRequest, toApiError } from "@/lib/validation/api";

export async function POST(request: Request) {
  try {
    const payload = parseJsonRequest(
      createInitiativeRequestSchema,
      await request.json()
    );
    const initiative = createInitiative(payload);

    return NextResponse.json(initiative, { status: 201 });
  } catch (error) {
    return toApiError(error);
  }
}
