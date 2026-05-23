import type {
  ClarificationAnswer,
  ContextDocument,
  GeneratedPrd,
  Initiative,
  InitiativeAnalysis,
  PrdSection,
  SourceReference
} from "@/lib/types/initiative";

const sectionTitles = [
  "Executive Summary",
  "Problem Statement",
  "Goals",
  "Non-Goals / Out of Scope",
  "User / Stakeholder Impact",
  "Functional Requirements",
  "Non-Functional Requirements",
  "Technical Considerations",
  "Dependencies",
  "Risks and Mitigations",
  "Rollout Plan",
  "Success Metrics",
  "Open Questions"
];

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function baseReferences(
  documents: ContextDocument[],
  clarificationAnswers: ClarificationAnswer[]
): SourceReference[] {
  const processedDocument = documents.find(
    (document) => document.processingStatus === "processed"
  );
  const answeredClarification = clarificationAnswers.find((answer) =>
    answer.answer.trim()
  );

  return [
    { label: "Initiative Definition" },
    ...(processedDocument
      ? [
          {
            documentId: processedDocument.id,
            filename: processedDocument.filename,
            label: `Document: ${processedDocument.filename}`
          }
        ]
      : []),
    ...(answeredClarification
      ? [
          {
            clarificationQuestionId: answeredClarification.questionId,
            label: `Clarification Answer: Question #${answeredClarification.questionId}`
          }
        ]
      : [])
  ];
}

function analysisReferences(analysis: InitiativeAnalysis | undefined): SourceReference[] {
  const finding = analysis?.detectedRisks[0] ?? analysis?.detectedGaps[0];

  return finding ? [{ label: `Analysis Finding: ${finding.title}` }] : [];
}

