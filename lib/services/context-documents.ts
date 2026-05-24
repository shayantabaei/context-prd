import { extractTextFromFile, isSupportedContextFile } from "@/lib/documents/extract-text";
import type { ContextDocument } from "@/lib/types/initiative";
import { createDocument, getInitiative } from "./initiative-store";

export async function uploadContextDocuments(
  userId: string,
  initiativeId: string,
  files: File[]
): Promise<ContextDocument[]> {
  const initiative = await getInitiative(userId, initiativeId);

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

        return createDocument(userId, {
          initiativeId,
          filename: file.name,
          mimeType: file.type || "application/octet-stream",
          extractedText,
          processingStatus: "processed",
          fileSize: file.size
        });
      } catch (error) {
        return createDocument(userId, {
          initiativeId,
          filename: file.name,
          mimeType: file.type || "application/octet-stream",
          processingStatus: "failed",
          fileSize: file.size,
          extractionError:
            error instanceof Error ? error.message : "Text extraction failed"
        });
      }
    })
  );
}
