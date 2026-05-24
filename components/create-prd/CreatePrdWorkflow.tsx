"use client";

import { useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Brain,
  CheckCircle2,
  ChevronDown,
  Download,
  FileText,
  LockKeyhole,
  Loader2,
  PencilLine,
  Save,
  Shield,
  Sparkles,
  UploadCloud,
  XCircle
} from "lucide-react";
import {
  analyzeInitiativeRequest,
  createInitiativeRequest,
  generatePrdRequest,
  refinePrdSectionRequest,
  updateInitiativeRequest,
  uploadContextDocumentsRequest
} from "@/lib/client/create-prd-api";
import { downloadPrdMarkdown, downloadPrdPdf } from "@/lib/prd/export";
import type {
  AnalysisFinding,
  ClarificationQuestion as ApiClarificationQuestion,
  ContextDocument,
  CreateInitiativeRequest,
  DocumentAnalysis,
  GeneratedPrd,
  Initiative,
  InitiativeAnalysis,
  IrrelevantContext,
  PrdSection,
  SourceReference
} from "@/lib/types/initiative";
import {
  BulletInput,
  GovernanceCallout,
  GuidancePanel,
  MetricEntries,
  TextAreaField,
  TextField,
  type MetricEntry
} from "./InitiativeDefinitionFields";
import {
  initialSelectedContext,
  workflowSteps,
  type SelectedContext
} from "./workflow-data";
import {
  Badge,
  ContextPill,
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
};

type ClarificationAnswer = ApiClarificationQuestion & {
  answer: string;
};

type AsyncState = {
  loading: boolean;
  success?: string;
  error?: string;
};

