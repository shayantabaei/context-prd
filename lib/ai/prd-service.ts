import OpenAI from "openai";
import { getDefaultOpenAiModel, hasOpenAiApiKey } from "@/lib/ai/model-config";
import { createMockGeneratedPrd, createMockRefinedPrdSection } from "@/lib/ai/mock-prd";
import {
  buildPrdGenerationPrompt,
  buildPrdSectionRefinementPrompt
} from "@/lib/ai/prd-prompt";
import type {
  ClarificationAnswer,
  ContextDocument,
  GeneratedPrd,
  Initiative,
  InitiativeAnalysis,
  PrdSection
} from "@/lib/types/initiative";
import { generatedPrdSchema, prdSectionSchema } from "@/lib/validation/initiative";

const requiredPrdSections = [
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
] as const;

const systemPrompt = [
  "You produce strict JSON only.",
  "You are a senior product and engineering requirements writer.",
  "Your PRDs are implementation-ready, concise, traceable, and honest about unresolved gaps."
].join(" ");

function parseJsonObject(content: string): unknown {
  try {
    return JSON.parse(content);
  } catch {
    const start = content.indexOf("{");
    const end = content.lastIndexOf("}");

    if (start >= 0 && end > start) {
      return JSON.parse(content.slice(start, end + 1));
    }

    throw new Error("OpenAI returned invalid PRD JSON");
  }
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function stringifyGeneratedContent(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === "string") {
          return `- ${item}`;
        }

        if (typeof item === "object" && item !== null) {
          const record = item as Record<string, unknown>;
          const title = record.title ?? record.requirement ?? record.risk ?? record.name;
          const description =
            record.description ?? record.content ?? record.mitigation ?? record.details;

          if (title && description) {
            return `- ${String(title)}: ${String(description)}`;
          }

          if (title) {
            return `- ${String(title)}`;
          }
        }

        return `- ${JSON.stringify(item)}`;
      })
      .join("\n");
  }

  if (typeof value === "object" && value !== null) {
    return Object.entries(value as Record<string, unknown>)
      .map(([key, item]) => `- ${key}: ${String(item)}`)
      .join("\n");
  }

  return "";
}

function normalizeSourceReferences(value: unknown) {
  if (!Array.isArray(value)) {
    return [{ label: "Initiative Definition" }];
  }

  return value
    .map((reference) => {
      if (typeof reference === "string") {
        return { label: reference };
      }

      if (typeof reference === "object" && reference !== null) {
        const record = reference as Record<string, unknown>;

        return {
          ...record,
          label: typeof record.label === "string" ? record.label : "Initiative Definition"
        };
      }

      return null;
    })
    .filter(Boolean);
}

function normalizePrdSections(
  parsedObject: Record<string, unknown>
): Record<string, unknown> {
  const sections = Array.isArray(parsedObject.sections)
    ? parsedObject.sections
    : [];

  const normalizedSections = requiredPrdSections.map((title) => {
    const existingSection = sections.find((section) => {
      if (typeof section !== "object" || section === null || !("title" in section)) {
        return false;
      }

      return String(section.title).toLowerCase() === title.toLowerCase();
    });

    if (
      typeof existingSection === "object" &&
      existingSection !== null
    ) {
      const section = existingSection as Record<string, unknown>;

      return {
        ...section,
        id: typeof section.id === "string" ? section.id : slugify(title),
        title,
        content: stringifyGeneratedContent(section.content),
        sourceReferences: normalizeSourceReferences(section.sourceReferences)
      };
    }

    return {
      id: slugify(title),
      title,
      content:
        title === "Open Questions"
          ? "See the open questions list for unresolved implementation decisions."
          : `No explicit ${title.toLowerCase()} content was returned. Review source context before implementation.`,
      sourceReferences: [{ label: "Initiative definition" }]
    };
  });

  return {
    ...parsedObject,
    sections: normalizedSections
  };
}

