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
  saveGeneratedPrd
} from "./initiative-store";

export async function refinePrdSection({
  initiativeId,
  prd,
  sectionId,
  instruction,
  clarificationAnswers = []
}: {
  initiativeId: number;
  prd: GeneratedPrd;
  sectionId: string;
  instruction: string;
  clarificationAnswers?: ClarificationAnswer[];
}): Promise<PrdSection> {
  const initiative = getInitiative(initiativeId);

  if (!initiative) {
    throw new Error("INITIATIVE_NOT_FOUND");
  }

  const persistedPrd = getLatestGeneratedPrd(initiativeId) ?? prd;
  const section = persistedPrd.sections.find((item) => item.id === sectionId);

  if (!section) {
    throw new Error("PRD_SECTION_NOT_FOUND");
  }

  const documents = getDocumentsForInitiative(initiativeId);
  const analysis = getLatestInitiativeAnalysis(initiativeId);

  const refinedSection = await refinePrdSectionWithAi({
    initiative,
    documents,
    analysis,
    prd: persistedPrd,
    section,
    instruction,
    clarificationAnswers
  });
  const updatedPrd: GeneratedPrd = {
    ...persistedPrd,
    sections: persistedPrd.sections.map((item) =>
      item.id === refinedSection.id ? refinedSection : item
    )
  };

  saveGeneratedPrd(updatedPrd);

  return refinedSection;
}
