import { describe, expect, it } from "vitest";
import { assessReadiness } from "@/lib/workflow/readiness";
import {
  analysisFixture,
  clarificationQuestionsFixture,
  initiativeFixture
} from "../utils/fixtures";

function withAnswers(answeredIds: string[]) {
  return clarificationQuestionsFixture.map((question) => ({
    severity: question.severity,
    answer: answeredIds.includes(question.id) ? "Resolved decision" : ""
  }));
}

describe("assessReadiness", () => {
  it("keeps minimal workflow state in needs-clarification range", () => {
    const readiness = assessReadiness({
      initiative: initiativeFixture,
      analysis: null,
      questions: [],
      processedDocumentCount: 0
    });

    expect(readiness.label).toBe("Needs Clarification");
    expect(readiness.score).toBeGreaterThanOrEqual(20);
    expect(readiness.score).toBeLessThan(40);
  });

  it("does not mark analysis-ready work as generation-ready when clarifications are unanswered", () => {
    const readiness = assessReadiness({
      initiative: initiativeFixture,
      analysis: analysisFixture,
      questions: withAnswers([]),
      processedDocumentCount: 2
    });

    expect(readiness.label).toBe("Needs Clarification");
    expect(readiness.unresolvedHighCount).toBe(1);
    expect(readiness.score).toBeLessThan(60);
  });

  it("moves to partially ready when critical ambiguity is resolved but medium ambiguity remains", () => {
    const readiness = assessReadiness({
      initiative: initiativeFixture,
      analysis: analysisFixture,
      questions: withAnswers(["1"]),
      processedDocumentCount: 2
    });

    expect(readiness.label).toBe("Partially Ready");
    expect(readiness.unresolvedHighCount).toBe(0);
    expect(readiness.unresolvedMediumCount).toBe(1);
    expect(readiness.score).toBeGreaterThanOrEqual(60);
    expect(readiness.score).toBeLessThan(85);
  });

  it("reports ready for generation after high-value clarifications are answered", () => {
    const readiness = assessReadiness({
      initiative: initiativeFixture,
      analysis: analysisFixture,
      questions: withAnswers(["1", "2", "3"]),
      processedDocumentCount: 3
    });

    expect(readiness.label).toBe("Ready for Generation");
    expect(readiness.score).toBeGreaterThanOrEqual(85);
    expect(readiness.score).toBeLessThanOrEqual(95);
  });
});
