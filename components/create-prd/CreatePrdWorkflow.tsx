"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Brain,
  CheckCircle2,
  ChevronDown,
  FileText,
  Library,
  LockKeyhole,
  Save,
  Shield,
  Sparkles
} from "lucide-react";
import {
  BulletInput,
  DependencyReferences,
  GovernanceCallout,
  GuidancePanel,
  MetricEntries,
  TextAreaField,
  TextField,
  type DependencyReference,
  type MetricEntry
} from "./InitiativeDefinitionFields";
import {
  clarificationQuestions,
  contextSources,
  initialSelectedContext,
  insights,
  outputTypes,
  workflowSteps,
  type ClarificationQuestion,
  type SelectedContext
} from "./workflow-data";
import {
  Badge,
  ContextPill,
  ContextSourceCard,
  InsightCard,
  OutputTypeCard,
  SectionPanel,
  StatusMeter,
  WorkflowProgress
} from "./WorkflowPrimitives";

const fieldGroups = [
  {
    id: "initiativeName",
    label: "Initiative name",
    helper: "Use the language teams already use in roadmap and delivery planning.",
    value: "Partner billing permissions"
  },
  {
    id: "primaryTeam",
    label: "Primary team",
    helper: "The team accountable for requirement quality and delivery readiness.",
    value: "Platform Engineering"
  },
  {
    id: "deliveryWorkflow",
    label: "Delivery workflow",
    helper: "Select the operating model this work will follow.",
    value: "Standard SDLC"
  },
  {
    id: "outputTemplate",
    label: "Output template",
    helper: "Choose the enterprise artifact structure to generate.",
    value: "Enterprise PRD"
  }
] as const;

type InitiativeSetupValues = Record<(typeof fieldGroups)[number]["id"], string>;

const initialInitiativeSetupValues = fieldGroups.reduce(
  (values, field) => ({
    ...values,
    [field.id]: field.value
  }),
  {} as InitiativeSetupValues
);

type InitiativeDefinitionValues = InitiativeSetupValues & {
  executiveSummary: string;
  currentPainPoints: string[];
  desiredOutcomes: string;
  successMetrics: MetricEntry[];
  inScope: string[];
  outOfScope: string[];
  technicalConstraints: string[];
  governanceRequirements: string[];
  rolloutConstraints: string[];
  relatedSystems: DependencyReference[];
};

const initialInitiativeDefinition: InitiativeDefinitionValues = {
  ...initialInitiativeSetupValues,
  executiveSummary:
    "Enable external partners to manage billing permissions independently while preserving auditability and role-based access controls.",
  currentPainPoints: [
    "manual billing permission escalations",
    "inconsistent RBAC workflows",
    "support overhead",
    "audit gaps"
  ],
  desiredOutcomes:
    "Partners can self-serve scoped billing permission changes through governed workflows, with clear audit trails and reduced support dependency.",
  successMetrics: [
    {
      id: "escalations",
      metric: "Support escalations",
      target: "Reduce by 60%"
    },
    {
      id: "provisioning",
      metric: "Provisioning time",
      target: "Reduce from days to minutes"
    },
    {
      id: "approvals",
      metric: "Manual approvals",
      target: "Eliminate recurring approval workflows"
    }
  ],
  inScope: [
    "partner billing roles",
    "audit logging",
    "RBAC inheritance rules"
  ],
  outOfScope: [
    "authentication redesign",
    "billing engine replacement",
    "customer-facing UI refresh"
  ],
  technicalConstraints: [
    "must support legacy billing APIs",
    "zero downtime migration",
    "backward-compatible partner roles"
  ],
  governanceRequirements: [
    "SOC2 compliant",
    "audit logging mandatory",
    "role changes require traceable approvals"
  ],
  rolloutConstraints: [
    "staged rollout required",
    "pilot with strategic partners first",
    "rollback plan required before launch"
  ],
  relatedSystems: [
    {
      id: "billing-service",
      name: "Billing Service",
      relationship: "Source of billing roles, account permissions, and entitlement checks.",
      impact: "High",
      selected: true
    },
    {
      id: "rbac-engine",
      name: "RBAC Engine",
      relationship: "Evaluates role inheritance and permission boundaries.",
      impact: "High",
      selected: true
    },
    {
      id: "partner-portal",
      name: "Partner Portal",
      relationship: "User-facing surface for partner administrators.",
      impact: "Medium",
      selected: true
    },
    {
      id: "auth-gateway",
      name: "Auth Gateway",
      relationship: "Identity and token boundary for partner sessions.",
      impact: "Medium",
      selected: false
    },
    {
      id: "audit-pipeline",
      name: "Audit Pipeline",
      relationship: "Receives compliance events and governance evidence.",
      impact: "High",
      selected: true
    }
  ]
};

