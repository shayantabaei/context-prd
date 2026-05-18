import { SectionHeader } from "./SectionHeader";

const steps = [
  "Connect Confluence",
  "Select internal standards and templates",
  "Complete structured intake",
  "Generate an enterprise-ready PRD",
  "Review, edit, and export"
];

export function WorkflowSteps() {
  return (
    <section id="workflow" className="border-b border-line px-5 py-24 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <SectionHeader
          eyebrow="Workflow"
          title="From internal knowledge to review-ready PRD"
          description="A controlled flow keeps generation grounded in approved sources while preserving the judgment of product and engineering leads."
        />
        <div className="mt-12 grid gap-3 lg:grid-cols-5">
          {steps.map((step, index) => (
            <article
              key={step}
              className="relative rounded-lg border border-line bg-surface p-5"
            >
              <p className="font-mono text-xs text-blue-300">
                {String(index + 1).padStart(2, "0")}
              </p>
              <h3 className="mt-8 min-h-14 text-lg font-semibold leading-7 tracking-[-0.01em] text-zinc-50">
                {step}
              </h3>
              <div className="mt-6 h-1 rounded-full bg-zinc-800">
                <div
                  className="h-1 rounded-full bg-blue-500"
                  style={{ width: `${(index + 1) * 20}%` }}
                />
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
