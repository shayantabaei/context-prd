import type { LucideIcon } from "lucide-react";
import { Plus, X } from "lucide-react";

export type MetricEntry = {
  id: string;
  metric: string;
  target: string;
};

export type DependencyReference = {
  id: string;
  name: string;
  relationship: string;
  impact: "High" | "Medium" | "Low";
  selected: boolean;
};

export function TextField({
  id,
  label,
  value,
  helper,
  onChange
}: {
  id: string;
  label: string;
  value: string;
  helper?: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium text-zinc-300">
        {label}
      </label>
      <input
        id={id}
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 h-11 w-full rounded-md border border-line bg-[#09090b] px-3 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-blue-500/60"
      />
      {helper ? (
        <p className="mt-2 text-xs leading-5 text-zinc-500">{helper}</p>
      ) : null}
    </div>
  );
}

export function TextAreaField({
  id,
  label,
  value,
  helper,
  placeholder,
  rows = 4,
  onChange
}: {
  id: string;
  label: string;
  value: string;
  helper?: string;
  placeholder?: string;
  rows?: number;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium text-zinc-300">
        {label}
      </label>
      <textarea
        id={id}
        rows={rows}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full resize-none rounded-md border border-line bg-[#09090b] px-3 py-3 text-sm leading-6 text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-blue-500/60"
      />
      {helper ? (
        <p className="mt-2 text-xs leading-5 text-zinc-500">{helper}</p>
      ) : null}
    </div>
  );
}

export function BulletInput({
  id,
  label,
  helper,
  items,
  placeholder,
  onAdd,
  onRemove
}: {
  id: string;
  label: string;
  helper?: string;
  items: string[];
  placeholder: string;
  onAdd: (value: string) => void;
  onRemove: (value: string) => void;
}) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium text-zinc-300">
        {label}
      </label>
      <div className="mt-2 rounded-lg border border-line bg-[#09090b] p-3">
        <div className="flex flex-wrap gap-2">
          {items.map((item) => (
            <span
              key={item}
              className="inline-flex items-center gap-2 rounded-md border border-line bg-[#101014] px-2.5 py-1.5 text-xs font-medium text-zinc-300"
            >
              {item}
              <button
                type="button"
                onClick={() => onRemove(item)}
                className="text-zinc-600 transition hover:text-zinc-100"
                aria-label={`Remove ${item}`}
              >
                <X className="h-3 w-3" strokeWidth={1.8} />
              </button>
            </span>
          ))}
        </div>
        <input
          id={id}
          type="text"
          placeholder={placeholder}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              const value = event.currentTarget.value.trim();
              if (value) {
                onAdd(value);
                event.currentTarget.value = "";
              }
            }
          }}
          className="mt-3 h-9 w-full border-0 bg-transparent text-sm text-zinc-100 outline-none placeholder:text-zinc-600"
        />
      </div>
      {helper ? (
        <p className="mt-2 text-xs leading-5 text-zinc-500">{helper}</p>
      ) : null}
    </div>
  );
}

