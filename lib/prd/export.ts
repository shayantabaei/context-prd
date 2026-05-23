import type { GeneratedPrd, SourceReference } from "@/lib/types/initiative";
import { generatePrdMarkdown } from "@/lib/prd/markdown";

export function createPrdFilename(title: string, extension: "md" | "pdf") {
  const slug =
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 80) || "generated-prd";

  return `${slug}.${extension}`;
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function downloadPrdMarkdown(prd: GeneratedPrd) {
  const markdown = generatePrdMarkdown(prd);
  const blob = new Blob([markdown], {
    type: "text/markdown;charset=utf-8"
  });

  downloadBlob(blob, createPrdFilename(prd.title, "md"));
}

function formatReference(reference: SourceReference) {
  const label = normalizeSourceReferenceLabel(reference);
  const detail = reference.documentId
    ? `Document #${reference.documentId}`
    : reference.clarificationQuestionId
      ? `Clarification #${reference.clarificationQuestionId}`
      : "Initiative";

  return `${label} (${detail})`;
}

function normalizeSourceReferenceLabel(reference: SourceReference): string {
  if (/^(Initiative Definition|Document:|Clarification Answer:|Analysis Finding:)/i.test(reference.label)) {
    return reference.label;
  }

  if (reference.documentId || reference.filename) {
    return `Document: ${reference.filename ?? reference.label}`;
  }

  if (reference.clarificationQuestionId) {
    return `Clarification Answer: ${reference.label}`;
  }

  return reference.label.toLowerCase() === "initiative definition"
    ? "Initiative Definition"
    : reference.label;
}

export async function downloadPrdPdf(prd: GeneratedPrd) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 54;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  function ensureSpace(height: number) {
    if (y + height <= pageHeight - margin) {
      return;
    }

    doc.addPage();
    y = margin;
  }

  function addWrappedText(text: string, fontSize: number, lineHeight: number) {
    doc.setFontSize(fontSize);
    const lines = doc.splitTextToSize(text || "", contentWidth) as string[];
    ensureSpace(lines.length * lineHeight);
    doc.text(lines, margin, y);
    y += lines.length * lineHeight;
  }

  doc.setTextColor(24, 24, 27);
  doc.setFont("helvetica", "bold");
  addWrappedText(prd.title, 22, 28);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(82, 82, 91);
  addWrappedText(`Generated: ${new Date(prd.generatedAt).toLocaleString()}`, 9, 14);
  y += 12;

  doc.setTextColor(39, 39, 42);
  addWrappedText(prd.summary, 11, 16);
  y += 12;

  prd.sections.forEach((section) => {
    ensureSpace(80);
    doc.setDrawColor(228, 228, 231);
    doc.line(margin, y, pageWidth - margin, y);
    y += 22;

    doc.setFont("helvetica", "bold");
    doc.setTextColor(24, 24, 27);
    addWrappedText(section.title, 14, 18);
    y += 4;

    doc.setFont("helvetica", "normal");
    doc.setTextColor(39, 39, 42);
    section.content.split("\n").forEach((paragraph) => {
      addWrappedText(paragraph, 10, 15);
    });

    if (section.sourceReferences.length > 0) {
      y += 6;
      doc.setTextColor(113, 113, 122);
      doc.setFont("helvetica", "normal");
      addWrappedText(
        `Sources: ${section.sourceReferences.map(formatReference).join("; ")}`,
        8,
        12
      );
    }

    y += 12;
  });

  ensureSpace(80);
  doc.setDrawColor(228, 228, 231);
  doc.line(margin, y, pageWidth - margin, y);
  y += 22;
  doc.setFont("helvetica", "bold");
  doc.setTextColor(24, 24, 27);
  addWrappedText("Open Questions", 14, 18);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(39, 39, 42);

  if (prd.openQuestions.length > 0) {
    prd.openQuestions.forEach((question) => {
      addWrappedText(`- ${question}`, 10, 15);
    });
  } else {
    addWrappedText("No open questions returned.", 10, 15);
  }

  doc.save(createPrdFilename(prd.title, "pdf"));
}