export function CreatePrdWorkflow() {
  const workflowTopRef = useRef<HTMLElement | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [initiativeDefinition, setInitiativeDefinition] =
    useState<InitiativeDefinitionValues>(initialInitiativeDefinition);
  const [selectedSourceIds, setSelectedSourceIds] = useState<string[]>([
    "confluence",
    "jira",
    "uploads",
    "architecture"
  ]);
  const [selectedContext, setSelectedContext] = useState<SelectedContext[]>(
    initialSelectedContext
  );
  const [questions, setQuestions] = useState<ClarificationQuestion[]>(
    clarificationQuestions
  );
  const [expandedQuestionId, setExpandedQuestionId] = useState<string>(
    clarificationQuestions[0].id
  );
  const [selectedOutputIds, setSelectedOutputIds] = useState<string[]>([
    "enterprise-prd",
    "engineering-tasks",
    "rollout-checklist"
  ]);

  const currentStep = workflowSteps[stepIndex];
  const answeredCount = questions.filter((question) => question.answer.trim()).length;
  const contextUsage = Math.min(86, 38 + selectedContext.length * 7);

  const selectedSources = useMemo(
    () => contextSources.filter((source) => selectedSourceIds.includes(source.id)),
    [selectedSourceIds]
  );

  useEffect(() => {
    workflowTopRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }, [stepIndex]);

  function nextStep() {
    setStepIndex((index) => Math.min(index + 1, workflowSteps.length - 1));
  }

  function previousStep() {
    setStepIndex((index) => Math.max(index - 1, 0));
  }

  function toggleSource(id: string) {
    setSelectedSourceIds((ids) =>
      ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id]
    );
  }

  function removeContext(id: string) {
    setSelectedContext((items) => items.filter((item) => item.id !== id));
  }

  function updateAnswer(id: string, answer: string) {
    setQuestions((items) =>
      items.map((item) => (item.id === id ? { ...item, answer } : item))
    );
  }

  function toggleOutput(id: string) {
    setSelectedOutputIds((ids) =>
      ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id]
    );
  }

  function updateInitiativeField(
    id: keyof InitiativeDefinitionValues,
    value: InitiativeDefinitionValues[keyof InitiativeDefinitionValues]
  ) {
    setInitiativeDefinition((fields) => ({
      ...fields,
      [id]: value
    }));
  }

  return (
    <section ref={workflowTopRef}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-blue-300">
            Create PRD
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.02em] text-zinc-50">
            Turn fragmented context into engineering-ready requirements
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-400">
            Orchestrate context ingestion, AI-assisted analysis, clarification
            loops, and readiness checks before generating delivery artifacts.
          </p>
        </div>
        <button
          type="button"
          className="inline-flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-md border border-zinc-700 bg-zinc-900/50 px-4 text-sm font-medium text-zinc-300 transition hover:border-zinc-500 hover:text-white"
        >
          <Save className="h-4 w-4" strokeWidth={1.9} />
          Save Draft
        </button>
      </div>

      <div className="mt-7">
        <WorkflowProgress steps={workflowSteps} currentIndex={stepIndex} />
      </div>

      <div className="mt-7">
        {currentStep.id === "setup" ? (
          <InitiativeSetup
            values={initiativeDefinition}
            onFieldChange={updateInitiativeField}
          />
        ) : null}
        {currentStep.id === "sources" ? (
          <ContextSources
            selectedSourceIds={selectedSourceIds}
            selectedContext={selectedContext}
            contextUsage={contextUsage}
            onToggleSource={toggleSource}
            onRemoveContext={removeContext}
          />
        ) : null}
        {currentStep.id === "analysis" ? <AiAnalysis /> : null}
        {currentStep.id === "clarify" ? (
          <ClarificationWorkflow
            questions={questions}
            expandedQuestionId={expandedQuestionId}
            onExpand={setExpandedQuestionId}
            onAnswerChange={updateAnswer}
          />
        ) : null}
        {currentStep.id === "generate" ? (
          <GenerateOutputs
            selectedSourcesCount={selectedSources.length}
            answeredCount={answeredCount}
            totalQuestions={questions.length}
            selectedOutputIds={selectedOutputIds}
            onToggleOutput={toggleOutput}
          />
        ) : null}
      </div>

      <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={previousStep}
          disabled={stepIndex === 0}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-zinc-700 bg-zinc-900/50 px-5 text-sm font-medium text-zinc-300 transition hover:border-zinc-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.9} />
          Back
        </button>
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            className="inline-flex h-11 items-center justify-center gap-2 whitespace-nowrap rounded-md border border-zinc-700 bg-zinc-900/50 px-5 text-sm font-medium text-zinc-300 transition hover:border-zinc-500 hover:text-white"
          >
            <Save className="h-4 w-4" strokeWidth={1.9} />
            Save Draft
          </button>
          {stepIndex < workflowSteps.length - 1 ? (
            <button
              type="button"
              onClick={nextStep}
              className="inline-flex h-11 items-center justify-center gap-2 whitespace-nowrap rounded-md bg-primary px-5 text-sm font-medium text-white transition hover:bg-blue-400"
            >
              Next
              <ArrowRight className="h-4 w-4" strokeWidth={1.9} />
            </button>
          ) : (
            <button
              type="button"
              className="inline-flex h-11 items-center justify-center gap-2 whitespace-nowrap rounded-md bg-primary px-5 text-sm font-medium text-white transition hover:bg-blue-400"
            >
              <Sparkles className="h-4 w-4" strokeWidth={1.9} />
              Generate Engineering-Ready Outputs
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

function InitiativeSetup({
  values,
  onFieldChange
}: {
  values: InitiativeDefinitionValues;
  onFieldChange: <Key extends keyof InitiativeDefinitionValues>(
    id: Key,
    value: InitiativeDefinitionValues[Key]
  ) => void;
}) {
  function addListItem(
    id: keyof Pick<
      InitiativeDefinitionValues,
      | "currentPainPoints"
      | "inScope"
      | "outOfScope"
      | "technicalConstraints"
      | "governanceRequirements"
      | "rolloutConstraints"
    >,
    value: string
  ) {
    if (!values[id].includes(value)) {
      onFieldChange(id, [...values[id], value]);
    }
  }

  function removeListItem(
    id: keyof Pick<
      InitiativeDefinitionValues,
      | "currentPainPoints"
      | "inScope"
      | "outOfScope"
      | "technicalConstraints"
      | "governanceRequirements"
      | "rolloutConstraints"
    >,
    value: string
  ) {
    onFieldChange(
      id,
      values[id].filter((item) => item !== value)
    );
  }

  function toggleSystem(id: string) {
    onFieldChange(
      "relatedSystems",
      values.relatedSystems.map((system) =>
        system.id === id ? { ...system, selected: !system.selected } : system
      )
    );
  }

  return (
    <div className="space-y-5">
      <SectionPanel
        title="Initiative overview"
        description="Frame the business objective and operating outcome before context is ingested."
      >
        <div className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
          <TextField
            id="initiativeName"
            label="Initiative Name"
            value={values.initiativeName}
            helper="Use the language teams already use in roadmap and delivery planning."
            onChange={(value) => onFieldChange("initiativeName", value)}
          />
          <TextAreaField
            id="executiveSummary"
            label="Executive Summary"
            value={values.executiveSummary}
            placeholder="Enable external partners to manage billing permissions independently while preserving auditability and role-based access controls."
            helper="Describe the business objective and operational outcome this initiative is intended to achieve."
            rows={4}
            onChange={(value) => onFieldChange("executiveSummary", value)}
          />
        </div>
      </SectionPanel>

      <SectionPanel
        title="Operational metadata"
        description="These fields shape the workflow template, ownership model, and generated output structure."
      >
        <div className="grid gap-4 md:grid-cols-3">
          <TextField
            id="primaryTeam"
            label="Primary team"
            value={values.primaryTeam}
            helper="The team accountable for requirement quality and delivery readiness."
            onChange={(value) => onFieldChange("primaryTeam", value)}
          />
          <TextField
            id="deliveryWorkflow"
            label="Delivery workflow"
            value={values.deliveryWorkflow}
            helper="Later this can become a workspace-defined dropdown."
            onChange={(value) => onFieldChange("deliveryWorkflow", value)}
          />
          <TextField
            id="outputTemplate"
            label="Output template"
            value={values.outputTemplate}
            helper="Later this can pull from approved internal templates."
            onChange={(value) => onFieldChange("outputTemplate", value)}
          />
        </div>
      </SectionPanel>

      <SectionPanel
        title="Business context"
        description="Help the system understand why the initiative matters and how success should be evaluated."
      >
        <div className="grid gap-5 lg:grid-cols-2">
          <BulletInput
            id="currentPainPoints"
            label="Current Pain Points"
            items={values.currentPainPoints}
            placeholder="Add a pain point and press Enter"
            helper="Capture current friction, operational gaps, or workflow risks."
            onAdd={(value) => addListItem("currentPainPoints", value)}
            onRemove={(value) => removeListItem("currentPainPoints", value)}
          />
          <TextAreaField
            id="desiredOutcomes"
            label="Desired Outcomes"
            value={values.desiredOutcomes}
            rows={5}
            helper="Describe the future state the PRD should drive toward."
            onChange={(value) => onFieldChange("desiredOutcomes", value)}
          />
        </div>
        <div className="mt-5">
          <MetricEntries
            metrics={values.successMetrics}
            onChange={(metrics) => onFieldChange("successMetrics", metrics)}
          />
        </div>
      </SectionPanel>

      <SectionPanel
        title="Scope definition"
        description="Clear boundaries improve requirement quality and prevent downstream ambiguity."
      >
        <div className="grid gap-5 lg:grid-cols-2">
          <BulletInput
            id="inScope"
            label="In Scope"
            items={values.inScope}
            placeholder="Add an in-scope item and press Enter"
            helper="Define the systems, roles, workflows, and behaviors the PRD must cover."
            onAdd={(value) => addListItem("inScope", value)}
            onRemove={(value) => removeListItem("inScope", value)}
          />
          <BulletInput
            id="outOfScope"
            label="Out of Scope"
            items={values.outOfScope}
            placeholder="Add an out-of-scope item and press Enter"
            helper="Exclude work explicitly so AI analysis does not over-expand requirements."
            onAdd={(value) => addListItem("outOfScope", value)}
            onRemove={(value) => removeListItem("outOfScope", value)}
          />
        </div>
      </SectionPanel>

      <SectionPanel
        title="Technical constraints and governance"
        description="Surface non-negotiable delivery, compliance, and rollout constraints before analysis."
      >
        <div className="grid gap-5 lg:grid-cols-3">
          <BulletInput
            id="technicalConstraints"
            label="Technical Constraints"
            items={values.technicalConstraints}
            placeholder="Add a technical constraint"
            onAdd={(value) => addListItem("technicalConstraints", value)}
            onRemove={(value) =>
              removeListItem("technicalConstraints", value)
            }
          />
          <BulletInput
            id="governanceRequirements"
            label="Compliance / Governance Requirements"
            items={values.governanceRequirements}
            placeholder="Add a governance requirement"
            onAdd={(value) => addListItem("governanceRequirements", value)}
            onRemove={(value) =>
              removeListItem("governanceRequirements", value)
            }
          />
          <BulletInput
            id="rolloutConstraints"
            label="Rollout Constraints"
            items={values.rolloutConstraints}
            placeholder="Add a rollout constraint"
            onAdd={(value) => addListItem("rolloutConstraints", value)}
            onRemove={(value) => removeListItem("rolloutConstraints", value)}
          />
        </div>
        <div className="mt-5">
          <GovernanceCallout icon={Shield} title="Governance-sensitive intake">
            Compliance requirements, rollout constraints, and audit needs remain
            traceable through downstream analysis, clarification, and generated
            outputs.
          </GovernanceCallout>
        </div>
      </SectionPanel>

      <SectionPanel
        title="Related systems and dependencies"
        description="Identify the operational surface area so future analysis can reason about architecture impact."
      >
        <DependencyReferences
          systems={values.relatedSystems}
          onToggle={toggleSystem}
        />
      </SectionPanel>

      <GuidancePanel icon={Brain} title="AI readiness guidance">
        Structured initiative definitions improve requirement analysis,
        dependency detection, and context relevance scoring. More explicit
        scope, constraints, and success criteria help ContextPRD rank enterprise
        context more accurately before generation.
      </GuidancePanel>
    </div>
  );
}

function ContextSources({
  selectedSourceIds,
  selectedContext,
  contextUsage,
  onToggleSource,
  onRemoveContext
}: {
  selectedSourceIds: string[];
  selectedContext: SelectedContext[];
  contextUsage: number;
  onToggleSource: (id: string) => void;
  onRemoveContext: (id: string) => void;
}) {
  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
      <div className="space-y-5">
        <SectionPanel
          title="Connected sources"
          description="Select the systems and document sets that should be available for AI-assisted requirement analysis."
        >
          <div className="grid gap-3 md:grid-cols-2">
            {contextSources.map((source) => (
              <ContextSourceCard
                key={source.id}
                source={source}
                selected={selectedSourceIds.includes(source.id)}
                onToggle={() => onToggleSource(source.id)}
              />
            ))}
          </div>
        </SectionPanel>

        <SectionPanel title="Governance notice">
          <div className="flex items-start gap-3 rounded-lg border border-blue-500/20 bg-blue-500/10 p-4">
            <LockKeyhole className="mt-0.5 h-5 w-5 shrink-0 text-blue-300" strokeWidth={1.8} />
            <p className="text-sm leading-6 text-zinc-300">
              Only selected documents will be exposed to AI analysis. Context
              usage is traceable, scoped, and optimized before generation.
            </p>
          </div>
        </SectionPanel>
      </div>

      <div className="space-y-5">
        <SectionPanel
          title="Selected context"
          description="Remove documents that should not influence analysis or generation."
        >
          <div className="space-y-2">
            {selectedContext.map((item) => (
              <ContextPill
                key={item.id}
                item={item}
                onRemove={() => onRemoveContext(item.id)}
              />
            ))}
          </div>
        </SectionPanel>

        <SectionPanel title="Context window usage">
          <StatusMeter
            label="Estimated Context Usage"
            value={contextUsage}
            helper="ContextPRD filters duplicated, stale, and low-signal material before analysis."
          />
        </SectionPanel>
      </div>
    </div>
  );
}

function AiAnalysis() {
  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_340px]">
      <SectionPanel
        title="AI analysis summary"
        description="The system reviews selected context before drafting, surfacing delivery risks and ambiguous requirements."
      >
        <div className="grid gap-3 md:grid-cols-2">
          {insights.map((insight) => (
            <InsightCard key={insight.title} insight={insight} />
          ))}
        </div>
      </SectionPanel>

      <div className="space-y-5">
        <SectionPanel title="Confidence indicators">
          <div className="space-y-3">
            <StatusMeter
              label="Context completeness"
              value={78}
              tone="green"
              helper="Strong architecture and API coverage; rollout detail is lighter."
            />
            <StatusMeter
              label="Requirement confidence"
              value={64}
              tone="amber"
              helper="Clarification required before engineering-ready output."
            />
            <StatusMeter
              label="Missing information"
              value={36}
              tone="amber"
              helper="Rollback, compatibility, and audit logging need review."
            />
          </div>
        </SectionPanel>

        <SectionPanel title="Suggested areas to clarify">
          <div className="space-y-2">
            {clarificationQuestions.map((question) => (
              <div
                key={question.id}
                className="rounded-lg border border-line bg-[#101014] p-3 text-sm leading-6 text-zinc-300"
              >
                {question.question}
              </div>
            ))}
          </div>
        </SectionPanel>
      </div>
    </div>
  );
}

