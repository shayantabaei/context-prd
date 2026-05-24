import { describe, expect, it } from "vitest";
import { hydrateInitiative } from "@/lib/workflow/initiative-hydration";

const baseRow = {
  id: "11111111-1111-4111-8111-111111111111",
  initiativeName: "Partner billing permissions",
  executiveSummary: "Enable governed partner billing role management."
};

describe("hydrateInitiative", () => {
  it("preserves JSONB-backed camelCase initiative fields", () => {
    const initiative = hydrateInitiative({
      ...baseRow,
      metadata: {
        team: "Platform Engineering",
        workflow: "Standard SDLC",
        outputTemplateName: "Enterprise PRD"
      },
      businessContext: {
        painPoints: ["manual escalations"],
        outcomes: "Reduce support overhead.",
        successMetrics: [{ metric: "Escalations", target: "Reduce by 60%" }]
      },
      scope: {
        inScope: [
          "partner billing roles",
          "audit logging",
          "RBAC inheritance rules"
        ],
        outOfScope: ["authentication redesign"]
      },
      constraints: {
        technicalConstraints: ["zero downtime migration"],
        governanceRequirements: ["SOC2 compliant"],
        rolloutConstraints: ["staged rollout required"]
      },
      dependencies: [
        {
          system: "Billing Service",
          impact: "high",
          description: "Handles billing capability checks."
        }
      ]
    });

    expect(initiative.scope.inScope).toEqual([
      "partner billing roles",
      "audit logging",
      "RBAC inheritance rules"
    ]);
    expect(initiative.scope.outOfScope).toEqual(["authentication redesign"]);
    expect(initiative.businessContext.painPoints).toEqual([
      "manual escalations"
    ]);
    expect(initiative.businessContext.successMetrics).toEqual([
      { metric: "Escalations", target: "Reduce by 60%" }
    ]);
    expect(initiative.constraints.governanceRequirements).toEqual([
      "SOC2 compliant"
    ]);
    expect(initiative.dependencies).toEqual([
      {
        system: "Billing Service",
        impact: "high",
        description: "Handles billing capability checks."
      }
    ]);
  });

  it("uses safe defaults for missing or malformed nested JSONB values", () => {
    const initiative = hydrateInitiative({
      ...baseRow,
      metadata: null,
      businessContext: {
        painPoints: "not an array",
        successMetrics: [{ metric: "Only metric" }, null]
      },
      scope: undefined,
      constraints: {
        technicalConstraints: ["legacy API support", 123],
        governanceRequirements: undefined
      },
      dependencies: [{ system: "Audit Pipeline", impact: "unexpected" }, null]
    });

    expect(initiative.metadata).toEqual({
      team: "",
      workflow: "",
      outputTemplateName: ""
    });
    expect(initiative.businessContext.painPoints).toEqual([]);
    expect(initiative.businessContext.outcomes).toBe("");
    expect(initiative.businessContext.successMetrics).toEqual([
      { metric: "Only metric", target: "" }
    ]);
    expect(initiative.scope).toEqual({ inScope: [], outOfScope: [] });
    expect(initiative.constraints.technicalConstraints).toEqual([
      "legacy API support"
    ]);
    expect(initiative.constraints.governanceRequirements).toEqual([]);
    expect(initiative.constraints.rolloutConstraints).toEqual([]);
    expect(initiative.dependencies).toEqual([
      { system: "Audit Pipeline", impact: "medium", description: "" }
    ]);
  });
});
