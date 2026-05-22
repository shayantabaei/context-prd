import { extractTextFromFile, isSupportedContextFile } from "@/lib/documents/extract-text";
import type { ContextDocument } from "@/lib/types/initiative";
import { createDocument, getInitiative } from "./initiative-store";

export async function uploadContextDocuments(
  initiativeId: number,
  files: File[]
): Promise<ContextDocument[]> {
  const initiative = getInitiative(initiativeId);

  if (!initiative) {
    throw new Error("INITIATIVE_NOT_FOUND");
  }

  return Promise.all(
    files.map(async (file) => {
      try {
        if (!isSupportedContextFile(file)) {
          throw new Error("Unsupported file type");
        }

        const extractedText = await extractTextFromFile(file);

        return createDocument({
          initiativeId,
          filename: file.name,
          mimeType: file.type || "application/octet-stream",
          extractedText,
          processingStatus: "processed"
        });
      } catch {
        return createDocument({
          initiativeId,
          filename: file.name,
          mimeType: file.type || "application/octet-stream",
          processingStatus: "failed"
        });
      }
    })
  );
}
