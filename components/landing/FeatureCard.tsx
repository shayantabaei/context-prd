import type { LucideIcon } from "lucide-react";

type FeatureCardProps = {
  label: string;
  title: string;
  description: string;
  icon: LucideIcon;
};

export function FeatureCard({
  label,
  title,
  description,
  icon: Icon
}: FeatureCardProps) {
  return (
    <article className="rounded-lg border border-line bg-surface p-5 transition duration-200 hover:border-line-strong">
      <div className="flex items-center justify-between gap-4">
        <p className="font-mono text-xs uppercase tracking-[0.14em] text-blue-300">
          {label}
        </p>
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-line bg-surface-raised">
          <Icon className="h-5 w-5 text-zinc-400" strokeWidth={1.8} />
        </span>
      </div>
      <h3 className="mt-6 text-lg font-semibold tracking-[-0.01em] text-zinc-50">
        {title}
      </h3>
      <p className="mt-3 text-sm leading-6 text-zinc-400">{description}</p>
    </article>
  );
}
