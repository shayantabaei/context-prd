"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2, FileText, LayoutDashboard } from "lucide-react";
import { AuthGate } from "@/components/auth/AuthGate";
import { OnboardingShell } from "@/components/onboarding/OnboardingShell";
import { onboardingSteps } from "@/components/onboarding/onboarding-steps";

export default function OnboardingCompletePage() {
  const router = useRouter();

  function routeTo(path: string) {
    router.push(path);
  }

  return (
    <AuthGate>
      <OnboardingShell
        currentStep={3}
        eyebrow="Workspace ready"
        title="Your workspace is ready"
        description="ContextPRD can now generate PRDs grounded in trusted sources, organizational standards, and delivery workflows."
        steps={onboardingSteps}
      >
        <div className="rounded-xl border border-line bg-surface p-6 text-center shadow-blue-glow sm:p-10">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-blue-500">
            <CheckCircle2 className="h-8 w-8 text-white" strokeWidth={1.8} />
          </div>
          <h2 className="mt-6 text-2xl font-semibold tracking-[-0.02em] text-zinc-50">
            Workspace setup complete
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-zinc-400">
            First-time setup is complete. You can now continue to the focused
            PRD workflow.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={() => routeTo("/app/new")}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-5 text-sm font-medium text-white transition hover:bg-blue-400"
            >
              <FileText className="h-4 w-4" strokeWidth={1.9} />
              Create First PRD
            </button>
            <button
              type="button"
              onClick={() => routeTo("/app")}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-zinc-700 bg-zinc-900/50 px-5 text-sm font-medium text-zinc-300 transition hover:border-zinc-500 hover:text-white"
            >
              <LayoutDashboard className="h-4 w-4" strokeWidth={1.9} />
              Explore Workspace
              <ArrowRight className="h-4 w-4" strokeWidth={1.9} />
            </button>
          </div>
        </div>
      </OnboardingShell>
    </AuthGate>
  );
}