export function createMockGeneratedPrd({
  initiative,
  documents,
  analysis,
  clarificationAnswers
}: {
  initiative: Initiative;
  documents: ContextDocument[];
  analysis?: InitiativeAnalysis;
  clarificationAnswers: ClarificationAnswer[];
}): GeneratedPrd {
  const references = baseReferences(documents, clarificationAnswers);
  const planningReferences = [...references, ...analysisReferences(analysis)];
  const risks = analysis?.detectedRisks.map((risk) => risk.title).join("; ");
  const dependencies = initiative.dependencies
    .map((dependency) => dependency.system)
    .join(", ");
  const answeredCount = clarificationAnswers.filter((answer) =>
    answer.answer.trim()
  ).length;
  const systems = initiative.dependencies.map((dependency) => dependency.system);
  const primarySystems = systems.length > 0 ? systems.join(", ") : "the relevant platform services";
  const answeredAuditGuidance = clarificationAnswers.find((answer) =>
    /audit|event|field/i.test(answer.answer)
  )?.answer;
  const answeredRolloutGuidance = clarificationAnswers.find((answer) =>
    /rollout|flag|rollback|pilot/i.test(answer.answer)
  )?.answer;

  const sections: PrdSection[] = sectionTitles.map((title) => ({
    id: slugify(title),
    title,
    content:
      title === "Executive Summary"
        ? `${initiative.executiveSummary}\n\nThis PRD frames ${initiative.initiativeName} for implementation across ${primarySystems}. It incorporates uploaded context, analysis findings, and ${answeredCount} clarification answer${answeredCount === 1 ? "" : "s"} to identify concrete requirements, rollout controls, and unresolved implementation decisions.`
        : title === "Problem Statement"
          ? `Current delivery is constrained by:\n- ${initiative.businessContext.painPoints.join("\n- ")}\n\nThe initiative must convert these operational pain points into enforceable product and engineering requirements without weakening governance, auditability, or rollout safety.`
        : title === "Goals"
          ? initiative.businessContext.successMetrics
              .map((metric) => `- ${metric.metric}: ${metric.target}`)
              .join("\n") || `- ${initiative.businessContext.outcomes}`
          : title === "Non-Goals / Out of Scope"
            ? initiative.scope.outOfScope.map((item) => `- ${item}`).join("\n")
            : title === "User / Stakeholder Impact"
              ? `- Partner administrators should receive clearer self-service boundaries for billing permission changes.\n- Platform Engineering remains accountable for enforcement behavior, compatibility constraints, and rollout safety.\n- Product, QA, and governance reviewers should be able to validate requirements against audit and delivery constraints before implementation starts.`
              : title === "Functional Requirements"
                ? `1. Partner billing role boundaries\n   - Introduce partner billing roles with explicit capability boundaries.\n   - Prevent cross-organization role assignment unless explicitly approved by product and governance owners.\n   - Impacted systems: ${primarySystems}.\n\n2. Authorization enforcement\n   - Enforce billing role capability checks at service boundaries before allowing permission changes.\n   - Preserve compatibility with legacy billing APIs where listed in technical constraints.\n\n3. Audit events\n   - Emit audit events for all billing permission changes.\n   - ${answeredAuditGuidance ? `Clarified audit guidance: ${answeredAuditGuidance}` : "Open: exact mandatory audit fields must be confirmed before implementation."}\n\n4. Controlled rollout\n   - Support feature-flagged rollout for partner role assignment.\n   - ${answeredRolloutGuidance ? `Clarified rollout guidance: ${answeredRolloutGuidance}` : "Open: rollout gates, rollback triggers, and monitoring thresholds must be confirmed."}`
                : title === "Non-Functional Requirements"
                  ? `- Maintain zero-downtime behavior for permission workflows where rollout constraints require it.\n- Preserve auditability for every permission mutation path.\n- Ensure authorization checks are deterministic, observable, and testable.\n- Support QA validation for inheritance, revocation, approval, and cross-organization boundary cases.`
                  : title === "Technical Considerations"
                    ? `- Impacted systems: ${primarySystems}.\n- Authorization enforcement should occur before mutating billing role assignments.\n- Audit/logging must capture permission-change evidence suitable for governance review.\n- Backwards compatibility with legacy billing APIs should be validated before rollout.\n- Feature flags should isolate pilot partners and allow rollback without code redeploy.\n- Monitoring should detect unexpected permission expansion, failed propagation, and missing audit events.`
            : title === "Dependencies"
              ? dependencies
                ? initiative.dependencies
                    .map(
                      (dependency) =>
                        `- ${dependency.system}: ${dependency.description || "Required for delivery validation and implementation sequencing."} Impact: ${dependency.impact}.`
                    )
                    .join("\n")
                : "No explicit dependencies were provided."
              : title === "Risks and Mitigations"
                ? `- Risk: ${risks || "Implementation risk is not fully classified yet."}\n  Mitigation: validate requirements against analysis findings before implementation planning.\n- Risk: permission expansion due to unclear inheritance behavior.\n  Mitigation: define inheritance, deny override behavior, and QA cases before rollout.\n- Risk: missing audit evidence for governance review.\n  Mitigation: validate audit event schema and retention expectations before release.\n- Risk: rollout changes partner access unexpectedly.\n  Mitigation: use feature flags, pilot partners, rollback criteria, and permission-expansion monitoring.`
                : title === "Rollout Plan"
                  ? `1. Configure feature flag for controlled partner billing role assignment.\n2. Pilot with selected partners and monitor permission mutations, audit events, and support escalations.\n3. Validate rollback behavior before expanding availability.\n4. Expand rollout only after governance, QA, and operational metrics meet acceptance thresholds.`
                  : title === "Success Metrics"
                    ? initiative.businessContext.successMetrics
                        .map((metric) => `- ${metric.metric}: ${metric.target}`)
                        .join("\n") || `- ${initiative.businessContext.outcomes}`
                : title === "Open Questions"
                  ? "Unresolved implementation decisions are listed below and should be closed before engineering planning begins."
                  : `- Use the initiative definition as the delivery intent.\n- Validate implementation details against uploaded context, analysis findings, and clarification answers.\n- Convert unresolved ambiguity into open questions before implementation starts.`,
    sourceReferences:
      title === "Risks and Mitigations" || title === "Technical Considerations"
        ? planningReferences
        : references
  }));

  return {
    initiativeId: initiative.id,
    title: `${initiative.initiativeName} PRD`,
    summary: `Implementation-ready PRD draft for ${initiative.initiativeName}.`,
    sections,
    openQuestions: [
      ...initiative.scope.outOfScope.map(
        (item) => `Confirm that "${item}" remains out of scope for this delivery.`
      ),
      ...(analysis?.clarificationQuestions
        .filter(
          (question) =>
            !clarificationAnswers.some(
              (answer) =>
                answer.questionId === question.id && answer.answer.trim()
            )
        )
        .map((question) => question.question) ?? [])
    ].slice(0, 8),
    generatedAt: new Date().toISOString()
  };
}