function ClarificationWorkflow({
  questions,
  expandedQuestionId,
  onExpand,
  onAnswerChange
}: {
  questions: ClarificationQuestion[];
  expandedQuestionId: string;
  onExpand: (id: string) => void;
  onAnswerChange: (id: string, answer: string) => void;
}) {
  return (
    <SectionPanel
      title="Clarification workflow"
      description="Resolve ambiguity through structured human-in-the-loop refinement. Each question remains tied to the context that informed it."
    >
      <div className="space-y-3">
        {questions.map((question, index) => {
          const isExpanded = expandedQuestionId === question.id;

          return (
            <article
              key={question.id}
              className="rounded-lg border border-line bg-[#101014] p-4"
            >
              <button
                type="button"
                onClick={() => onExpand(isExpanded ? "" : question.id)}
                className="flex w-full items-start justify-between gap-4 text-left"
              >
                <span>
                  <span className="font-mono text-xs text-blue-300">
                    Q{index + 1}
                  </span>
                  <span className="mt-2 block text-sm font-semibold text-zinc-100">
                    {question.question}
                  </span>
                </span>
                <ChevronDown
                  className={
                    isExpanded
                      ? "h-4 w-4 shrink-0 rotate-180 text-zinc-500 transition"
                      : "h-4 w-4 shrink-0 text-zinc-500 transition"
                  }
                  strokeWidth={1.8}
                />
              </button>

              {isExpanded ? (
                <div className="mt-4 border-t border-white/10 pt-4">
                  <label className="block">
                    <span className="text-sm font-medium text-zinc-300">
                      Requirement answer
                    </span>
                    <textarea
                      value={question.answer}
                      onChange={(event) =>
                        onAnswerChange(question.id, event.target.value)
                      }
                      rows={4}
                      className="mt-2 w-full resize-none rounded-md border border-line bg-[#09090b] px-3 py-3 text-sm leading-6 text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-blue-500/60"
                      placeholder="Add an answer or decision for this clarification..."
                    />
                  </label>

                  <div className="mt-3 rounded-lg border border-blue-500/20 bg-blue-500/10 p-3">
                    <p className="text-xs font-medium uppercase tracking-[0.14em] text-blue-200">
                      AI follow-up suggestion
                    </p>
                    <p className="mt-2 text-sm leading-6 text-zinc-300">
                      {question.suggestion}
                    </p>
                  </div>

                  <details className="mt-3 rounded-lg border border-line bg-surface p-3">
                    <summary className="cursor-pointer text-sm font-medium text-zinc-300">
                      Referenced context
                    </summary>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {question.references.map((reference) => (
                        <Badge key={reference} icon={FileText}>
                          {reference}
                        </Badge>
                      ))}
                    </div>
                  </details>
                </div>
              ) : null}
            </article>
          );
        })}
      </div>
    </SectionPanel>
  );
}