export async function generatePrdWithAi({
  initiative,
  documents,
  analysis,
  clarificationAnswers
}: {
  initiative: Initiative;
  documents: ContextDocument[];
  analysis?: InitiativeAnalysis;
  clarificationAnswers: ClarificationAnswer[];
}): Promise<GeneratedPrd> {
  if (!hasOpenAiApiKey()) {
    console.info("[ContextPRD generate-prd] using mock PRD fallback", {
      reason: "OPENAI_API_KEY is not configured",
      initiativeId: initiative.id,
      documentCount: documents.length,
      clarificationAnswerCount: clarificationAnswers.length
    });

    return generatedPrdSchema.parse(
      createMockGeneratedPrd({
        initiative,
        documents,
        analysis,
        clarificationAnswers
      })
    );
  }

  const model = getDefaultOpenAiModel();

  console.info("[ContextPRD generate-prd] calling OpenAI", {
    initiativeId: initiative.id,
    model,
    documentCount: documents.length,
    hasAnalysis: Boolean(analysis),
    clarificationAnswerCount: clarificationAnswers.length
  });

  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });

  const response = await client.chat.completions.create({
    model,
    temperature: 0.2,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: systemPrompt
      },
      {
        role: "user",
        content: buildPrdGenerationPrompt({
          initiative,
          documents,
          analysis,
          clarificationAnswers
        })
      }
    ]
  });

  const content = response.choices[0]?.message.content;

  if (!content) {
    throw new Error("OpenAI returned an empty PRD response");
  }

  const parsed = parseJsonObject(content);
  const parsedObject =
    typeof parsed === "object" && parsed !== null
      ? (parsed as Record<string, unknown>)
      : {};

  const normalizedPrd = normalizePrdSections(parsedObject);

  const prd = generatedPrdSchema.parse({
    ...normalizedPrd,
    initiativeId: initiative.id,
    generatedAt:
      typeof normalizedPrd.generatedAt === "string"
        ? normalizedPrd.generatedAt
        : new Date().toISOString()
  });

  console.info("[ContextPRD generate-prd] PRD validated", {
    initiativeId: initiative.id,
    model,
    sectionCount: prd.sections.length,
    openQuestionCount: prd.openQuestions.length
  });

  return prd;
}

function normalizePrdSectionResponse({
  parsedObject,
  section,
  instruction
}: {
  parsedObject: Record<string, unknown>;
  section: PrdSection;
  instruction: string;
}): PrdSection {
  const rawSection =
    typeof parsedObject.section === "object" && parsedObject.section !== null
      ? (parsedObject.section as Record<string, unknown>)
      : parsedObject;
  const allowTitleChange = /title|heading|rename/i.test(instruction);
  const sourceReferences = normalizeSourceReferences(
    rawSection.sourceReferences
  );

  return prdSectionSchema.parse({
    id: section.id,
    title:
      allowTitleChange && typeof rawSection.title === "string"
        ? rawSection.title
        : section.title,
    content: stringifyGeneratedContent(rawSection.content),
    sourceReferences:
      sourceReferences.length > 0
        ? sourceReferences
        : section.sourceReferences
  });
}

export async function refinePrdSectionWithAi({
  initiative,
  documents,
  analysis,
  prd,
  section,
  instruction,
  clarificationAnswers
}: {
  initiative: Initiative;
  documents: ContextDocument[];
  analysis?: InitiativeAnalysis;
  prd: GeneratedPrd;
  section: PrdSection;
  instruction: string;
  clarificationAnswers: ClarificationAnswer[];
}): Promise<PrdSection> {
  if (!hasOpenAiApiKey()) {
    console.info("[ContextPRD refine-prd-section] using mock section fallback", {
      reason: "OPENAI_API_KEY is not configured",
      initiativeId: initiative.id,
      sectionId: section.id
    });

    return prdSectionSchema.parse(
      createMockRefinedPrdSection({
        section,
        instruction,
        clarificationAnswers
      })
    );
  }

  const model = getDefaultOpenAiModel();

  console.info("[ContextPRD refine-prd-section] calling OpenAI", {
    initiativeId: initiative.id,
    model,
    sectionId: section.id,
    documentCount: documents.length,
    hasAnalysis: Boolean(analysis),
    clarificationAnswerCount: clarificationAnswers.length
  });

  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });

  const response = await client.chat.completions.create({
    model,
    temperature: 0.2,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: systemPrompt
      },
      {
        role: "user",
        content: buildPrdSectionRefinementPrompt({
          initiative,
          documents,
          analysis,
          prd,
          section,
          instruction,
          clarificationAnswers
        })
      }
    ]
  });

  const content = response.choices[0]?.message.content;

  if (!content) {
    throw new Error("OpenAI returned an empty PRD section response");
  }

  const parsed = parseJsonObject(content);
  const parsedObject =
    typeof parsed === "object" && parsed !== null
      ? (parsed as Record<string, unknown>)
      : {};
  const refinedSection = normalizePrdSectionResponse({
    parsedObject,
    section,
    instruction
  });

  console.info("[ContextPRD refine-prd-section] section validated", {
    initiativeId: initiative.id,
    sectionId: refinedSection.id
  });

  return refinedSection;
}
