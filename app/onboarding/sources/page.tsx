import Link from "next/link";
import { ArrowLeft, ArrowRight, Blocks, CheckCircle2, Database, FileText } from "lucide-react";
import { AuthGate } from "@/components/auth/AuthGate";
import { OnboardingShell } from "@/components/onboarding/OnboardingShell";
import { onboardingSteps } from "@/components/onboarding/onboarding-steps";

const sources = [
  {
    name: "Internal documentation",
    description: "Architecture docs, RFCs, operating models, and team guides.",
    icon: FileText
  },
  {
    name: "Engineering systems",
    description: "Service catalogs, ownership records, and release metadata.",
    icon: Database
  },
  {
    name: "Planning workspaces",
    description: "Roadmaps, initiative briefs, and delivery milestones.",
    icon: Blocks
  }
];

export default function ConnectSourcesPage() {
  return (
    <AuthGate onboardingOnly>
      <OnboardingShell
        currentStep={1}
        eyebrow="Connect sources"
        title="Choose trusted knowledge sources"
        description="Select the internal systems that should ground generated PRDs. These mock connections represent first-time setup only."
        steps={onboardingSteps}
      >
        <div className="rounded-xl border border-line bg-surface p-5 sm:p-6">
          <div className="space-y-3">
            {sources.map((source) => {
              const Icon = source.icon;

              return (
                <div
                  key={source.name}
                  className="flex items-start justify-between gap-4 rounded-lg border border-line bg-[#101014] p-4"
                >
                  <div className="flex gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-line bg-surface-raised">
                      <Icon className="h-5 w-5 text-zinc-400" strokeWidth={1.8} />
                    </span>
                    <div>
                      <h3 className="text-sm font-semibold text-zinc-100">
                        {source.name}
                      </h3>
                      <p className="mt-1 text-sm leading-6 text-zinc-500">
                        {source.description}
                      </p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-md border border-blue-500/20 bg-blue-500/10 px-2.5 py-1 text-xs font-medium text-blue-200">
                    <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={1.8} />
                    Selected
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
            <Link
              href="/onboarding/workspace"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-zinc-700 bg-zinc-900/50 px-5 text-sm font-medium text-zinc-300 transition hover:border-zinc-500 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" strokeWidth={1.9} />
              Back
            </Link>
            <Link
              href="/onboarding/templates"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-5 text-sm font-medium text-white transition hover:bg-blue-400"
            >
              Continue
              <ArrowRight className="h-4 w-4" strokeWidth={1.9} />
            </Link>
          </div>
        </div>
      </OnboardingShell>
    </AuthGate>
  );
}
