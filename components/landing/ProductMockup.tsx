import {
  CheckCircle2,
  Database,
  FileText,
  Library,
  Shield,
  Workflow
} from "lucide-react";

const contextSources = [
  { label: "Architecture standards", icon: Database },
  { label: "SDLC release workflow", icon: Workflow },
  { label: "Security review template", icon: Shield },
  { label: "QA acceptance rubric", icon: CheckCircle2 }
];

const generatedSections = [
  { name: "Goals", status: "Grounded", icon: CheckCircle2 },
  { name: "Functional requirements", status: "Drafted", icon: FileText },
  { name: "Architecture considerations", status: "Mapped", icon: Database },
  { name: "Acceptance criteria", status: "Ready", icon: CheckCircle2 }
];

export function ProductMockup() {
  return (
    <div className="rounded-xl border border-line bg-surface shadow-blue-glow">
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <div>
          <p className="text-sm font-medium text-zinc-100">ContextPRD</p>
          <p className="text-xs text-zinc-500">Enterprise PRD generator</p>
        </div>
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
          <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
          <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
        </div>
      </div>
      <div className="grid min-h-[400px] lg:grid-cols-[240px_1fr]">
        <aside className="border-b border-line bg-[#0d0d10] p-4 lg:border-b-0 lg:border-r">
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">
            Selected context
          </p>
          <div className="space-y-2">
            {contextSources.map(({ label, icon: Icon }) => (
              <div
                key={label}
                className="flex items-center gap-2 rounded-md border border-line bg-surface-raised px-3 py-2 text-sm text-zinc-300"
              >
                <Icon className="h-4 w-4 shrink-0 text-zinc-500" strokeWidth={1.8} />
                {label}
              </div>
            ))}
          </div>
          <div className="mt-5 rounded-lg border border-blue-500/20 bg-blue-500/10 p-3">
            <p className="flex items-center gap-2 text-xs font-medium text-blue-200">
              <Library className="h-4 w-4" strokeWidth={1.8} />
              87 grounded references
            </p>
            <p className="mt-1 text-xs leading-5 text-zinc-400">
              Only user-selected sources and internal templates are used.
            </p>
          </div>
        </aside>
        <section className="p-4 sm:p-6">
          <div className="mb-5 flex flex-col gap-3 border-b border-line pb-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-blue-300">
                Generated draft
              </p>
              <h3 className="mt-2 text-xl font-semibold tracking-[-0.01em]">
                Billing Platform Usage Controls
              </h3>
            </div>
            <span className="w-fit rounded-md border border-line bg-surface-raised px-3 py-1.5 text-xs text-zinc-300">
              SDLC aligned
            </span>
          </div>
          <div className="space-y-3">
            {generatedSections.map((section) => (
              <div
                key={section.name}
                className="rounded-lg border border-line bg-[#101014] p-4"
              >
                <div className="flex items-center justify-between gap-4">
                  <p className="flex items-center gap-2 text-sm font-medium text-zinc-100">
                    <section.icon
                      className="h-4 w-4 shrink-0 text-zinc-500"
                      strokeWidth={1.8}
                    />
                    {section.name}
                  </p>
                  <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-blue-300">
                    {section.status}
                  </span>
                </div>
                <div className="mt-3 space-y-2">
                  <div className="h-2 rounded-full bg-zinc-800" />
                  <div className="h-2 w-5/6 rounded-full bg-zinc-800" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
