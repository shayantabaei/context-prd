import OpenAI from "openai";
import { buildInitiativeAnalysisPrompt } from "@/lib/ai/analysis-prompt";
import { getDefaultOpenAiModel, hasOpenAiApiKey } from "@/lib/ai/model-config";
import { createMockInitiativeAnalysis } from "@/lib/ai/mock-analysis";
import type {
  ContextDocument,
  Initiative,
  InitiativeAnalysis
} from "@/lib/types/initiative";
import { initiativeAnalysisSchema } from "@/lib/validation/initiative";

const systemPrompt = [
  "You produce strict JSON only.",
  "You are a senior product-engineering analyst for enterprise SDLC workflows.",
  "Your analysis should be concise, implementation-oriented, and grounded in supplied initiative/context data."
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

    throw new Error("OpenAI returned invalid JSON");
  }
}

export async function analyzeInitiativeWithAi(
  initiative: Initiative,
  documents: ContextDocument[]
): Promise<InitiativeAnalysis> {
  if (!hasOpenAiApiKey()) {
    return initiativeAnalysisSchema.parse(
      createMockInitiativeAnalysis(initiative, documents)
    );
  }

  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });

  const response = await client.chat.completions.create({
    model: getDefaultOpenAiModel(),
    temperature: 0.2,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: systemPrompt
      },
      {
        role: "user",
        content: buildInitiativeAnalysisPrompt(initiative, documents)
      }
    ]
  });

  const content = response.choices[0]?.message.content;

  if (!content) {
    throw new Error("OpenAI returned an empty analysis response");
  }

  const parsed = parseJsonObject(content);
  const parsedObject =
    typeof parsed === "object" && parsed !== null
      ? (parsed as Record<string, unknown>)
      : {};

  return initiativeAnalysisSchema.parse({
    ...parsedObject,
    initiativeId: initiative.id,
    createdAt:
      typeof parsedObject.createdAt === "string"
        ? parsedObject.createdAt
        : new Date().toISOString()
  });
}
