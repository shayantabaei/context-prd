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
    "Document relevance scoring requirements:",
    "- relevancyScore MUST be a normalized decimal from 0.0 to 1.0, not a percentage.",
    "- 1.0 = critical/core implementation context.",
    "- 0.8-0.9 = highly relevant context.",
    "- 0.5-0.7 = partially relevant or supporting context.",
    "- 0.2-0.4 = weakly relevant or background context.",
    "- 0.0-0.1 = irrelevant or noisy context.",
    "- Before assigning relevance scores, compare all uploaded documents against each other.",
    "- Use relative ranking, not binary classification.",
    "- Score documents relative to one another based on implementation usefulness, governance relevance, dependency relevance, rollout relevance, architecture relevance, and operational relevance.",
    "- Documents may be relevant for different reasons: architecture relevance, rollout relevance, governance relevance, implementation relevance, operational relevance, and dependency relevance.",
    "- Use nuanced decimal values where appropriate, such as 0.95, 0.85, 0.75, 0.65, 0.35, or 0.05.",
    "- Multiple relevant documents should naturally distribute across different scores such as 0.6, 0.75, 0.85, and 0.95.",
    "- Avoid binary 0/1 scoring unless a document is truly either absolutely central or irrelevant.",
    "- Do not mark every relevant document as 1.0.",
    "- 1.0 should be extremely rare and reserved only for documents that are absolutely central to implementation.",
    "- At least one relevant document should usually score below 1.0 unless every document is equally critical, which is uncommon.",
    "- Prefer nuanced scoring over binary scoring.",
    "- Continue identifying irrelevant or superfluous context separately in irrelevantContext.",
    "",
    "Clarification question quality bar:",
    "- Generate 5-8 clarification questions unless there is genuinely insufficient context.",
    "- Questions should materially impact implementation readiness.",
    "- Ask about implementation decisions, operational boundaries, missing requirements, constraints, dependencies, acceptance conditions, governance, rollout safety, ownership, monitoring, rollback behavior, inheritance behavior, enforcement rules, and failure modes.",
    "- Ground each question in the initiative definition or uploaded context.",
    "- Prefer questions about rollback strategy, feature flag rollout, audit event retention, permission inheritance rules, self-service boundaries, approval workflows, monitoring requirements, revocation behavior, failure handling, and SLA expectations.",
    "- Avoid generic questions like 'What are the requirements?', 'Who are the stakeholders?', or 'What is the timeline?'",
    "- Avoid generic summarization questions. The questions should feel like enterprise implementation review.",
    "- Prefer questions like 'Should partner administrators be able to assign billing roles outside their organization?', 'What rollback behavior is required if RBAC propagation fails?', or 'What audit fields are mandatory for permission change events?'",
    "- Every rationale must reference a detected ambiguity, missing implementation detail, governance concern, rollout concern, or conflicting context from uploaded documents.",
    "- Each rationale must explain why the answer changes implementation readiness and why it materially improves downstream PRD quality.",
    "",
    "Return only JSON matching this shape:",
    JSON.stringify(
      {
        initiativeId: initiative.id,
        documentAnalysis: [
          {
            documentId: 1,
            filename: "example.md",
            relevancyScore: 0.85,
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
