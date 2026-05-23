import type { GeneratedPrd, SourceReference } from "@/lib/types/initiative";

function formatSourceReference(reference: SourceReference): string {
  const label = normalizeSourceReferenceLabel(reference);
  const details = [
    reference.documentId ? `Document #${reference.documentId}` : null,
    reference.filename,
    reference.clarificationQuestionId
      ? `Clarification #${reference.clarificationQuestionId}`
      : null
  ].filter(Boolean);

  return details.length > 0
    ? `${label} (${details.join(", ")})`
    : label;
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

export function generatePrdMarkdown(prd: GeneratedPrd): string {
  const lines = [
    `# ${prd.title}`,
    "",
    `Generated: ${new Date(prd.generatedAt).toLocaleString()}`,
    "",
    "## Summary",
    "",
    prd.summary,
    ""
  ];

  prd.sections.forEach((section) => {
    lines.push(`## ${section.title}`, "", section.content, "");

    if (section.sourceReferences.length > 0) {
      lines.push("Sources:");
      section.sourceReferences.forEach((reference) => {
        lines.push(`- ${formatSourceReference(reference)}`);
      });
      lines.push("");
    }
  });

  lines.push("## Open Questions", "");

  if (prd.openQuestions.length > 0) {
    prd.openQuestions.forEach((question) => {
      lines.push(`- ${question}`);
    });
  } else {
    lines.push("No open questions returned.");
  }

  lines.push("");

  return lines.join("\n");
}
