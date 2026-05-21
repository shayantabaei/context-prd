import {
  Blocks,
  Library,
  Search,
  Sparkles
} from "lucide-react";

const steps = [
  {
    title: "Connect",
    detail: "Securely sync your internal knowledge sources.",
    icon: Blocks
  },
  {
    title: "Scope",
    detail: "Define high-level goals and technical requirements.",
    icon: Library
  },
  {
    title: "Select Context",
    detail: "Pick specific docs or initiatives to ground the AI.",
    icon: Search
  },
  {
    title: "Generate",
    detail: "Review a comprehensive, engineering-ready PRD.",
    icon: Sparkles
  }
];

export function WorkflowSteps() {
  return (
    <section
      id="workflow"
      className="border-b border-line px-5 py-24 sm:px-8 lg:px-10"
    >
      <div className="mx-auto max-w-7xl">
        <h2 className="mx-auto max-w-5xl text-center text-3xl font-semibold leading-tight tracking-[-0.02em] text-zinc-50 sm:text-4xl lg:text-5xl">
          From company context to delivery-ready PRDs
        </h2>

        <div className="mt-[4.5rem] grid gap-14 md:grid-cols-2 lg:grid-cols-4 lg:gap-10">
          {steps.map(({ title, detail, icon: Icon }, index) => (
            <div key={title} className="flex flex-col items-center text-center">
              <div className="grid h-16 w-16 place-items-center rounded-full bg-blue-500">
                <Icon className="h-7 w-7 text-white" strokeWidth={1.8} />
              </div>
              <h3 className="mt-6 text-lg font-semibold tracking-[-0.01em] text-zinc-50">
                {index + 1}. {title}
              </h3>
              <p className="mt-3 max-w-64 text-sm leading-6 text-zinc-400">
                {detail}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
