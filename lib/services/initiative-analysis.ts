import { analyzeInitiativeWithAi } from "@/lib/ai/openai-service";
import type { InitiativeAnalysis } from "@/lib/types/initiative";
import {
  getDocumentsForInitiative,
  getInitiative,
  saveInitiativeAnalysis
} from "./initiative-store";

export async function analyzeInitiative(
  userId: string,
  initiativeId: string
): Promise<InitiativeAnalysis> {
  const initiative = await getInitiative(userId, initiativeId);

  if (!initiative) {
    throw new Error("INITIATIVE_NOT_FOUND");
  }

  const documents = await getDocumentsForInitiative(userId, initiativeId);

  const analysis = await analyzeInitiativeWithAi(initiative, documents);

  return saveInitiativeAnalysis(userId, analysis);
}
