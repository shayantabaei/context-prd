import type { LucideIcon } from "lucide-react";
import { CheckCircle2, X } from "lucide-react";
import type {
  ContextSource,
  Insight,
  OutputType,
  SelectedContext,
  WorkflowStep
} from "./workflow-data";

export function WorkflowProgress({
  steps,
  currentIndex
}: {
  steps: WorkflowStep[];
  currentIndex: number;
}) {
  return (
    <div className="rounded-xl border border-line bg-surface p-3">
      <ol className="grid gap-2 md:grid-cols-5">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = index === currentIndex;
          const isComplete = index < currentIndex;

          return (
            <li
              key={step.id}
              className={
                isActive
                  ? "rounded-lg border border-blue-500/30 bg-blue-500/10 p-3"
                  : "rounded-lg border border-transparent p-3"
              }
            >
              <div className="flex items-center gap-3 md:flex-col md:items-start">
                <span
                  className={
                    isActive || isComplete
                      ? "grid h-9 w-9 shrink-0 place-items-center rounded-md bg-blue-500 text-white"
                      : "grid h-9 w-9 shrink-0 place-items-center rounded-md border border-line bg-[#101014] text-zinc-500"
                  }
                >
                  {isComplete ? (
                    <CheckCircle2 className="h-4 w-4" strokeWidth={1.8} />
                  ) : (
                    <Icon className="h-4 w-4" strokeWidth={1.8} />
                  )}
                </span>
                <span>
                  <span
                    className={
                      isActive
                        ? "block text-sm font-semibold text-zinc-50"
                        : "block text-sm font-medium text-zinc-400"
                    }
                  >
                    {step.label}
                  </span>
                  <span className="mt-1 block text-xs text-zinc-600">
                    {step.description}
                  </span>
                </span>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export function SectionPanel({
  title,
  description,
  children
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-line bg-surface p-5">
      <div>
        <h2 className="text-lg font-semibold tracking-[-0.01em] text-zinc-50">
          {title}
        </h2>
        {description ? (
          <p className="mt-2 text-sm leading-6 text-zinc-500">{description}</p>
        ) : null}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export function StatusMeter({
  label,
  value,
  helper,
  tone = "blue"
}: {
  label: string;
  value: number;
  helper?: string;
  tone?: "blue" | "green" | "amber";
}) {
  const color =
    tone === "green"
      ? "bg-emerald-400"
      : tone === "amber"
        ? "bg-amber-400"
        : "bg-blue-400";

  return (
    <div className="rounded-lg border border-line bg-[#101014] p-4">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-medium text-zinc-200">{label}</p>
        <span className="font-mono text-xs text-zinc-500">{value}%</span>
      </div>
      <div className="mt-3 h-1.5 rounded-full bg-zinc-800">
        <div className={`h-1.5 rounded-full ${color}`} style={{ width: `${value}%` }} />
      </div>
      {helper ? <p className="mt-3 text-xs leading-5 text-zinc-500">{helper}</p> : null}
    </div>
  );
}

export function ContextSourceCard({
  source,
  selected,
  onToggle
}: {
  source: ContextSource;
  selected: boolean;
  onToggle: () => void;
}) {
  const Icon = source.icon;

  return (
    <button
      type="button"
      onClick={onToggle}
      className={
        selected
          ? "flex h-full flex-col rounded-lg border border-blue-500/35 bg-blue-500/10 p-4 text-left transition hover:border-blue-400/50"
          : "flex h-full flex-col rounded-lg border border-line bg-[#101014] p-4 text-left transition hover:border-white/16"
      }
      aria-pressed={selected}
    >
      <div className="flex items-start justify-between gap-4">
        <span className="grid h-10 w-10 place-items-center rounded-md border border-line bg-surface-raised">
          <Icon className="h-5 w-5 text-zinc-400" strokeWidth={1.8} />
        </span>
        <span
          className={
            selected
              ? "rounded-md bg-blue-500 px-2 py-1 text-xs font-medium text-white"
              : "rounded-md border border-line px-2 py-1 text-xs font-medium text-zinc-500"
          }
        >
          {selected ? "Selected" : source.status}
        </span>
      </div>
      <h3 className="mt-4 text-sm font-semibold text-zinc-100">{source.name}</h3>
      <p className="mt-2 text-sm leading-6 text-zinc-500">{source.description}</p>
    </button>
  );
}

export function ContextPill({
  item,
  onRemove
}: {
  item: SelectedContext;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-line bg-[#101014] px-3 py-2">
      <div>
        <p className="text-sm font-medium text-zinc-200">{item.label}</p>
        <p className="mt-0.5 text-xs text-zinc-600">{item.source}</p>
      </div>
      <button
        type="button"
        onClick={onRemove}
        className="grid h-7 w-7 place-items-center rounded-md text-zinc-500 transition hover:bg-zinc-800 hover:text-zinc-100"
        aria-label={`Remove ${item.label}`}
      >
        <X className="h-3.5 w-3.5" strokeWidth={1.8} />
      </button>
    </div>
  );
}

export function InsightCard({ insight }: { insight: Insight }) {
  const Icon = insight.icon;
  const tone =
    insight.severity === "warning"
      ? "text-amber-300 bg-amber-400/10 border-amber-400/20"
      : insight.severity === "ready"
        ? "text-emerald-300 bg-emerald-400/10 border-emerald-400/20"
        : "text-blue-300 bg-blue-500/10 border-blue-500/20";

  return (
    <article className="rounded-lg border border-line bg-[#101014] p-4">
      <div className="flex items-start gap-3">
        <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-md border ${tone}`}>
          <Icon className="h-4 w-4" strokeWidth={1.8} />
        </span>
        <div>
          <h3 className="text-sm font-semibold text-zinc-100">{insight.title}</h3>
          <p className="mt-2 text-sm leading-6 text-zinc-500">{insight.description}</p>
        </div>
      </div>
    </article>
  );
}

export function OutputTypeCard({
  output,
  selected,
  onToggle
}: {
  output: OutputType;
  selected: boolean;
  onToggle: () => void;
}) {
  const Icon = output.icon;

  return (
    <button
      type="button"
      onClick={onToggle}
      className={
        selected
          ? "rounded-lg border border-blue-500/35 bg-blue-500/10 p-4 text-left"
          : "rounded-lg border border-line bg-[#101014] p-4 text-left transition hover:border-white/16"
      }
      aria-pressed={selected}
    >
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-line bg-surface-raised">
          <Icon className="h-5 w-5 text-zinc-400" strokeWidth={1.8} />
        </span>
        <span>
          <span className="block text-sm font-semibold text-zinc-100">
            {output.name}
          </span>
          <span className="mt-2 block text-sm leading-6 text-zinc-500">
            {output.description}
          </span>
        </span>
      </div>
    </button>
  );
}

export function Badge({
  children,
  icon: Icon
}: {
  children: React.ReactNode;
  icon?: LucideIcon;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-line bg-[#101014] px-2.5 py-1 text-xs font-medium text-zinc-400">
      {Icon ? <Icon className="h-3.5 w-3.5" strokeWidth={1.8} /> : null}
      {children}
    </span>
  );
}