type ExportState = {
  pdfLoading: boolean;
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
    dependencies: []
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
  const [generatedPrd, setGeneratedPrd] = useState<GeneratedPrd | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [saveState, setSaveState] = useState<AsyncState>({ loading: false });
  const [uploadState, setUploadState] = useState<AsyncState>({ loading: false });
  const [analysisState, setAnalysisState] = useState<AsyncState>({
    loading: false
  });
  const [generationState, setGenerationState] = useState<AsyncState>({
    loading: false
  });
  const [selectedContext, setSelectedContext] = useState<SelectedContext[]>(
    initialSelectedContext
  );
  const [questions, setQuestions] = useState<ClarificationAnswer[]>([]);
  const [expandedQuestionId, setExpandedQuestionId] = useState<string>("");

  const currentStep = workflowSteps[stepIndex];
  const answeredCount = questions.filter((question) => question.answer.trim()).length;
  const processedDocumentCount = documents.filter(
    (document) => document.processingStatus === "processed"
  ).length;
  const contextUsage = Math.min(
    92,
    20 + selectedContext.length * 5 + processedDocumentCount * 12
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
      setGeneratedPrd(null);
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
      setGeneratedPrd(null);
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

  async function generatePrdFromWorkflow() {
    if (!initiative || !analysis) {
      setGenerationState({
        loading: false,
        error: "Run analysis before generating a PRD."
      });
      return;
    }

    setGenerationState({ loading: true });

    try {
      const prd = await generatePrdRequest(
        initiative.id,
        questions.map((question) => ({
          questionId: question.id,
          answer: question.answer
        }))
      );

      setGeneratedPrd(prd);
      setGenerationState({
        loading: false,
        success: "PRD generated"
      });
    } catch (error) {
      setGenerationState({
        loading: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to generate PRD"
      });
    }
  }

  async function refineGeneratedPrdSection(
    sectionId: string,
    instruction: string
  ): Promise<PrdSection> {
    if (!initiative || !generatedPrd) {
      throw new Error("Generate a PRD before refining sections.");
    }

    const refinedSection = await refinePrdSectionRequest({
      initiativeId: initiative.id,
      prd: generatedPrd,
      sectionId,
      instruction,
      clarificationAnswers: questions.map((question) => ({
        questionId: question.id,
        answer: question.answer
      }))
    });

    setGeneratedPrd((currentPrd) =>
      currentPrd
        ? {
            ...currentPrd,
            sections: currentPrd.sections.map((section) =>
              section.id === refinedSection.id ? refinedSection : section
            )
          }
        : currentPrd
    );

    return refinedSection;
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

    if (currentStep.id === "clarify" && !analysis) {
      setAnalysisState({
        loading: false,
        error: "Run analysis before moving to output generation."
      });
      return;
    }

    setStepIndex((index) => Math.min(index + 1, workflowSteps.length - 1));
  }

  function previousStep() {
    setStepIndex((index) => Math.max(index - 1, 0));
  }

  function removeContext(id: string) {
    setSelectedContext((items) => items.filter((item) => item.id !== id));
  }

  function updateAnswer(id: string, answer: string) {
    setQuestions((items) =>
      items.map((item) => (String(item.id) === id ? { ...item, answer } : item))
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
            selectedContext={selectedContext}
            documents={documents}
            selectedFiles={selectedFiles}
            uploadState={uploadState}
            contextUsage={contextUsage}
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
            processedDocumentCount={processedDocumentCount}
            answeredCount={answeredCount}
            totalQuestions={questions.length}
            canGenerate={Boolean(initiative && analysis)}
            generatedPrd={generatedPrd}
            generationState={generationState}
            onGeneratePrd={generatePrdFromWorkflow}
            onRefineSection={refineGeneratedPrdSection}
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
              disabled={
                saveState.loading ||
                uploadState.loading ||
                analysisState.loading ||
                generationState.loading
              }
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
              PRD Workflow
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

      <GuidancePanel icon={Brain} title="AI readiness guidance">
        Structured initiative definitions improve requirement analysis and
        context relevance scoring. More explicit scope, constraints, and success
        criteria help ContextPRD rank enterprise context more accurately before
        generation.
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

function getRelevancyPercentage(score: number): number {
  return Math.max(0, Math.min(100, Math.round(score * 100)));
}

function formatRelevancyScore(score: number): string {
  return `${getRelevancyPercentage(score)}%`;
}

function DocumentAnalysisCard({ document }: { document: DocumentAnalysis }) {
  const relevancyPercentage = getRelevancyPercentage(document.relevancyScore);

  return (
    <article className="rounded-lg border border-line bg-[#101014] p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-zinc-100" title={document.filename}>
            {document.filename}
          </h3>
          <p className="mt-2 text-sm leading-6 text-zinc-500">
            {document.summary}
          </p>
        </div>
        <span className="shrink-0 whitespace-nowrap rounded-md border border-blue-500/20 bg-blue-500/10 px-2.5 py-1 text-xs font-medium text-blue-200">
          {formatRelevancyScore(document.relevancyScore)} relevant
        </span>
      </div>
      <div className="mt-4 h-1.5 rounded-full bg-zinc-800">
        <div
          className="h-1.5 rounded-full bg-blue-400"
          style={{ width: `${relevancyPercentage}%` }}
        />
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

function GeneratedPrdPreview({
  prd,
  onRefineSection
}: {
  prd: GeneratedPrd;
  onRefineSection: (sectionId: string, instruction: string) => Promise<PrdSection>;
}) {
  const [exportState, setExportState] = useState<ExportState>({
    pdfLoading: false
  });

  function downloadMarkdown() {
    setExportState({ pdfLoading: false });
    downloadPrdMarkdown(prd);
  }

  async function downloadPdf() {
    setExportState({ pdfLoading: true });

    try {
      await downloadPrdPdf(prd);
      setExportState({ pdfLoading: false });
    } catch (error) {
      setExportState({
        pdfLoading: false,
        error:
          error instanceof Error ? error.message : "Unable to export PDF"
      });
    }
  }

  return (
    <section className="overflow-hidden rounded-xl border border-line bg-[#0f0f12]">
      <div className="flex flex-col gap-4 border-b border-white/10 px-6 py-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-blue-300">
            Generated PRD
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-zinc-50">
            {prd.title}
          </h2>
          <p className="mt-2 text-xs text-zinc-500">
            Generated {new Date(prd.generatedAt).toLocaleString()}
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={downloadMarkdown}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-zinc-700 bg-zinc-900/50 px-3 text-xs font-medium text-zinc-300 transition hover:border-zinc-500 hover:text-white"
          >
            <Download className="h-3.5 w-3.5" strokeWidth={1.8} />
            Download Markdown
          </button>
          <button
            type="button"
            onClick={downloadPdf}
            disabled={exportState.pdfLoading}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-zinc-700 bg-zinc-900/50 px-3 text-xs font-medium text-zinc-300 transition hover:border-zinc-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {exportState.pdfLoading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={1.8} />
            ) : (
              <Download className="h-3.5 w-3.5" strokeWidth={1.8} />
            )}
            Download PDF
          </button>
        </div>
      </div>
      {exportState.error ? (
        <div className="border-b border-red-400/20 bg-red-400/10 px-6 py-3 text-sm leading-6 text-red-200">
          {exportState.error}
        </div>
      ) : null}
      <div className="px-6 py-6">
        <p className="max-w-3xl text-base leading-7 text-zinc-300">
          {prd.summary}
        </p>
        <div className="mt-8 divide-y divide-white/10">
          {prd.sections.map((section) => (
            <PrdDocumentSection
              key={section.id}
              section={section}
              onRefineSection={onRefineSection}
            />
          ))}
        </div>
        <div className="mt-8 border-t border-white/10 pt-6">
          <h3 className="text-lg font-semibold tracking-[-0.01em] text-zinc-50">
            Open Questions
          </h3>
          {prd.openQuestions.length > 0 ? (
            <ul className="mt-4 space-y-2 text-sm leading-6 text-zinc-400">
              {prd.openQuestions.map((question) => (
                <li key={question} className="pl-3">
                  <span className="mr-2 text-amber-300">-</span>
                  {question}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm leading-6 text-zinc-500">
              No open questions returned.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

function PrdDocumentSection({
  section,
  onRefineSection
}: {
  section: PrdSection;
  onRefineSection: (sectionId: string, instruction: string) => Promise<PrdSection>;
}) {
  const [isRefining, setIsRefining] = useState(false);
  const [instruction, setInstruction] = useState("");
  const [refinementState, setRefinementState] = useState<AsyncState>({
    loading: false
  });

  async function applyRefinement() {
    const trimmedInstruction = instruction.trim();

    if (!trimmedInstruction) {
      setRefinementState({
        loading: false,
        error: "Add refinement instructions before applying."
      });
      return;
    }

    setRefinementState({ loading: true });

    try {
      await onRefineSection(section.id, trimmedInstruction);
      setInstruction("");
      setIsRefining(false);
      setRefinementState({
        loading: false,
        success: "Section refined"
      });
    } catch (error) {
      setRefinementState({
        loading: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to refine section"
      });
    }
  }

  return (
    <section className="py-6 first:pt-0 last:pb-0">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <h3 className="text-lg font-semibold tracking-[-0.01em] text-zinc-50">
          {section.title}
        </h3>
        <button
          type="button"
          onClick={() => {
            setIsRefining((value) => !value);
            setRefinementState({ loading: false });
          }}
          className="inline-flex h-8 items-center justify-center gap-2 self-start rounded-md border border-zinc-700 bg-zinc-900/40 px-2.5 text-xs font-medium text-zinc-400 transition hover:border-zinc-500 hover:text-white"
        >
          <PencilLine className="h-3.5 w-3.5" strokeWidth={1.8} />
          Refine
        </button>
      </div>
      <p className="mt-3 whitespace-pre-line text-sm leading-7 text-zinc-300">
        {section.content}
      </p>
      {isRefining ? (
        <div className="mt-4 rounded-lg border border-line bg-[#101014] p-3">
          <label
            htmlFor={`refine-${section.id}`}
            className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-500"
          >
            Refinement instructions
          </label>
          <textarea
            id={`refine-${section.id}`}
            value={instruction}
            rows={3}
            onChange={(event) => setInstruction(event.target.value)}
            placeholder="Tell ContextPRD how to improve this section..."
            className="mt-2 w-full resize-none rounded-md border border-line bg-[#09090b] px-3 py-2 text-sm leading-6 text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-blue-500/60"
          />
          {refinementState.error ? (
            <p className="mt-2 text-xs leading-5 text-red-200">
              {refinementState.error}
            </p>
          ) : null}
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={applyRefinement}
              disabled={refinementState.loading}
              className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-primary px-3 text-xs font-medium text-white transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {refinementState.loading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={1.8} />
              ) : (
                <Sparkles className="h-3.5 w-3.5" strokeWidth={1.8} />
              )}
              Apply Refinement
            </button>
            <button
              type="button"
              onClick={() => {
                setInstruction("");
                setIsRefining(false);
                setRefinementState({ loading: false });
              }}
              disabled={refinementState.loading}
              className="inline-flex h-9 items-center justify-center rounded-md border border-zinc-700 bg-zinc-900/40 px-3 text-xs font-medium text-zinc-400 transition hover:border-zinc-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}
      {refinementState.success && !isRefining ? (
        <p className="mt-3 text-xs leading-5 text-emerald-300">
          {refinementState.success}
        </p>
      ) : null}
      <details className="mt-4">
        <summary className="cursor-pointer text-xs font-medium uppercase tracking-[0.14em] text-zinc-600 transition hover:text-zinc-400">
          Source references
        </summary>
        <div className="mt-3 flex flex-wrap gap-2">
          {section.sourceReferences.length > 0 ? (
            section.sourceReferences.map((reference) => (
              <SourceReferenceBadge
                key={`${section.id}-${reference.label}-${reference.documentId ?? ""}-${reference.clarificationQuestionId ?? ""}`}
                reference={reference}
              />
            ))
          ) : (
            <Badge>No source references</Badge>
          )}
        </div>
      </details>
    </section>
  );
}

function SourceReferenceBadge({ reference }: { reference: SourceReference }) {
  const label = normalizeSourceReferenceLabel(reference);
  const detail = reference.documentId
    ? `Document #${reference.documentId}`
    : reference.clarificationQuestionId
      ? `Clarification #${reference.clarificationQuestionId}`
      : "Initiative";

  return (
    <Badge icon={FileText}>
      {label} · {detail}
    </Badge>
  );
}

function normalizeSourceReferenceLabel(reference: SourceReference): string {
  if (/^(Initiative Definition|Document:|Clarification Answer:|Analysis Finding:)/i.test(reference.label)) {
    return reference.label;
  }

  if (reference.documentId || reference.filename) {
    return `Document: ${reference.filename ?? reference.label}`;
  }

  if (reference.clarificationQuestionId) {
    return `Clarification Answer: ${reference.label}`;
  }

  return reference.label.toLowerCase() === "initiative definition"
    ? "Initiative Definition"
    : reference.label;
}

function ContextSources({
  initiative,
  selectedContext,
  documents,
  selectedFiles,
  uploadState,
  contextUsage,
  onRemoveContext,
  onFilesChange,
  onUpload
}: {
  initiative: Initiative | null;
  selectedContext: SelectedContext[];
  documents: ContextDocument[];
  selectedFiles: File[];
  uploadState: AsyncState;
  contextUsage: number;
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
          title="Context Sources"
          description="Upload the source material that should ground analysis and PRD generation."
        >
          <div className="mb-4 rounded-lg border border-blue-500/20 bg-blue-500/10 p-4">
            <div className="flex items-start gap-3">
              <UploadCloud className="mt-0.5 h-5 w-5 shrink-0 text-blue-300" strokeWidth={1.8} />
              <div>
                <p className="text-sm font-semibold text-zinc-100">
                  Uploaded Documents
                </p>
                <p className="mt-2 text-sm leading-6 text-zinc-400">
                  This is the active v0 ingestion path. Upload RFCs, specs,
                  architecture notes, compliance reviews, or meeting notes to
                  ground the analysis.
                </p>
              </div>
            </div>
          </div>
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

        <SectionPanel
          title="Future integrations"
          description="Not connected in this prototype. These are examples of where uploaded context could come from later."
        >
          <div className="flex flex-wrap gap-2">
            {["Confluence", "Jira", "Google Drive"].map((source) => (
              <span
                key={source}
                className="rounded-md border border-line bg-[#101014] px-2.5 py-1 text-xs font-medium text-zinc-500"
              >
                {source}
              </span>
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
              title="Gaps and risks"
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
          <EmptyState message="Run analysis to populate document relevance, risks, gaps, and clarification questions." />
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
                      Referenced context
                    </summary>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {question.documentId ? (
                        <Badge icon={FileText}>
                          Source document #{question.documentId}
                        </Badge>
                      ) : (
                        <Badge>Initiative definition</Badge>
                      )}
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
  processedDocumentCount,
  answeredCount,
  totalQuestions,
  canGenerate,
  generatedPrd,
  generationState,
  onGeneratePrd,
  onRefineSection
}: {
  processedDocumentCount: number;
  answeredCount: number;
  totalQuestions: number;
  canGenerate: boolean;
  generatedPrd: GeneratedPrd | null;
  generationState: AsyncState;
  onGeneratePrd: () => void;
  onRefineSection: (sectionId: string, instruction: string) => Promise<PrdSection>;
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
              helper="Readiness reflects processed context, analysis signals, and clarification coverage before PRD generation."
            />
            <div className="grid gap-2">
              <Badge icon={FileText}>
                {processedDocumentCount} processed document{processedDocumentCount === 1 ? "" : "s"}
              </Badge>
              <Badge icon={CheckCircle2}>
                {answeredCount}/{totalQuestions} clarifications complete
              </Badge>
              <Badge icon={Shield}>Governance checks available in analysis</Badge>
              <Badge icon={AlertTriangle}>
                {generatedPrd ? "PRD generated" : "PRD generation ready"}
              </Badge>
            </div>
          </div>
        </SectionPanel>

        <SectionPanel title="Generate PRD">
          <WorkflowNotice state={generationState} />
          <p className="mt-3 text-sm leading-6 text-zinc-500">
            Generate a structured PRD from the saved initiative, uploaded context,
            analysis findings, and local clarification answers.
          </p>
          <button
            type="button"
            onClick={onGeneratePrd}
            disabled={!canGenerate || generationState.loading}
            className="mt-4 inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-white transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {generationState.loading ? (
              <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.8} />
            ) : (
              <Sparkles className="h-4 w-4" strokeWidth={1.8} />
            )}
            Generate PRD
          </button>
          {!canGenerate ? (
            <p className="mt-3 text-xs leading-5 text-amber-300">
              Run analysis before generating a PRD.
            </p>
          ) : null}
        </SectionPanel>
      </div>

      <div className="space-y-5">
        <SectionPanel
          title="Generated PRD"
          description="Review, refine, and export the generated engineering requirements document."
        >
          {generatedPrd ? (
            <p className="text-sm leading-6 text-zinc-500">
              The generated artifact appears below as a cohesive PRD with
              lightweight source traceability.
            </p>
          ) : (
            <EmptyState message="Generate a PRD to view the document, source references, open questions, and export actions here." />
          )}
        </SectionPanel>

        {generatedPrd ? (
          <GeneratedPrdPreview
            prd={generatedPrd}
            onRefineSection={onRefineSection}
          />
        ) : null}
      </div>
    </div>
  );
}
