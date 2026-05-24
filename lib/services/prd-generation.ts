import { generatePrdWithAi } from "@/lib/ai/prd-service";
import type { ClarificationAnswer, GeneratedPrd } from "@/lib/types/initiative";
import {
  getDocumentsForInitiative,
  getInitiative,
  getLatestInitiativeAnalysis,
  getClarificationAnswers,
  saveGeneratedPrd,
  upsertClarificationAnswers
} from "./initiative-store";

export async function generatePrd(
  userId: string,
  initiativeId: string,
  clarificationAnswers: ClarificationAnswer[]
): Promise<GeneratedPrd> {
  const initiative = await getInitiative(userId, initiativeId);

  if (!initiative) {
    throw new Error("INITIATIVE_NOT_FOUND");
  }

  await upsertClarificationAnswers(userId, initiativeId, clarificationAnswers);

  const documents = await getDocumentsForInitiative(userId, initiativeId);
  const analysis = await getLatestInitiativeAnalysis(userId, initiativeId);
  const persistedAnswers = await getClarificationAnswers(userId, initiativeId);
  const prd = await generatePrdWithAi({
    initiative,
    documents,
    analysis,
    clarificationAnswers: persistedAnswers
  });

  return saveGeneratedPrd(userId, prd);
}
