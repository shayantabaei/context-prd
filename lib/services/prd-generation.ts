import { generatePrdWithAi } from "@/lib/ai/prd-service";
import type { ClarificationAnswer, GeneratedPrd } from "@/lib/types/initiative";
import {
  getDocumentsForInitiative,
  getInitiative,
  getLatestInitiativeAnalysis,
  saveGeneratedPrd
} from "./initiative-store";

export async function generatePrd(
  initiativeId: number,
  clarificationAnswers: ClarificationAnswer[]
): Promise<GeneratedPrd> {
  const initiative = getInitiative(initiativeId);

  if (!initiative) {
    throw new Error("INITIATIVE_NOT_FOUND");
  }

  const documents = getDocumentsForInitiative(initiativeId);
  const analysis = getLatestInitiativeAnalysis(initiativeId);
  const prd = await generatePrdWithAi({
    initiative,
    documents,
    analysis,
    clarificationAnswers
  });

  return saveGeneratedPrd(prd);
}
