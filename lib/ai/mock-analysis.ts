import type {
  ContextDocument,
  Initiative,
  InitiativeAnalysis
} from "@/lib/types/initiative";

export function createMockInitiativeAnalysis(
  initiative: Initiative,
  documents: ContextDocument[]
): InitiativeAnalysis {
  const processedDocuments = documents.filter(
    (document) => document.processingStatus === "processed"
  );
  const firstDocument = processedDocuments[0] ?? documents[0];
  const relatedSystems = initiative.dependencies.map((dependency) => dependency.system);

  return {
    initiativeId: initiative.id,
    documentAnalysis: documents.map((document) => ({
      documentId: document.id,
      filename: document.filename,
      relevancyScore: document.processingStatus === "processed" ? 0.78 : 0.1,
      summary:
        document.processingStatus === "processed"
          ? `Contains supporting context that may inform ${initiative.initiativeName}, especially implementation boundaries and operational constraints.`
          : "Text extraction failed, so this document cannot be evaluated yet.",
      relevantTopics:
        document.processingStatus === "processed"
          ? [
              initiative.metadata.workflow,
              ...initiative.scope.inScope.slice(0, 2),
              ...relatedSystems.slice(0, 2)
            ].filter(Boolean)
          : [],
      potentiallyIrrelevantTopics:
        document.processingStatus === "processed"
          ? initiative.scope.outOfScope.slice(0, 2)
          : ["unprocessed document"],
      comments:
        document.processingStatus === "processed"
          ? "Use this document as supporting context, but validate exact rollout and governance implications during clarification."
          : "Re-upload or convert this document to a supported text-bearing format."
    })),
    irrelevantContext: documents
      .filter((document) => document.processingStatus === "failed")
      .map((document) => ({
        documentId: document.id,
        filename: document.filename,
        reason: "The document could not be extracted and cannot ground analysis.",
        irrelevantTopics: ["unavailable extracted text"]
      })),
    detectedGaps: [
      {
        title: "Acceptance criteria need implementation-level specificity",
        description:
          "The initiative describes outcomes, but measurable acceptance criteria for engineering and QA are not yet explicit.",
        severity: "high",
        category: "gap",
        relatedDocuments: firstDocument ? [firstDocument.id] : undefined,
        relatedSystems,
        recommendation:
          "Define pass/fail conditions for permissions, audit events, rollback, and partner-facing behavior."
      },
      {
        title: "Failure and rollback behavior is underspecified",
        description:
          "Rollout constraints indicate staged delivery, but the expected fallback behavior for partial failures is not defined.",
        severity: "medium",
        category: "rollout",
        relatedSystems,
        recommendation:
          "Clarify rollback triggers, data reconciliation expectations, and ownership for failed migrations."
      }
    ],
    detectedRisks: [
      {
        title: "Governance evidence may be incomplete",
        description:
          "The initiative depends on auditability, but required audit events, retention needs, and review workflows are not fully enumerated.",
        severity: "high",
        category: "governance",
        relatedDocuments: firstDocument ? [firstDocument.id] : undefined,
        relatedSystems,
        recommendation:
          "List required audit events and map them to the systems that emit and consume compliance evidence."
      }
    ],
    inferredDependencies: initiative.dependencies.map((dependency) => ({
      title: `${dependency.system} dependency`,
      description:
        dependency.description ||
        `${dependency.system} appears necessary to deliver or validate the initiative.`,
      severity: dependency.impact,
      category: "dependency",
      relatedSystems: [dependency.system],
      recommendation:
        "Confirm owner, interface contract, rollout sequencing, and test coverage for this dependency."
    })),
    clarificationQuestions: [
      {
        id: "1",
        documentId: firstDocument?.id,
        question:
          "Which specific permission changes must emit audit events, and what fields must each event include for compliance review?",
        rationale:
          "The initiative depends on auditability; implementation cannot finalize event schemas or QA checks without explicit audit requirements.",
        category: "governance",
        severity: "high",
        relatedSystems
      },
      {
        id: "2",
        question:
          "Should existing users inherit new permissions automatically, or should access be granted only through explicit admin action?",
        rationale:
          "The answer changes migration logic, rollout risk, partner communication, and acceptance criteria.",
        category: "technical",
        severity: "high",
        relatedSystems
      },
      {
        id: "3",
        question:
          "What conditions should block rollout from pilot partners to broader availability?",
        rationale:
          "The staged rollout requirement needs measurable promotion and rollback gates before engineering can define release readiness.",
        category: "rollout",
        severity: "medium",
        relatedSystems
      }
    ],
    createdAt: new Date().toISOString()
  };
}
