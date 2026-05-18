import { FeatureCard } from "./FeatureCard";
import { SectionHeader } from "./SectionHeader";

const values = [
  {
    label: "Problem",
    title: "Generic PRDs miss the engineering reality",
    description:
      "Most generated requirements ignore platform constraints, operational standards, review gates, and how teams actually ship software."
  },
  {
    label: "Context",
    title: "Company knowledge becomes the source of truth",
    description:
      "Teams choose the Confluence spaces, architecture standards, templates, and workflows that should shape the draft."
  },
  {
    label: "Outcome",
    title: "PRDs arrive ready for execution",
    description:
      "Generated sections include implementation constraints, security considerations, QA criteria, and open questions for review."
  }
];

export function ProblemValue() {
  return (
    <section className="border-b border-line px-5 py-24 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <SectionHeader
          eyebrow="Why it matters"
          title="PRDs should reflect how your engineering organization delivers"
          description="ContextPRD turns internal operating knowledge into structured requirements, replacing vague AI drafts with grounded product specs shaped by your company context."
        />
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {values.map((value) => (
            <FeatureCard key={value.title} {...value} />
          ))}
        </div>
      </div>
    </section>
  );
}
