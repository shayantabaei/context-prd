import { SectionHeader } from "./SectionHeader";

const prdSections = [
  {
    title: "Goals",
    copy: "Define measurable product and engineering outcomes tied to the initiative."
  },
  {
    title: "Functional requirements",
    copy: "Translate intake answers into traceable, testable user and system behavior."
  },
  {
    title: "Architecture considerations",
    copy: "Surface service boundaries, dependency impacts, observability, and rollout constraints."
  },
  {
    title: "Security considerations",
    copy: "Apply internal security review standards and identify privacy or permission risks."
  },
  {
    title: "Acceptance criteria",
    copy: "Create QA-ready criteria that match the organization's release workflow."
  },
  {
    title: "Open questions",
    copy: "Call out unresolved decisions instead of letting generic assumptions leak into the PRD."
  }
];

export function ProductPreview() {
  return (
    <section id="preview" className="border-b border-line px-5 py-24 sm:px-8 lg:px-10">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
        <SectionHeader
          align="left"
          eyebrow="Generated structure"
          title="A clean PRD draft with the sections teams expect"
          description="Each section is grounded in selected internal context, making the output easier to review, challenge, and move into execution."
        />
        <div className="rounded-xl border border-line bg-surface p-4 sm:p-5">
          <div className="mb-5 flex items-center justify-between border-b border-line pb-4">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.14em] text-zinc-500">
                Example PRD
              </p>
              <h3 className="mt-2 text-xl font-semibold tracking-[-0.01em]">
                Partner Permissions Expansion
              </h3>
            </div>
            <span className="hidden rounded-md border border-line bg-surface-raised px-3 py-1.5 text-xs text-zinc-300 sm:inline-flex">
              Ready for review
            </span>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {prdSections.map((section) => (
              <article
                key={section.title}
                className="rounded-lg border border-line bg-[#101014] p-4"
              >
                <h4 className="text-sm font-semibold text-zinc-100">
                  {section.title}
                </h4>
                <p className="mt-3 text-sm leading-6 text-zinc-400">
                  {section.copy}
                </p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
