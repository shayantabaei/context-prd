import mammoth from "mammoth";
import type pdfParse from "pdf-parse";

const textMimeTypes = new Set([
  "text/plain",
  "text/markdown",
  "application/octet-stream"
]);

export async function extractTextFromFile(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const filename = file.name.toLowerCase();
  const mimeType = file.type;

  if (filename.endsWith(".txt") || filename.endsWith(".md") || textMimeTypes.has(mimeType)) {
    return buffer.toString("utf-8").trim();
  }

  if (filename.endsWith(".pdf") || mimeType === "application/pdf") {
    const pdfParse = loadPdfParser();
    const result = await pdfParse(buffer);
    return result.text.trim();
  }

  if (
    filename.endsWith(".docx") ||
    mimeType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const result = await mammoth.extractRawText({ buffer });
    return result.value.trim();
  }

  throw new Error(`Unsupported file type for ${file.name}`);
}

function loadPdfParser(): typeof pdfParse {
  const requirePdfParse = eval("require") as NodeRequire;
  const parser = requirePdfParse("pdf-parse") as { default?: typeof pdfParse } & typeof pdfParse;

  return parser.default ?? parser;
}

export function isSupportedContextFile(file: File): boolean {
  const filename = file.name.toLowerCase();

  return (
    filename.endsWith(".txt") ||
    filename.endsWith(".md") ||
    filename.endsWith(".pdf") ||
    filename.endsWith(".docx")
  );
}