export function MetricEntries({
  metrics,
  onChange
}: {
  metrics: MetricEntry[];
  onChange: (metrics: MetricEntry[]) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-medium text-zinc-300">Success Metrics</p>
        <button
          type="button"
          onClick={() =>
            onChange([
              ...metrics,
              {
                id: `metric-${metrics.length + 1}`,
                metric: "",
                target: ""
              }
            ])
          }
          className="inline-flex h-8 items-center gap-1.5 rounded-md border border-line px-2.5 text-xs font-medium text-zinc-400 transition hover:border-zinc-500 hover:text-white"
        >
          <Plus className="h-3.5 w-3.5" strokeWidth={1.8} />
          Add metric
        </button>
      </div>
      <div className="mt-2 space-y-2">
        {metrics.map((metric, index) => (
          <div key={metric.id} className="grid gap-2 md:grid-cols-[1fr_1fr_auto]">
            <input
              aria-label={`Metric ${index + 1}`}
              value={metric.metric}
              onChange={(event) =>
                onChange(
                  metrics.map((item) =>
                    item.id === metric.id
                      ? { ...item, metric: event.target.value }
                      : item
                  )
                )
              }
              className="h-10 rounded-md border border-line bg-[#09090b] px-3 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-blue-500/60"
              placeholder="Metric"
            />
            <input
              aria-label={`Target ${index + 1}`}
              value={metric.target}
              onChange={(event) =>
                onChange(
                  metrics.map((item) =>
                    item.id === metric.id
                      ? { ...item, target: event.target.value }
                      : item
                  )
                )
              }
              className="h-10 rounded-md border border-line bg-[#09090b] px-3 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-blue-500/60"
              placeholder="Target"
            />
            <button
              type="button"
              onClick={() =>
                onChange(metrics.filter((item) => item.id !== metric.id))
              }
              className="grid h-10 w-10 place-items-center rounded-md text-zinc-600 transition hover:bg-zinc-800 hover:text-white"
              aria-label={`Remove metric ${index + 1}`}
            >
              <X className="h-4 w-4" strokeWidth={1.8} />
            </button>
          </div>
        ))}
      </div>
      <p className="mt-2 text-xs leading-5 text-zinc-500">
        Define measurable outcomes that downstream readiness checks can evaluate.
      </p>
    </div>
  );
}

export function GovernanceCallout({
  icon: Icon,
  title,
  children
}: {
  icon: LucideIcon;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-4">
      <div className="flex items-start gap-3">
        <Icon className="mt-0.5 h-5 w-5 shrink-0 text-blue-300" strokeWidth={1.8} />
        <div>
          <p className="text-sm font-semibold text-zinc-100">{title}</p>
          <p className="mt-2 text-sm leading-6 text-zinc-400">{children}</p>
        </div>
      </div>
    </div>
  );
}

export function DependencyReferences({
  systems,
  onToggle
}: {
  systems: DependencyReference[];
  onToggle: (id: string) => void;
}) {
  const toneByImpact: Record<DependencyReference["impact"], string> = {
    High: "border-amber-400/20 bg-amber-400/10 text-amber-200",
    Medium: "border-blue-500/20 bg-blue-500/10 text-blue-200",
    Low: "border-line bg-[#101014] text-zinc-400"
  };

  return (
    <div>
      <p className="text-sm font-medium text-zinc-300">
        Related Systems & Dependencies
      </p>
      <div className="mt-2 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {systems.map((system) => (
          <button
            key={system.id}
            type="button"
            onClick={() => onToggle(system.id)}
            aria-pressed={system.selected}
            className={
              system.selected
                ? "rounded-lg border border-blue-500/35 bg-blue-500/10 p-4 text-left"
                : "rounded-lg border border-line bg-[#101014] p-4 text-left transition hover:border-white/16"
            }
          >
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-semibold text-zinc-100">
                {system.name}
              </span>
              <span
                className={`rounded-md border px-2 py-1 text-[11px] font-medium ${toneByImpact[system.impact]}`}
              >
                {system.impact} impact
              </span>
            </div>
            <p className="mt-3 text-xs leading-5 text-zinc-500">
              {system.relationship}
            </p>
          </button>
        ))}
      </div>
      <p className="mt-2 text-xs leading-5 text-zinc-500">
        System references will later inform architecture graph analysis and
        dependency inference.
      </p>
    </div>
  );
}

export function GuidancePanel({
  icon: Icon,
  title,
  children
}: {
  icon: LucideIcon;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-line bg-[#101014] p-4">
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-line bg-surface-raised">
          <Icon className="h-5 w-5 text-zinc-400" strokeWidth={1.8} />
        </span>
        <div>
          <p className="text-sm font-semibold text-zinc-100">{title}</p>
          <p className="mt-2 text-sm leading-6 text-zinc-500">{children}</p>
        </div>
      </div>
    </div>
  );
}
