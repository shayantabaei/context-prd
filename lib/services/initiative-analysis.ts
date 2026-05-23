import { analyzeInitiativeWithAi } from "@/lib/ai/openai-service";
import type { InitiativeAnalysis } from "@/lib/types/initiative";
import {
  getDocumentsForInitiative,
  getInitiative,
  saveInitiativeAnalysis
} from "./initiative-store";

export async function analyzeInitiative(
  initiativeId: number
): Promise<InitiativeAnalysis> {
  const initiative = getInitiative(initiativeId);

  if (!initiative) {
    throw new Error("INITIATIVE_NOT_FOUND");
  }

  const documents = getDocumentsForInitiative(initiativeId);

  const analysis = await analyzeInitiativeWithAi(initiative, documents);

  return saveInitiativeAnalysis(analysis);
}
