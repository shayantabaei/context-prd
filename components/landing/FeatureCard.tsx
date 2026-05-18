type FeatureCardProps = {
  label: string;
  title: string;
  description: string;
};

export function FeatureCard({ label, title, description }: FeatureCardProps) {
  return (
    <article className="rounded-lg border border-line bg-surface p-5 transition duration-200 hover:border-line-strong">
      <p className="font-mono text-xs uppercase tracking-[0.14em] text-blue-300">
        {label}
      </p>
      <h3 className="mt-5 text-lg font-semibold tracking-[-0.01em] text-zinc-50">
        {title}
      </h3>
      <p className="mt-3 text-sm leading-6 text-zinc-400">{description}</p>
    </article>
  );
}
