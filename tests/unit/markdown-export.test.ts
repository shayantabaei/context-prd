import { describe, expect, it } from "vitest";
import { generatePrdMarkdown } from "@/lib/prd/markdown";
import { replacePrdSection } from "@/lib/prd/refinement";
import { generatedPrdFixture } from "../utils/fixtures";

describe("generatePrdMarkdown", () => {
  it("renders a stable document with title, sections, sources, and open questions", () => {
    const markdown = generatePrdMarkdown(generatedPrdFixture);

    expect(markdown).toContain("# Partner Billing Permissions PRD");
    expect(markdown).toContain("## Summary");
    expect(markdown).toContain("## Functional Requirements");
    expect(markdown).toContain("- Enforce billing role capability checks.");
    expect(markdown).toContain("Sources:");
    expect(markdown).toContain("Document: billing_api_permissions_spec.md");
    expect(markdown).toContain("## Open Questions");
    expect(markdown).toContain("- What audit retention period is required?");
  });

  it("exports latest refined section content", () => {
    const refinedPrd = replacePrdSection(generatedPrdFixture, {
      id: "functional-requirements",
      title: "Functional Requirements",
      content:
        "- Enforce role checks in the Billing Service.\n- Emit audit events for every permission change.",
      sourceReferences: [
        {
          label: "Clarification Answer: Mandatory audit fields",
          clarificationQuestionId: "2"
        }
      ]
    });

    const markdown = generatePrdMarkdown(refinedPrd);

    expect(markdown).toContain("Emit audit events for every permission change");
    expect(markdown).toContain("Clarification Answer: Mandatory audit fields");
    expect(markdown).not.toContain("- Enforce billing role capability checks.");
  });
});
