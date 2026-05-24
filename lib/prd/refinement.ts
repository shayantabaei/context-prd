import type { GeneratedPrd, PrdSection } from "@/lib/types/initiative";

export function replacePrdSection(
  prd: GeneratedPrd,
  refinedSection: PrdSection
): GeneratedPrd {
  return {
    ...prd,
    sections: prd.sections.map((section) =>
      section.id === refinedSection.id ? refinedSection : section
    )
  };
}
