import { FileText, Shield, Sparkles } from "lucide-react";
import { BrandMark } from "@/components/onboarding/BrandMark";

export function AuthPageShell({
  eyebrow,
  title,
  description,
  children
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-canvas text-zinc-50">
      <header className="border-b border-white/10 bg-[#0b0b0d]">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
          <BrandMark />
          <a
            href="/"
            className="text-sm font-medium text-zinc-400 transition hover:text-white"
          >
            Back to home
          </a>
        </div>
      </header>

      <section className="mx-auto grid min-h-[calc(100vh-3.5rem)] max-w-7xl items-center gap-12 px-5 py-12 sm:px-8 lg:grid-cols-[0.95fr_1.05fr] lg:px-10">
        <div className="max-w-xl">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-blue-300">
            {eyebrow}
          </p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-[-0.02em] text-zinc-50 sm:text-5xl">
            {title}
          </h1>
          <p className="mt-5 text-base leading-7 text-zinc-400">
            {description}
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {[
              ["Secure auth", Shield],
              ["AI workflow", Sparkles],
              ["PRD-focused", FileText]
            ].map(([label, Icon]) => (
              <div
                key={label as string}
                className="rounded-lg border border-line bg-surface p-4"
              >
                <Icon className="h-5 w-5 text-zinc-400" strokeWidth={1.8} />
                <p className="mt-3 text-sm font-medium text-zinc-200">
                  {label as string}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="mx-auto w-full max-w-md rounded-xl border border-line bg-surface p-6 shadow-blue-glow">
          {children}
        </div>
      </section>
    </main>
  );
}
