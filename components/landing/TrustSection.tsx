import { CheckCircle2, Library, Shield, Users } from "lucide-react";
import { FeatureCard } from "./FeatureCard";
import { SectionHeader } from "./SectionHeader";

const trustItems = [
  {
    label: "Control",
    title: "User-selected context",
    description:
      "Generation starts from the sources your team chooses, so every draft is tied to intentional context.",
    icon: Library
  },
  {
    label: "Grounding",
    title: "No generic AI guessing",
    description:
      "Outputs are shaped by internal standards and templates, with unresolved assumptions captured as open questions.",
    icon: CheckCircle2
  },
  {
    label: "Alignment",
    title: "Enterprise workflow fit",
    description:
      "The structure supports engineering design review, security review, QA planning, and export-ready collaboration.",
    icon: Shield
  },
  {
    label: "Teams",
    title: "Built across delivery roles",
    description:
      "Product, engineering, architecture, security, and QA can work from one requirements foundation.",
    icon: Users
  }
];

export function TrustSection() {
  return (
    <section id="security" className="border-b border-line px-5 py-24 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <SectionHeader
          eyebrow="Trust and security"
          title="Serious AI workflows need controlled context"
          description="ContextPRD is designed for enterprise SDLC teams that need grounded outputs, audit-friendly review, and workflow alignment before anything reaches implementation."
        />
        <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {trustItems.map((item) => (
            <FeatureCard key={item.title} {...item} />
          ))}
        </div>
      </div>
    </section>
  );
}
