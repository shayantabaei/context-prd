import { describe, expect, it } from "vitest";
import { generatePrdMarkdown } from "@/lib/prd/markdown";
import { replacePrdSection } from "@/lib/prd/refinement";
import { generatedPrdFixture } from "../utils/fixtures";

describe("replacePrdSection", () => {
  it("updates only the targeted section and preserves unrelated sections", () => {
    const refinedSection = {
      ...generatedPrdFixture.sections[1],
      content:
        "- Enforce billing role capability checks in the Billing Service.\n- Add rollout-specific monitoring.",
      sourceReferences: generatedPrdFixture.sections[1].sourceReferences
    };

    const refinedPrd = replacePrdSection(generatedPrdFixture, refinedSection);

    expect(refinedPrd.sections).toHaveLength(generatedPrdFixture.sections.length);
    expect(refinedPrd.sections[0]).toBe(generatedPrdFixture.sections[0]);
    expect(refinedPrd.sections[1]).toEqual(refinedSection);
    expect(refinedPrd.sections[1].sourceReferences).toEqual(
      generatedPrdFixture.sections[1].sourceReferences
    );
  });

  it("keeps exports tied to the latest refined content", () => {
    const refinedPrd = replacePrdSection(generatedPrdFixture, {
      ...generatedPrdFixture.sections[0],
      content: "Refined executive summary with implementation-specific scope."
    });

    const markdown = generatePrdMarkdown(refinedPrd);

    expect(markdown).toContain(
      "Refined executive summary with implementation-specific scope."
    );
    expect(markdown).not.toContain("Initial executive summary.");
  });
});
