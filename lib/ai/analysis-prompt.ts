import type { ContextDocument, Initiative } from "@/lib/types/initiative";

const maxDocumentCharacters = 8_000;

export function buildInitiativeAnalysisPrompt(
  initiative: Initiative,
  documents: ContextDocument[]
) {
  const documentPayload = documents.map((document) => ({
    id: document.id,
    filename: document.filename,
    mimeType: document.mimeType,
    processingStatus: document.processingStatus,
    extractedText:
      document.extractedText?.slice(0, maxDocumentCharacters) ||
      "[No extracted text available]"
  }));

  return [
    "You are ContextPRD, an enterprise initiative analysis system.",
    "",
    "Analyze the initiative definition as the primary source of intent.",
    "Use uploaded documents as supporting evidence only.",
    "Do not generate a PRD.",
    "",
    "Your job is to return structured JSON that helps product, engineering, and QA teams improve implementation readiness.",
    "",
    "Focus on:",
    "- document relevance and useful summaries",
    "- irrelevant or superfluous context",
    "- requirement gaps",
    "- delivery, technical, rollout, and governance risks",
    "- inferred dependencies between systems",
    "- highly specific clarification questions that materially improve future PRD quality",
    "",
    "Clarification question quality bar:",
    "- Ask about implementation decisions, boundaries, constraints, dependencies, acceptance conditions, governance, rollout, and failure modes.",
    "- Ground each question in the initiative definition or uploaded context.",
    "- Avoid generic questions like 'What are the requirements?' or 'Who are the stakeholders?'",
    "- Include a rationale explaining why the answer changes implementation readiness.",
    "",
    "Return only JSON matching this shape:",
    JSON.stringify(
      {
        initiativeId: initiative.id,
        documentAnalysis: [
          {
            documentId: 1,
            filename: "example.md",
            relevancyScore: 0,
            summary: "string",
            relevantTopics: ["string"],
            potentiallyIrrelevantTopics: ["string"],
            comments: "string"
          }
        ],
        irrelevantContext: [
          {
            documentId: 1,
            filename: "example.md",
            reason: "string",
            irrelevantTopics: ["string"]
          }
        ],
        detectedGaps: [
          {
            title: "string",
            description: "string",
            severity: "low | medium | high",
            category: "gap",
            relatedDocuments: [1],
            relatedSystems: ["string"],
            recommendation: "string"
          }
        ],
        detectedRisks: [
          {
            title: "string",
            description: "string",
            severity: "low | medium | high",
            category: "risk | governance | rollout | technical",
            relatedDocuments: [1],
            relatedSystems: ["string"],
            recommendation: "string"
          }
        ],
        inferredDependencies: [
          {
            title: "string",
            description: "string",
            severity: "low | medium | high",
            category: "dependency",
            relatedDocuments: [1],
            relatedSystems: ["string"],
            recommendation: "string"
          }
        ],
        clarificationQuestions: [
          {
            id: 1,
            documentId: 1,
            question: "string",
            rationale: "string",
            category:
              "business | technical | scope | governance | dependency | rollout",
            severity: "low | medium | high",
            relatedSystems: ["string"]
          }
        ],
        createdAt: new Date().toISOString()
      },
      null,
      2
    ),
    "",
    "Initiative definition:",
    JSON.stringify(initiative, null, 2),
    "",
    "Uploaded context documents:",
    JSON.stringify(documentPayload, null, 2)
  ].join("\n");
}
