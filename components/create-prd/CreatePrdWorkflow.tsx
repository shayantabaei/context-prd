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
  Loader2,
  Save,
  Shield,
  Sparkles,
  UploadCloud,
  XCircle
} from "lucide-react";
import {
  analyzeInitiativeRequest,
  createInitiativeRequest,
  updateInitiativeRequest,
  uploadContextDocumentsRequest
} from "@/lib/client/create-prd-api";
import type {
  AnalysisFinding,
  ClarificationQuestion as ApiClarificationQuestion,
  ContextDocument,
  CreateInitiativeRequest,
  DocumentAnalysis,
  Initiative,
  InitiativeAnalysis,
  IrrelevantContext
} from "@/lib/types/initiative";
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
  contextSources,
  initialSelectedContext,
  outputTypes,
  workflowSteps,
  type SelectedContext
} from "./workflow-data";
import {
  Badge,
  ContextPill,
  ContextSourceCard,
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

type ClarificationAnswer = ApiClarificationQuestion & {
  answer: string;
};

type AsyncState = {
  loading: boolean;
  success?: string;
  error?: string;
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

function toInitiativeRequest(
  values: InitiativeDefinitionValues
): CreateInitiativeRequest {
  return {
    initiativeName: values.initiativeName,
    executiveSummary: values.executiveSummary,
    metadata: {
      team: values.primaryTeam,
      workflow: values.deliveryWorkflow,
      outputTemplateName: values.outputTemplate
    },
    businessContext: {
      painPoints: values.currentPainPoints,
      outcomes: values.desiredOutcomes,
      successMetrics: values.successMetrics
        .filter((metric) => metric.metric.trim() && metric.target.trim())
        .map((metric) => ({
          metric: metric.metric,
          target: metric.target
        }))
    },
    scope: {
      inScope: values.inScope,
      outOfScope: values.outOfScope
    },
    constraints: {
      technicalConstraints: values.technicalConstraints,
      governanceRequirements: values.governanceRequirements,
      rolloutConstraints: values.rolloutConstraints
    },
    dependencies: values.relatedSystems
      .filter((system) => system.selected)
      .map((system) => ({
        system: system.name,
        impact: system.impact.toLowerCase() as "low" | "medium" | "high",
        description: system.relationship
      }))
  };
}

export function CreatePrdWorkflow() {
  const workflowTopRef = useRef<HTMLElement | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [initiativeDefinition, setInitiativeDefinition] =
    useState<InitiativeDefinitionValues>(initialInitiativeDefinition);
  const [initiative, setInitiative] = useState<Initiative | null>(null);
  const [documents, setDocuments] = useState<ContextDocument[]>([]);
  const [analysis, setAnalysis] = useState<InitiativeAnalysis | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [saveState, setSaveState] = useState<AsyncState>({ loading: false });
  const [uploadState, setUploadState] = useState<AsyncState>({ loading: false });
  const [analysisState, setAnalysisState] = useState<AsyncState>({
    loading: false
  });
  const [selectedSourceIds, setSelectedSourceIds] = useState<string[]>([
    "confluence",
    "jira",
    "uploads",
    "architecture"
  ]);
  const [selectedContext, setSelectedContext] = useState<SelectedContext[]>(
    initialSelectedContext
  );
  const [questions, setQuestions] = useState<ClarificationAnswer[]>([]);
  const [expandedQuestionId, setExpandedQuestionId] = useState<string>("");
  const [selectedOutputIds, setSelectedOutputIds] = useState<string[]>([
    "enterprise-prd",
    "engineering-tasks",
    "rollout-checklist"
  ]);

  const currentStep = workflowSteps[stepIndex];
  const answeredCount = questions.filter((question) => question.answer.trim()).length;
  const processedDocumentCount = documents.filter(
    (document) => document.processingStatus === "processed"
  ).length;
  const contextUsage = Math.min(
    92,
    20 + selectedContext.length * 5 + processedDocumentCount * 12
  );

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

  async function saveInitiative() {
    setSaveState({ loading: true });

    try {
      const payload = toInitiativeRequest(initiativeDefinition);
      const savedInitiative = initiative
        ? await updateInitiativeRequest(initiative.id, payload)
        : await createInitiativeRequest(payload);

      setInitiative(savedInitiative);
      setSaveState({
        loading: false,
        success: initiative ? "Initiative updated" : "Initiative saved"
      });

      return savedInitiative;
    } catch (error) {
      setSaveState({
        loading: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to save initiative"
      });

      return null;
    }
  }

  async function uploadDocuments() {
    if (!initiative || selectedFiles.length === 0) {
      return;
    }

    setUploadState({ loading: true });

    try {
      const uploadedDocuments = await uploadContextDocumentsRequest(
        initiative.id,
        selectedFiles
      );

      setDocuments((items) => [...items, ...uploadedDocuments]);
      setSelectedFiles([]);
      setAnalysis(null);
      setQuestions([]);
      setUploadState({
        loading: false,
        success: `${uploadedDocuments.length} file${
          uploadedDocuments.length === 1 ? "" : "s"
        } uploaded`
      });
    } catch (error) {
      setUploadState({
        loading: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to upload context documents"
      });
    }
  }

  async function runAnalysis() {
    if (!initiative || processedDocumentCount === 0) {
      return;
    }

    setAnalysisState({ loading: true });

    try {
      const nextAnalysis = await analyzeInitiativeRequest(initiative.id);

      setAnalysis(nextAnalysis);
      setQuestions(
        nextAnalysis.clarificationQuestions.map((question) => ({
          ...question,
          answer: ""
        }))
      );
      setExpandedQuestionId(
        nextAnalysis.clarificationQuestions[0]
          ? String(nextAnalysis.clarificationQuestions[0].id)
          : ""
      );
      setAnalysisState({
        loading: false,
        success: "Analysis complete"
      });
    } catch (error) {
      setAnalysisState({
        loading: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to run analysis"
      });
    }
  }

  async function nextStep() {
    if (currentStep.id === "setup") {
      const savedInitiative = await saveInitiative();

      if (!savedInitiative) {
        return;
      }
    }

    if (currentStep.id === "sources" && processedDocumentCount === 0) {
      setUploadState({
        loading: false,
        error: "Upload at least one processed context document before analysis."
      });
      return;
    }

    if (currentStep.id === "analysis" && !analysis) {
      setAnalysisState({
        loading: false,
        error: "Run analysis before moving to clarification."
      });
      return;
    }

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
      items.map((item) => (String(item.id) === id ? { ...item, answer } : item))
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
          onClick={saveInitiative}
          disabled={saveState.loading}
          className="inline-flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-md border border-zinc-700 bg-zinc-900/50 px-4 text-sm font-medium text-zinc-300 transition hover:border-zinc-500 hover:text-white"
        >
          {saveState.loading ? (
            <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.9} />
          ) : (
            <Save className="h-4 w-4" strokeWidth={1.9} />
          )}
          {initiative ? "Update Initiative" : "Save Initiative"}
        </button>
      </div>

      <div className="mt-7">
        <WorkflowProgress steps={workflowSteps} currentIndex={stepIndex} />
      </div>

      <div className="mt-7">
        {currentStep.id === "setup" ? (
          <InitiativeSetup
            values={initiativeDefinition}
            initiative={initiative}
            saveState={saveState}
            onFieldChange={updateInitiativeField}
          />
        ) : null}
        {currentStep.id === "sources" ? (
          <ContextSources
            initiative={initiative}
            selectedSourceIds={selectedSourceIds}
            selectedContext={selectedContext}
            documents={documents}
            selectedFiles={selectedFiles}
            uploadState={uploadState}
            contextUsage={contextUsage}
            onToggleSource={toggleSource}
            onRemoveContext={removeContext}
            onFilesChange={setSelectedFiles}
            onUpload={uploadDocuments}
          />
        ) : null}
        {currentStep.id === "analysis" ? (
          <AiAnalysis
            analysis={analysis}
            documents={documents}
            analysisState={analysisState}
            onRunAnalysis={runAnalysis}
          />
        ) : null}
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
            processedDocumentCount={processedDocumentCount}
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
            onClick={saveInitiative}
            disabled={saveState.loading}
            className="inline-flex h-11 items-center justify-center gap-2 whitespace-nowrap rounded-md border border-zinc-700 bg-zinc-900/50 px-5 text-sm font-medium text-zinc-300 transition hover:border-zinc-500 hover:text-white"
          >
            {saveState.loading ? (
              <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.9} />
            ) : (
              <Save className="h-4 w-4" strokeWidth={1.9} />
            )}
            {initiative ? "Update" : "Save Draft"}
          </button>
          {stepIndex < workflowSteps.length - 1 ? (
            <button
              type="button"
              onClick={nextStep}
              disabled={saveState.loading || uploadState.loading || analysisState.loading}
              className="inline-flex h-11 items-center justify-center gap-2 whitespace-nowrap rounded-md bg-primary px-5 text-sm font-medium text-white transition hover:bg-blue-400"
            >
              Next
              <ArrowRight className="h-4 w-4" strokeWidth={1.9} />
            </button>
          ) : (
            <button
              type="button"
              disabled
              className="inline-flex h-11 cursor-not-allowed items-center justify-center gap-2 whitespace-nowrap rounded-md border border-zinc-700 bg-zinc-900/50 px-5 text-sm font-medium text-zinc-500"
            >
              <Sparkles className="h-4 w-4" strokeWidth={1.9} />
              Generation Coming Later
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

function InitiativeSetup({
  values,
  initiative,
  saveState,
  onFieldChange
}: {
  values: InitiativeDefinitionValues;
  initiative: Initiative | null;
  saveState: AsyncState;
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
      <WorkflowNotice
        state={saveState}
        successFallback={
          initiative
            ? `Initiative #${initiative.id} is saved and ready for context upload.`
            : undefined
        }
      />

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

function WorkflowNotice({
  state,
  successFallback
}: {
  state: AsyncState;
  successFallback?: string;
}) {
  const message = state.error ?? state.success ?? successFallback;

  if (!message) {
    return null;
  }

  const tone = state.error
    ? "border-red-400/20 bg-red-400/10 text-red-200"
    : "border-emerald-400/20 bg-emerald-400/10 text-emerald-200";

  return (
    <div className={`rounded-lg border p-3 text-sm leading-6 ${tone}`}>
      {message}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-line bg-[#101014] p-4 text-sm leading-6 text-zinc-500">
      {message}
    </div>
  );
}

function DocumentStatusRow({ document }: { document: ContextDocument }) {
  const failed = document.processingStatus === "failed";

  return (
    <div
      className={
        failed
          ? "rounded-lg border border-red-400/20 bg-red-400/10 p-3"
          : "rounded-lg border border-line bg-[#101014] p-3"
      }
    >
      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p
            className="truncate text-sm font-medium text-zinc-100"
            title={document.filename}
          >
            {document.filename}
          </p>
          <p className="mt-1 truncate text-xs text-zinc-600" title={document.mimeType}>
            {document.mimeType}
          </p>
        </div>
        <span
          className={
            failed
              ? "shrink-0 whitespace-nowrap rounded-md border border-red-400/20 px-2 py-1 text-xs font-medium text-red-200"
              : "shrink-0 whitespace-nowrap rounded-md border border-emerald-400/20 bg-emerald-400/10 px-2 py-1 text-xs font-medium text-emerald-200"
          }
        >
          {document.processingStatus}
        </span>
      </div>
      <p className="mt-2 text-xs leading-5 text-zinc-500">
        Uploaded {new Date(document.uploadedAt).toLocaleString()}
      </p>
      {failed ? (
        <p className="mt-2 flex items-center gap-1.5 text-xs leading-5 text-red-200">
          <XCircle className="h-3.5 w-3.5" strokeWidth={1.8} />
          Text extraction failed. Re-upload a supported text-bearing file.
        </p>
      ) : null}
    </div>
  );
}

function DocumentAnalysisCard({ document }: { document: DocumentAnalysis }) {
  return (
    <article className="rounded-lg border border-line bg-[#101014] p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold text-zinc-100">
            {document.filename}
          </h3>
          <p className="mt-2 text-sm leading-6 text-zinc-500">
            {document.summary}
          </p>
        </div>
        <span className="shrink-0 rounded-md border border-blue-500/20 bg-blue-500/10 px-2.5 py-1 text-xs font-medium text-blue-200">
          {document.relevancyScore}% relevant
        </span>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <TopicList title="Relevant topics" topics={document.relevantTopics} />
        <TopicList
          title="Potentially irrelevant"
          topics={document.potentiallyIrrelevantTopics}
        />
      </div>
      <p className="mt-4 text-xs leading-5 text-zinc-500">{document.comments}</p>
    </article>
  );
}

function TopicList({ title, topics }: { title: string; topics: string[] }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">
        {title}
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        {topics.length > 0 ? (
          topics.map((topic) => <Badge key={topic}>{topic}</Badge>)
        ) : (
          <Badge>None supplied</Badge>
        )}
      </div>
    </div>
  );
}

function AnalysisFindingGroup({
  title,
  findings
}: {
  title: string;
  findings: AnalysisFinding[];
}) {
  return (
    <div className="mt-5 first:mt-0">
      <h3 className="text-sm font-semibold text-zinc-200">{title}</h3>
      <div className="mt-3 space-y-3">
        {findings.length > 0 ? (
          findings.map((finding) => (
            <article
              key={`${finding.category}-${finding.title}`}
              className="rounded-lg border border-line bg-[#101014] p-4"
            >
              <div className="flex flex-wrap gap-2">
                <SeverityBadge severity={finding.severity} />
                <Badge>{finding.category}</Badge>
              </div>
              <h4 className="mt-3 text-sm font-semibold text-zinc-100">
                {finding.title}
              </h4>
              <p className="mt-2 text-sm leading-6 text-zinc-500">
                {finding.description}
              </p>
              {finding.recommendation ? (
                <p className="mt-3 text-xs leading-5 text-zinc-400">
                  Recommendation: {finding.recommendation}
                </p>
              ) : null}
              {finding.relatedSystems?.length ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {finding.relatedSystems.map((system) => (
                    <Badge key={system}>{system}</Badge>
                  ))}
                </div>
              ) : null}
            </article>
          ))
        ) : (
          <EmptyState message={`No ${title.toLowerCase()} returned.`} />
        )}
      </div>
    </div>
  );
}

function IrrelevantContextCard({ item }: { item: IrrelevantContext }) {
  return (
    <article className="rounded-lg border border-line bg-[#101014] p-3">
      <p className="text-sm font-semibold text-zinc-100">{item.filename}</p>
      <p className="mt-2 text-xs leading-5 text-zinc-500">{item.reason}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {item.irrelevantTopics.map((topic) => (
          <Badge key={topic}>{topic}</Badge>
        ))}
      </div>
    </article>
  );
}

function SeverityBadge({ severity }: { severity: "low" | "medium" | "high" }) {
  const tone =
    severity === "high"
      ? "border-red-400/20 bg-red-400/10 text-red-200"
      : severity === "medium"
        ? "border-amber-400/20 bg-amber-400/10 text-amber-200"
        : "border-emerald-400/20 bg-emerald-400/10 text-emerald-200";

  return (
    <span className={`rounded-md border px-2.5 py-1 text-xs font-medium ${tone}`}>
      {severity}
    </span>
  );
}

function ContextSources({
  initiative,
  selectedSourceIds,
  selectedContext,
  documents,
  selectedFiles,
  uploadState,
  contextUsage,
  onToggleSource,
  onRemoveContext,
  onFilesChange,
  onUpload
}: {
  initiative: Initiative | null;
  selectedSourceIds: string[];
  selectedContext: SelectedContext[];
  documents: ContextDocument[];
  selectedFiles: File[];
  uploadState: AsyncState;
  contextUsage: number;
  onToggleSource: (id: string) => void;
  onRemoveContext: (id: string) => void;
  onFilesChange: (files: File[]) => void;
  onUpload: () => void;
}) {
  const processedCount = documents.filter(
    (document) => document.processingStatus === "processed"
  ).length;

  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
      <div className="space-y-5">
        <WorkflowNotice state={uploadState} />

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

        <SectionPanel
          title="Manual context upload"
          description="Upload text-bearing documents for this initiative. Connectors stay mocked for v0; uploaded files drive backend analysis."
        >
          <div className="rounded-lg border border-dashed border-zinc-700 bg-[#09090b] p-4">
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-md px-4 py-6 text-center transition hover:bg-zinc-900/70">
              <UploadCloud className="h-8 w-8 text-blue-300" strokeWidth={1.8} />
              <span className="mt-3 text-sm font-medium text-zinc-200">
                Select context documents
              </span>
              <span className="mt-1 text-xs leading-5 text-zinc-500">
                Supports .txt, .md, .pdf, and .docx. Multiple files are allowed.
              </span>
              <input
                type="file"
                multiple
                accept=".txt,.md,.pdf,.docx,text/plain,text/markdown,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                className="sr-only"
                onChange={(event) =>
                  onFilesChange(Array.from(event.currentTarget.files ?? []))
                }
              />
            </label>
          </div>

          {selectedFiles.length > 0 ? (
            <div className="mt-4 rounded-lg border border-line bg-[#101014] p-3">
              <p className="text-sm font-medium text-zinc-200">
                Ready to upload
              </p>
              <div className="mt-3 space-y-2">
                {selectedFiles.map((file) => (
                  <div
                    key={`${file.name}-${file.size}`}
                    className="flex items-center justify-between gap-3 rounded-md border border-line bg-[#09090b] px-3 py-2"
                  >
                    <span>
                      <span className="block text-sm text-zinc-200">
                        {file.name}
                      </span>
                      <span className="mt-0.5 block text-xs text-zinc-600">
                        {file.type || "application/octet-stream"}
                      </span>
                    </span>
                    <span className="font-mono text-xs text-zinc-500">
                      {Math.max(1, Math.round(file.size / 1024))} KB
                    </span>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={onUpload}
                disabled={!initiative || uploadState.loading}
                className="mt-4 inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-white transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {uploadState.loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.8} />
                ) : (
                  <UploadCloud className="h-4 w-4" strokeWidth={1.8} />
                )}
                Upload selected files
              </button>
              {!initiative ? (
                <p className="mt-2 text-xs leading-5 text-amber-300">
                  Save the initiative before uploading context.
                </p>
              ) : null}
            </div>
          ) : null}
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
          title="Uploaded documents"
          description="Documents returned by the backend upload pipeline."
        >
          {documents.length > 0 ? (
            <div className="space-y-2">
              {documents.map((document) => (
                <DocumentStatusRow key={document.id} document={document} />
              ))}
            </div>
          ) : (
            <EmptyState message="No context documents uploaded yet." />
          )}
          <p className="mt-3 text-xs leading-5 text-zinc-500">
            {processedCount} processed document{processedCount === 1 ? "" : "s"} available for analysis.
          </p>
        </SectionPanel>

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

function AiAnalysis({
  analysis,
  documents,
  analysisState,
  onRunAnalysis
}: {
  analysis: InitiativeAnalysis | null;
  documents: ContextDocument[];
  analysisState: AsyncState;
  onRunAnalysis: () => void;
}) {
  const canAnalyze = documents.some(
    (document) => document.processingStatus === "processed"
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 rounded-xl border border-line bg-surface p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-[-0.01em] text-zinc-50">
            AI context analysis
          </h2>
          <p className="mt-2 text-sm leading-6 text-zinc-500">
            Run backend analysis against the saved initiative and processed context documents.
          </p>
        </div>
        <button
          type="button"
          onClick={onRunAnalysis}
          disabled={!canAnalyze || analysisState.loading}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-white transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {analysisState.loading ? (
            <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.8} />
          ) : (
            <Sparkles className="h-4 w-4" strokeWidth={1.8} />
          )}
          Run Analysis
        </button>
      </div>

      <WorkflowNotice state={analysisState} />

      {!canAnalyze ? (
        <SectionPanel title="Analysis blocked">
          <EmptyState message="Upload at least one processed context document before running analysis." />
        </SectionPanel>
      ) : null}

      {analysis ? (
        <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
          <div className="space-y-5">
            <SectionPanel
              title="Document analysis"
              description="Backend relevancy scoring and summaries for uploaded context."
            >
              <div className="space-y-3">
                {analysis.documentAnalysis.map((document) => (
                  <DocumentAnalysisCard
                    key={document.documentId}
                    document={document}
                  />
                ))}
              </div>
            </SectionPanel>

            <SectionPanel
              title="Gaps, risks, and dependencies"
              description="Implementation readiness issues inferred from the initiative and context."
            >
              <AnalysisFindingGroup
                title="Detected gaps"
                findings={analysis.detectedGaps}
              />
              <AnalysisFindingGroup
                title="Detected risks"
                findings={analysis.detectedRisks}
              />
              <AnalysisFindingGroup
                title="Inferred dependencies"
                findings={analysis.inferredDependencies}
              />
            </SectionPanel>
          </div>

          <div className="space-y-5">
            <SectionPanel title="Irrelevant context">
              {analysis.irrelevantContext.length > 0 ? (
                <div className="space-y-2">
                  {analysis.irrelevantContext.map((item) => (
                    <IrrelevantContextCard key={item.documentId} item={item} />
                  ))}
                </div>
              ) : (
                <EmptyState message="No irrelevant context detected." />
              )}
            </SectionPanel>

            <SectionPanel title="Clarification questions">
              <div className="space-y-2">
                {analysis.clarificationQuestions.map((question) => (
                  <div
                    key={question.id}
                    className="rounded-lg border border-line bg-[#101014] p-3"
                  >
                    <div className="flex flex-wrap gap-2">
                      <Badge>{question.category}</Badge>
                      <SeverityBadge severity={question.severity} />
                    </div>
                    <p className="mt-3 text-sm font-medium leading-6 text-zinc-200">
                      {question.question}
                    </p>
                    <p className="mt-2 text-xs leading-5 text-zinc-500">
                      {question.rationale}
                    </p>
                  </div>
                ))}
              </div>
            </SectionPanel>
          </div>
        </div>
      ) : canAnalyze ? (
        <SectionPanel title="Analysis results">
          <EmptyState message="Run analysis to populate document relevance, risks, gaps, dependencies, and clarification questions." />
        </SectionPanel>
      ) : null}
    </div>
  );
}

function ClarificationWorkflow({
  questions,
  expandedQuestionId,
  onExpand,
  onAnswerChange
}: {
  questions: ClarificationAnswer[];
  expandedQuestionId: string;
  onExpand: (id: string) => void;
  onAnswerChange: (id: string, answer: string) => void;
}) {
  return (
    <SectionPanel
      title="Clarification workflow"
      description="Resolve ambiguity through structured human-in-the-loop refinement. Each question remains tied to the context that informed it."
    >
      {questions.length === 0 ? (
        <EmptyState message="Run analysis first to populate clarification questions." />
      ) : (
      <div className="space-y-3">
        {questions.map((question, index) => {
          const questionId = String(question.id);
          const isExpanded = expandedQuestionId === questionId;

          return (
            <article
              key={question.id}
              className="rounded-lg border border-line bg-[#101014] p-4"
            >
              <button
                type="button"
                onClick={() => onExpand(isExpanded ? "" : questionId)}
                className="flex w-full items-start justify-between gap-4 text-left"
              >
                <span>
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs text-blue-300">
                      Q{index + 1}
                    </span>
                    <Badge>{question.category}</Badge>
                    <SeverityBadge severity={question.severity} />
                    {question.documentId ? (
                      <Badge icon={FileText}>Document #{question.documentId}</Badge>
                    ) : null}
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
                        onAnswerChange(questionId, event.target.value)
                      }
                      rows={4}
                      className="mt-2 w-full resize-none rounded-md border border-line bg-[#09090b] px-3 py-3 text-sm leading-6 text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-blue-500/60"
                      placeholder="Add an answer or decision for this clarification..."
                    />
                  </label>

                  <div className="mt-3 rounded-lg border border-blue-500/20 bg-blue-500/10 p-3">
                    <p className="text-xs font-medium uppercase tracking-[0.14em] text-blue-200">
                      Rationale
                    </p>
                    <p className="mt-2 text-sm leading-6 text-zinc-300">
                      {question.rationale}
                    </p>
                  </div>

                  <details className="mt-3 rounded-lg border border-line bg-surface p-3">
                    <summary className="cursor-pointer text-sm font-medium text-zinc-300">
                      Related systems
                    </summary>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {question.relatedSystems?.length ? (
                        question.relatedSystems.map((system) => (
                          <Badge key={system}>
                            {system}
                          </Badge>
                        ))
                      ) : (
                        <Badge>No related systems supplied</Badge>
                      )}
                      {question.documentId ? (
                        <Badge icon={FileText}>
                          Source document #{question.documentId}
                        </Badge>
                      ) : null}
                    </div>
                  </details>
                </div>
              ) : null}
            </article>
          );
        })}
      </div>
      )}
    </SectionPanel>
  );
}

function GenerateOutputs({
  selectedSourcesCount,
  processedDocumentCount,
  answeredCount,
  totalQuestions,
  selectedOutputIds,
  onToggleOutput
}: {
  selectedSourcesCount: number;
  processedDocumentCount: number;
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
              value={Math.min(95, 35 + processedDocumentCount * 15 + answeredCount * 10)}
              tone={totalQuestions > 0 && answeredCount === totalQuestions ? "green" : "amber"}
              helper="PRD generation is intentionally disabled in v0 while analysis and clarification workflows are validated."
            />
            <div className="grid gap-2">
              <Badge icon={Library}>{selectedSourcesCount} context sources used</Badge>
              <Badge icon={FileText}>
                {processedDocumentCount} processed document{processedDocumentCount === 1 ? "" : "s"}
              </Badge>
              <Badge icon={CheckCircle2}>
                {answeredCount}/{totalQuestions} clarifications complete
              </Badge>
              <Badge icon={Shield}>Governance checks available in analysis</Badge>
              <Badge icon={AlertTriangle}>Output generation coming later</Badge>
            </div>
          </div>
        </SectionPanel>
      </div>

      <SectionPanel
        title="Output types"
        description="These artifacts are planned for the next backend slice. They are shown here for workflow continuity only."
      >
        <div className="mb-4 rounded-lg border border-amber-400/20 bg-amber-400/10 p-3 text-sm leading-6 text-amber-100">
          PRD and artifact generation is not implemented in v0.
        </div>
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
