import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle2, FileText, Shield, Workflow } from "lucide-react";
import { AuthGate } from "@/components/auth/AuthGate";
import { OnboardingShell } from "@/components/onboarding/OnboardingShell";
import { onboardingSteps } from "@/components/onboarding/onboarding-steps";

const standards = [
  {
    name: "PRD template",
    description: "Goals, requirements, acceptance criteria, and open questions.",
    icon: FileText
  },
  {
    name: "SDLC workflow",
    description: "Discovery, design review, implementation, QA, and launch.",
    icon: Workflow
  },
  {
    name: "Security standard",
    description: "Privacy, permissions, auditability, and review expectations.",
    icon: Shield
  }
];

export default function TemplatesPage() {
  return (
    <AuthGate onboardingOnly>
      <OnboardingShell
        currentStep={2}
        eyebrow="Standards and templates"
        title="Configure how PRDs should be structured"
        description="Apply the organizational standards and templates that should shape every generated PRD draft."
        steps={onboardingSteps}
      >
        <div className="rounded-xl border border-line bg-surface p-5 sm:p-6">
          <div className="grid gap-3">
            {standards.map((standard) => {
              const Icon = standard.icon;

              return (
                <div
                  key={standard.name}
                  className="rounded-lg border border-line bg-[#101014] p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-3">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-line bg-surface-raised">
                        <Icon className="h-5 w-5 text-zinc-400" strokeWidth={1.8} />
                      </span>
                      <div>
                        <h3 className="text-sm font-semibold text-zinc-100">
                          {standard.name}
                        </h3>
                        <p className="mt-1 text-sm leading-6 text-zinc-500">
                          {standard.description}
                        </p>
                      </div>
                    </div>
                    <CheckCircle2 className="h-5 w-5 text-blue-300" strokeWidth={1.8} />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
            <Link
              href="/onboarding/sources"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-zinc-700 bg-zinc-900/50 px-5 text-sm font-medium text-zinc-300 transition hover:border-zinc-500 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" strokeWidth={1.9} />
              Back
            </Link>
            <Link
              href="/onboarding/complete"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-5 text-sm font-medium text-white transition hover:bg-blue-400"
            >
              Finish setup
              <ArrowRight className="h-4 w-4" strokeWidth={1.9} />
            </Link>
          </div>
        </div>
      </OnboardingShell>
    </AuthGate>
  );
}
