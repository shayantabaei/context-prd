import { refinePrdSectionWithAi } from "@/lib/ai/prd-service";
import type {
  ClarificationAnswer,
  GeneratedPrd,
  PrdSection
} from "@/lib/types/initiative";
import {
  getDocumentsForInitiative,
  getInitiative,
  getLatestGeneratedPrd,
  getLatestInitiativeAnalysis,
  updateLatestGeneratedPrdSection,
  upsertClarificationAnswers
} from "./initiative-store";

export async function refinePrdSection({
  userId,
  initiativeId,
  prd,
  sectionId,
  instruction,
  clarificationAnswers = []
}: {
  userId: string;
  initiativeId: string;
  prd: GeneratedPrd;
  sectionId: string;
  instruction: string;
  clarificationAnswers?: ClarificationAnswer[];
}): Promise<PrdSection> {
  await upsertClarificationAnswers(userId, initiativeId, clarificationAnswers);

  const initiative = await getInitiative(userId, initiativeId);

  if (!initiative) {
    throw new Error("INITIATIVE_NOT_FOUND");
  }

  const persistedPrd = (await getLatestGeneratedPrd(userId, initiativeId)) ?? prd;
  const section = persistedPrd.sections.find((item) => item.id === sectionId);

  if (!section) {
    throw new Error("PRD_SECTION_NOT_FOUND");
  }

  const documents = await getDocumentsForInitiative(userId, initiativeId);
  const analysis = await getLatestInitiativeAnalysis(userId, initiativeId);

  const refinedSection = await refinePrdSectionWithAi({
    initiative,
    documents,
    analysis,
    prd: persistedPrd,
    section,
    instruction,
    clarificationAnswers
  });

  await updateLatestGeneratedPrdSection({
    userId,
    initiativeId,
    section: refinedSection
  });

  return refinedSection;
}
