import type { Initiative, InitiativeAnalysis } from "@/lib/types/initiative";

export type ReadinessQuestion = {
  severity: "low" | "medium" | "high";
  answer: string;
};

export type ReadinessAssessment = {
  score: number;
  label: "Needs Clarification" | "Partially Ready" | "Ready for Generation";
  tone: "blue" | "amber" | "green";
  helper: string;
  unresolvedHighCount: number;
  unresolvedMediumCount: number;
};

export function getInitiativeCompletenessScore(
  initiative: Initiative | null
): number {
  if (!initiative) {
    return 0;
  }

  const checks = [
    initiative.initiativeName.trim(),
    initiative.executiveSummary.trim(),
    initiative.metadata.team.trim(),
    initiative.metadata.workflow.trim(),
    initiative.metadata.outputTemplateName.trim(),
    initiative.businessContext.painPoints.length > 0,
    initiative.businessContext.outcomes.trim(),
    initiative.businessContext.successMetrics.length > 0,
    initiative.scope.inScope.length > 0,
    initiative.scope.outOfScope.length > 0,
    initiative.constraints.technicalConstraints.length > 0,
    initiative.constraints.governanceRequirements.length > 0,
    initiative.constraints.rolloutConstraints.length > 0
  ];
  const completed = checks.filter(Boolean).length;

  return Math.round((completed / checks.length) * 22);
}

function getQuestionWeight(severity: ReadinessQuestion["severity"]): number {
  if (severity === "high") {
    return 3;
  }

  if (severity === "medium") {
    return 2;
  }

  return 1;
}

export function assessReadiness({
  initiative,
  analysis,
  questions,
  processedDocumentCount
}: {
  initiative: Initiative | null;
  analysis: InitiativeAnalysis | null;
  questions: ReadinessQuestion[];
  processedDocumentCount: number;
}): ReadinessAssessment {
  const initiativeScore = getInitiativeCompletenessScore(initiative);
  const documentScore =
    processedDocumentCount === 0
      ? 0
      : processedDocumentCount === 1
        ? 10
        : processedDocumentCount === 2
          ? 14
          : 16;
  const analysisScore = analysis ? 14 : 0;
  const totalQuestionWeight = questions.reduce(
    (sum, question) => sum + getQuestionWeight(question.severity),
    0
  );
  const answeredQuestionWeight = questions.reduce(
    (sum, question) =>
      question.answer.trim()
        ? sum + getQuestionWeight(question.severity)
        : sum,
    0
  );
  const clarificationScore =
    questions.length === 0
      ? analysis
        ? 38
        : 0
      : Math.round((answeredQuestionWeight / totalQuestionWeight) * 43);
  const unresolvedQuestions = questions.filter(
    (question) => !question.answer.trim()
  );
  const unresolvedHighCount = unresolvedQuestions.filter(
    (question) => question.severity === "high"
  ).length;
  const unresolvedMediumCount = unresolvedQuestions.filter(
    (question) => question.severity === "medium"
  ).length;
  const unresolvedLowCount = unresolvedQuestions.filter(
    (question) => question.severity === "low"
  ).length;
  const ambiguityPenalty = Math.min(
    30,
    unresolvedHighCount * 10 +
      unresolvedMediumCount * 5 +
      unresolvedLowCount * 2
  );
  const rawScore =
    initiativeScore +
    documentScore +
    analysisScore +
    clarificationScore -
    ambiguityPenalty;
  const floor = analysis ? 35 : initiative ? 20 : 0;
  const score = Math.max(floor, Math.min(95, rawScore));

  if (unresolvedHighCount > 0 || score < 60) {
    return {
      score,
      label: "Needs Clarification",
      tone: "amber",
      helper:
        unresolvedHighCount > 0
          ? "Critical ambiguity remains unresolved. Answer high-severity clarification questions before relying on generated requirements."
          : "Additional clarification is recommended before generation.",
      unresolvedHighCount,
      unresolvedMediumCount
    };
  }

  if (unresolvedMediumCount > 0 || score < 85) {
    return {
      score,
      label: "Partially Ready",
      tone: "amber",
      helper:
        "Some ambiguity remains. The PRD can be generated, but resolving more clarification questions will improve implementation readiness.",
      unresolvedHighCount,
      unresolvedMediumCount
    };
  }

  return {
    score,
    label: "Ready for Generation",
    tone: "green",
    helper:
      "Initiative is sufficiently refined for PRD generation. Most critical ambiguity has been resolved.",
    unresolvedHighCount,
    unresolvedMediumCount
  };
}
