import Link from "next/link";
import { ArrowRight, Building2, Globe2, Users } from "lucide-react";
import { AuthGate } from "@/components/auth/AuthGate";
import { OnboardingShell } from "@/components/onboarding/OnboardingShell";
import { onboardingSteps } from "@/components/onboarding/onboarding-steps";

const workspaceFields = [
  {
    label: "Workspace name",
    value: "Acme Engineering"
  },
  {
    label: "Primary domain",
    value: "acme.example"
  }
];

export default function WorkspaceSetupPage() {
  return (
    <AuthGate>
      <OnboardingShell
        currentStep={0}
        eyebrow="Workspace setup"
        title="Create your engineering workspace"
        description="Set up the shared environment where approved sources, organizational standards, and PRD workflows will live."
        steps={onboardingSteps}
      >
        <div className="rounded-xl border border-line bg-surface p-5 sm:p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            {workspaceFields.map((field) => (
              <label key={field.label} className="block">
                <span className="text-sm font-medium text-zinc-300">
                  {field.label}
                </span>
                <span className="mt-2 flex h-11 items-center rounded-md border border-line bg-[#09090b] px-3 text-sm text-zinc-100">
                  {field.value}
                </span>
              </label>
            ))}
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {[
              ["Organization-wide context", Building2],
              ["Team access controls", Users],
              ["Internal systems ready", Globe2]
            ].map(([label, Icon]) => (
              <div
                key={label as string}
                className="rounded-lg border border-line bg-[#101014] p-4"
              >
                <Icon className="h-5 w-5 text-zinc-400" strokeWidth={1.8} />
                <p className="mt-3 text-sm leading-5 text-zinc-300">
                  {label as string}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-end">
            <Link
              href="/onboarding/sources"
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