function GenerateOutputs({
  selectedSourcesCount,
  answeredCount,
  totalQuestions,
  selectedOutputIds,
  onToggleOutput
}: {
  selectedSourcesCount: number;
  answeredCount: number;
  totalQuestions: number;
  selectedOutputIds: string[];
  onToggleOutput: (id: string) => void;
}) {
  return (
    <div className="grid gap-5 xl:grid-cols-[360px_1fr]">
      <div className="space-y-5">
        <SectionPanel title="Generation summary">
          <div className="space-y-3">
            <StatusMeter
              label="Readiness score"
              value={82}
              tone="green"
              helper="Ready for governed output generation with minor open decisions."
            />
            <div className="grid gap-2">
              <Badge icon={Library}>{selectedSourcesCount} context sources used</Badge>
              <Badge icon={CheckCircle2}>
                {answeredCount}/{totalQuestions} clarifications complete
              </Badge>
              <Badge icon={Shield}>Governance validation checks passed</Badge>
              <Badge icon={AlertTriangle}>1 launch risk requires review</Badge>
            </div>
          </div>
        </SectionPanel>
      </div>

      <SectionPanel
        title="Output types"
        description="Select the artifacts ContextPRD should generate from the governed requirement state."
      >
        <div className="grid gap-3 md:grid-cols-2">
          {outputTypes.map((output) => (
            <OutputTypeCard
              key={output.id}
              output={output}
              selected={selectedOutputIds.includes(output.id)}
              onToggle={() => onToggleOutput(output.id)}
            />
          ))}
        </div>
      </SectionPanel>
    </div>
  );
}
