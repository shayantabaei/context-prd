import { NextResponse } from "next/server";
import { ZodError, type ZodSchema } from "zod";

export function parseJsonRequest<T>(schema: ZodSchema<T>, body: unknown): T {
  return schema.parse(body);
}

export function parseId(value: string): string | null {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
    ? value
    : null;
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

    if (error.message === "UNAUTHORIZED") {
      return jsonError("Authentication required", 401);
    }

    if (error.message === "PRD_SECTION_NOT_FOUND") {
      return jsonError("PRD section not found", 404);
    }

    if (error.message === "PRD_NOT_FOUND") {
      return jsonError("Generated PRD not found", 404);
    }

    return jsonError(error.message, 500);
  }

  return jsonError("Unexpected server error", 500);
}
