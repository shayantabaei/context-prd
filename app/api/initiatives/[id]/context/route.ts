import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/auth/server-user";
import { uploadContextDocuments } from "@/lib/services/context-documents";
import { jsonError, parseId, toApiError } from "@/lib/validation/api";

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

    const formData = await request.formData();
    const files = formData
      .getAll("files")
      .filter((value): value is File => value instanceof File);

    if (files.length === 0) {
      return jsonError("At least one file is required in the files field", 400);
    }

    const userId = await requireUserId();
    const documents = await uploadContextDocuments(userId, id, files);

    return NextResponse.json({ documents }, { status: 201 });
  } catch (error) {
    return toApiError(error);
  }
}
