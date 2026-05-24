import { describe, expect, it } from "vitest";
import { normalizeAnalysisReferencesForValidation } from "@/lib/ai/openai-service";
import { initiativeAnalysisSchema } from "@/lib/validation/initiative";

const documents = [
  {
    id: "22222222-2222-4222-8222-222222222222",
    initiativeId: "11111111-1111-4111-8111-111111111111",
    filename: "billing_api_permissions_spec.md",
    mimeType: "text/markdown",
    uploadedAt: "2026-05-23T12:00:00.000Z",
    processingStatus: "processed" as const
  },
  {
    id: "33333333-3333-4333-8333-333333333333",
    initiativeId: "11111111-1111-4111-8111-111111111111",
    filename: "security_review.md",
    mimeType: "text/markdown",
    uploadedAt: "2026-05-23T12:00:00.000Z",
    processingStatus: "processed" as const
  }
];

describe("normalizeAnalysisReferencesForValidation", () => {
  it("maps numeric model document references to uploaded document UUIDs", () => {
    const normalized = normalizeAnalysisReferencesForValidation(
      {
        initiativeId: "11111111-1111-4111-8111-111111111111",
        documentAnalysis: [
          {
            documentId: 1,
            filename: "billing_api_permissions_spec.md",
            relevancyScore: 0.85,
            summary: "Highly relevant billing API context.",
            relevantTopics: ["billing roles"],
            potentiallyIrrelevantTopics: [],
            comments: "Use for implementation details."
          }
        ],
        irrelevantContext: [
          {
            documentId: 2,
            filename: "security_review.md",
            reason: "Only partially relevant.",
            irrelevantTopics: ["unrelated controls"]
          }
        ],
        detectedGaps: [
          {
            title: "Audit fields unspecified",
            description: "The required audit fields are missing.",
            severity: "high",
            category: "gap",
            relatedDocuments: [1],
            relatedSystems: ["Audit Pipeline"],
            recommendation: "Define audit schema."
          }
        ],
        detectedRisks: [
          {
            title: "Permission expansion risk",
            description: "Inheritance behavior is unclear.",
            severity: "medium",
            category: "risk",
            relatedDocuments: [1, 2],
            relatedSystems: ["RBAC Engine"],
            recommendation: "Clarify inheritance behavior."
          }
        ],
        inferredDependencies: [
          {
            title: "Billing Service dependency",
            description: "Billing Service enforces permissions.",
            severity: "medium",
            category: "dependency",
            relatedDocuments: [1],
            relatedSystems: ["Billing Service"],
            recommendation: "Confirm ownership."
          }
        ],
        clarificationQuestions: [
          {
            id: 1,
            documentId: 1,
            question: "What audit fields are mandatory?",
            rationale: "Audit fields determine implementation and QA scope.",
            category: "governance",
            severity: "high",
            relatedSystems: ["Audit Pipeline"]
          }
        ],
        createdAt: "2026-05-23T12:30:00.000Z"
      },
      documents
    );

    const analysis = initiativeAnalysisSchema.parse(normalized);

    expect(analysis.documentAnalysis[0].documentId).toBe(documents[0].id);
    expect(analysis.irrelevantContext[0].documentId).toBe(documents[1].id);
    expect(analysis.detectedRisks[0].relatedDocuments).toEqual([
      documents[0].id,
      documents[1].id
    ]);
    expect(analysis.clarificationQuestions[0]).toMatchObject({
      id: "1",
      documentId: documents[0].id
    });
  });
});
