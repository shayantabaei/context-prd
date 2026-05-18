import type { LucideIcon } from "lucide-react";
import { CheckCircle2 } from "lucide-react";
import { BrandMark } from "./BrandMark";

type Step = {
  label: string;
  href: string;
  icon: LucideIcon;
};

type OnboardingShellProps = {
  currentStep: number;
  eyebrow: string;
  title: string;
  description: string;
  steps: Step[];
  children: React.ReactNode;
};

export function OnboardingShell({
  currentStep,
  eyebrow,
  title,
  description,
  steps,
  children
}: OnboardingShellProps) {
  return (
    <main className="min-h-screen bg-canvas text-zinc-50">
      <header className="border-b border-white/10 bg-[#0b0b0d]">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
          <BrandMark />
          <p className="hidden text-sm text-zinc-500 sm:block">
            First-time workspace setup
          </p>
        </div>
      </header>

      <section className="mx-auto grid min-h-[calc(100vh-3.5rem)] max-w-7xl gap-10 px-5 py-10 sm:px-8 lg:grid-cols-[280px_1fr] lg:px-10 lg:py-14">
        <aside className="rounded-xl border border-line bg-surface p-4 lg:self-start">
          <p className="px-2 text-xs font-medium uppercase tracking-[0.16em] text-zinc-500">
            Setup progress
          </p>
          <nav className="mt-4 space-y-1">
            {steps.map((step, index) => {
              const isComplete = index < currentStep;
              const isActive = index === currentStep;
              const Icon = step.icon;

              return (
                <div
                  key={step.label}
                  className={
                    isActive
                      ? "flex items-center gap-3 rounded-md border border-blue-500/20 bg-blue-500/10 px-3 py-2.5 text-sm text-zinc-100"
                      : "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-zinc-500"
                  }
                >
                  <span
                    className={
                      isActive
                        ? "grid h-7 w-7 place-items-center rounded-md bg-blue-500 text-white"
                        : "grid h-7 w-7 place-items-center rounded-md border border-line bg-[#101014] text-zinc-500"
                    }
                  >
                    {isComplete ? (
                      <CheckCircle2 className="h-4 w-4" strokeWidth={1.8} />
                    ) : (
                      <Icon className="h-4 w-4" strokeWidth={1.8} />
                    )}
                  </span>
                  <span>{step.label}</span>
                </div>
              );
            })}
          </nav>
        </aside>

        <div>
          <div className="mx-auto max-w-3xl">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-blue-300">
              {eyebrow}
            </p>
            <h1 className="mt-4 text-3xl font-semibold leading-tight tracking-[-0.02em] text-zinc-50 sm:text-4xl">
              {title}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-400">
              {description}
            </p>
          </div>
          <div className="mx-auto mt-8 max-w-3xl">{children}</div>
        </div>
      </section>
    </main>
  );
}
