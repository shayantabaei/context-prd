import type {
  ClarificationAnswer,
  ContextDocument,
  Initiative,
  InitiativeAnalysis
} from "@/lib/types/initiative";

const maxDocumentCharacters = 5_000;

export function buildPrdGenerationPrompt({
  initiative,
  documents,
  analysis,
  clarificationAnswers
}: {
  initiative: Initiative;
  documents: ContextDocument[];
  analysis?: InitiativeAnalysis;
  clarificationAnswers: ClarificationAnswer[];
}) {
  const documentPayload = documents.map((document) => ({
    id: document.id,
    filename: document.filename,
    processingStatus: document.processingStatus,
    extractedText:
      document.extractedText?.slice(0, maxDocumentCharacters) ||
      "[No extracted text available]"
  }));

  return [
    "You are ContextPRD, an enterprise PRD generation system.",
    "Generate a concise, implementation-ready PRD as structured JSON only.",
    "Do not output markdown outside the JSON object.",
    "",
    "Ground the PRD in the initiative definition first, uploaded documents second, analysis findings third, and clarification answers fourth.",
    "Use clarification answers to resolve ambiguity. If an answer is missing or uncertainty remains, explicitly include it in openQuestions.",
    "Do not invent certainty. Be explicit about unresolved gaps.",
    "The PRD should synthesize information, not simply summarize or restate the initiative definition.",
    "Prefer specific engineering requirements over generic summaries.",
    "Where the context supports it, name systems, roles, capabilities, constraints, rollout mechanisms, authorization enforcement points, monitoring needs, and audit requirements.",
    "Avoid vague statements like 'define roles', 'ensure auditability', or 'support governance' unless followed by concrete implementation detail.",
    "If context is missing, add an actionable open question instead of inventing details.",
    "",
    "Formatting expectations for section content:",
    "- Use markdown-style bullets and numbered lists inside content strings where it improves readability.",
    "- Avoid dense single-paragraph sections.",
    "- Keep the document concise enough for a portfolio demo, but specific enough for engineering planning.",
    "- Functional Requirements should be formatted as titled bullets or numbered requirements.",
    "- Risks and Mitigations should pair each risk with a concrete mitigation.",
    "- Dependencies should name systems and explain why each dependency matters.",
    "- Rollout Plan should include feature flags, pilot/staged rollout, monitoring, and rollback where supported by context.",
    "",
    "Functional Requirements quality bar:",
    "- Every functional requirement should be actionable enough for an engineer to begin implementation planning.",
    "- Prefer requirements like 'Emit audit events for all billing permission changes with actor, timestamp, organization, role delta, and approval metadata when known' over 'Ensure auditability'.",
    "- Include impacted systems where known, such as Billing Service, RBAC Engine, Partner Portal, Auth Gateway, or Audit Pipeline.",
    "- Include enforcement boundaries, capability boundaries, self-service limits, approval workflows, revocation behavior, and cross-organization restrictions when relevant.",
    "- If a required implementation detail is unknown, state the gap and add it to openQuestions.",
    "",
    "Technical Considerations quality bar:",
    "- Include impacted systems, integration points, backwards compatibility concerns, authorization enforcement points, audit/logging implications, rollout/feature flag implications, and operational monitoring considerations.",
    "- Avoid generic technical language. Tie each consideration to an initiative dependency, document detail, analysis finding, or clarification answer.",
    "",
    "Risks and Mitigations quality bar:",
    "- Every risk must include a concrete mitigation.",
    "- Prefer specific risks such as permission expansion from unclear inheritance, missing audit fields for SOC2 evidence, rollout causing unexpected partner access changes, or legacy API compatibility issues.",
    "- Mitigations should include concrete actions such as defining deny/override behavior, validating audit schema before release, using feature flags and pilot partners, monitoring permission expansion events, or documenting rollback triggers.",
    "",
    "Open Questions quality bar:",
    "- Open questions must be unresolved decisions that block implementation clarity.",
    "- Use actionable decision prompts, not generic discovery questions.",
    "- Good examples: 'Should partner admins be allowed to assign billing roles outside their organization?', 'What exact audit fields are mandatory for billing permission change events?', 'What rollback behavior is required if RBAC propagation fails?', 'What monitoring should detect unexpected permission expansion during rollout?'",
    "",
    "The PRD must contain these sections in order:",
    "1. Executive Summary",
    "2. Problem Statement",
    "3. Goals",
    "4. Non-Goals / Out of Scope",
    "5. User / Stakeholder Impact",
    "6. Functional Requirements",
    "7. Non-Functional Requirements",
    "8. Technical Considerations",
    "9. Dependencies",
    "10. Risks and Mitigations",
    "11. Rollout Plan",
    "12. Success Metrics",
    "13. Open Questions",
    "The sections array must include exactly these 13 section titles, including Open Questions, even though openQuestions is also returned as a separate top-level field.",
    "",
    "Each section must include sourceReferences.",
    "Use lightweight references only: initiative definition, uploaded documents, and clarification answers.",
    "When a section depends on a document, include documentId, filename, and a label like 'Document: billing_api_permissions_spec.md'.",
    "When a section depends on a clarification answer, include clarificationQuestionId and a label like 'Clarification Answer: Mandatory audit fields'.",
    "When a section depends on an analysis finding, include a label like 'Analysis Finding: Audit Event Coverage Risk'.",
    "For initiative-level grounding, use the label 'Initiative Definition'.",
    "Always include at least one source reference per section.",
    "",
    "Return only JSON matching this shape:",
    JSON.stringify(
      {
        initiativeId: initiative.id,
        title: "string",
        summary: "string",
        sections: [
          {
            id: "executive-summary",
            title: "Executive Summary",
            content: "string",
            sourceReferences: [
              {
                label: "Initiative definition"
              }
            ]
          }
        ],
        openQuestions: ["string"],
        generatedAt: new Date().toISOString()
      },
      null,
      2
    ),
    "",
    "Initiative definition:",
    JSON.stringify(initiative, null, 2),
    "",
    "Uploaded context documents:",
    JSON.stringify(documentPayload, null, 2),
    "",
    "Latest initiative analysis:",
    JSON.stringify(analysis ?? null, null, 2),
    "",
    "Clarification answers:",
    JSON.stringify(clarificationAnswers, null, 2)
  ].join("\n");
}
