import type {
  ClarificationQuestion,
  GeneratedPrd,
  Initiative,
  InitiativeAnalysis,
  PrdSection
} from "@/lib/types/initiative";

export const initiativeFixture: Initiative = {
  id: "11111111-1111-4111-8111-111111111111",
  initiativeName: "Partner billing permissions",
  executiveSummary:
    "Enable partner administrators to manage billing permissions with auditability.",
  metadata: {
    team: "Platform Engineering",
    workflow: "Standard SDLC",
    outputTemplateName: "Enterprise PRD"
  },
  businessContext: {
    painPoints: ["manual escalations", "audit gaps"],
    outcomes: "Partners self-serve scoped billing role assignment.",
    successMetrics: [
      {
        metric: "Support escalations",
        target: "Reduce by 60%"
      }
    ]
  },
  scope: {
    inScope: ["partner billing roles", "audit logging"],
    outOfScope: ["authentication redesign"]
  },
  constraints: {
    technicalConstraints: ["zero downtime migration"],
    governanceRequirements: ["SOC2 audit logging"],
    rolloutConstraints: ["feature-flagged rollout"]
  },
  dependencies: [
    {
      system: "Billing Service",
      impact: "high",
      description: "Enforces billing role capabilities."
    }
  ]
};

export const clarificationQuestionsFixture: ClarificationQuestion[] = [
  {
    id: "1",
    question: "What rollback behavior is required if RBAC propagation fails?",
    rationale: "Rollback behavior affects launch safety and implementation tasks.",
    category: "rollout",
    severity: "high",
    relatedSystems: ["RBAC Engine"]
  },
  {
    id: "2",
    question: "Which audit fields are mandatory for permission change events?",
    rationale: "Audit schema determines compliance evidence and test coverage.",
    category: "governance",
    severity: "medium",
    relatedSystems: ["Audit Pipeline"]
  },
  {
    id: "3",
    question: "Should partner admins assign roles across organizations?",
    rationale: "Scope boundaries affect authorization checks.",
    category: "technical",
    severity: "low",
    relatedSystems: ["Billing Service"]
  }
];

export const analysisFixture: InitiativeAnalysis = {
  initiativeId: initiativeFixture.id,
  documentAnalysis: [],
  irrelevantContext: [],
  detectedGaps: [],
  detectedRisks: [],
  inferredDependencies: [],
  clarificationQuestions: clarificationQuestionsFixture,
  createdAt: "2026-05-23T12:00:00.000Z"
};

export const prdSectionsFixture: PrdSection[] = [
  {
    id: "executive-summary",
    title: "Executive Summary",
    content: "Initial executive summary.",
    sourceReferences: [{ label: "Initiative Definition" }]
  },
  {
    id: "functional-requirements",
    title: "Functional Requirements",
    content: "- Enforce billing role capability checks.",
    sourceReferences: [
      {
        documentId: "22222222-2222-4222-8222-222222222222",
        filename: "billing_api_permissions_spec.md",
        label: "Document: billing_api_permissions_spec.md"
      }
    ]
  }
];

export const generatedPrdFixture: GeneratedPrd = {
  initiativeId: initiativeFixture.id,
  title: "Partner Billing Permissions PRD",
  summary: "A generated PRD for scoped partner billing permissions.",
  sections: prdSectionsFixture,
  openQuestions: ["What audit retention period is required?"],
  generatedAt: "2026-05-23T12:30:00.000Z"
};
