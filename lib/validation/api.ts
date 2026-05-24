import { NextResponse } from "next/server";
import { ZodError, type ZodSchema } from "zod";

export function parseJsonRequest<T>(schema: ZodSchema<T>, body: unknown): T {
  return schema.parse(body);
}

export function parseId(value: string): number | null {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export function jsonError(message: string, status: number, details?: unknown) {
  return NextResponse.json({ error: message, details }, { status });
}

export function toApiError(error: unknown) {
  if (error instanceof ZodError) {
    return jsonError("Invalid request payload", 400, error.flatten());
  }

  if (error instanceof Error) {
    if (error.message === "INITIATIVE_NOT_FOUND") {
      return jsonError("Initiative not found", 404);
    }

    if (error.message === "PRD_SECTION_NOT_FOUND") {
      return jsonError("PRD section not found", 404);
    }

    return jsonError(error.message, 500);
  }

  return jsonError("Unexpected server error", 500);
}
