"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Building2, CheckCircle2, FileText, Shield } from "lucide-react";
import { BrandMark } from "@/components/onboarding/BrandMark";
import {
  getPostSignInPath,
  setMockSession,
  type MockAuthState
} from "@/lib/mock-session";

type SignInMode = Extract<
  MockAuthState,
  "authenticated_without_workspace" | "authenticated_with_workspace"
>;

const signInModes: Array<{
  label: string;
  description: string;
  state: SignInMode;
}> = [
  {
    label: "First-time setup",
    description: "Continue to workspace onboarding after sign-in.",
    state: "authenticated_without_workspace"
  },
  {
    label: "Existing workspace",
    description: "Skip onboarding and open the app shell.",
    state: "authenticated_with_workspace"
  }
];

export default function SignInPage() {
  const router = useRouter();
  const [mode, setMode] = useState<SignInMode>("authenticated_without_workspace");

  function handleSignIn() {
    setMockSession(mode);
    router.push(getPostSignInPath(mode));
  }

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
            Secure access
          </p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-[-0.02em] text-zinc-50 sm:text-5xl">
            Sign in to your ContextPRD workspace
          </h1>
          <p className="mt-5 text-base leading-7 text-zinc-400">
            Use your company identity to access grounded PRD workflows,
            approved context, and workspace-specific standards.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {[
              ["SSO-ready", Shield],
              ["Workspace-aware", Building2],
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
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-zinc-500">
              Mock sign in
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-[-0.02em]">
              Continue with company SSO
            </h2>
            <p className="mt-3 text-sm leading-6 text-zinc-400">
              Authentication is mocked for now. Choose the session state to
              simulate post-sign-in routing.
            </p>
          </div>

          <div className="mt-6 space-y-2">
            {signInModes.map((option) => (
              <button
                key={option.state}
                type="button"
                onClick={() => setMode(option.state)}
                className={
                  mode === option.state
                    ? "flex w-full items-center gap-3 rounded-lg border border-blue-500/30 bg-blue-500/10 p-4 text-left"
                    : "flex w-full items-center gap-3 rounded-lg border border-line bg-[#101014] p-4 text-left transition hover:border-white/16"
                }
              >
                <span
                  className={
                    mode === option.state
                      ? "grid h-8 w-8 shrink-0 place-items-center rounded-md bg-blue-500 text-white"
                      : "grid h-8 w-8 shrink-0 place-items-center rounded-md border border-line text-zinc-500"
                  }
                >
                  <CheckCircle2 className="h-4 w-4" strokeWidth={1.8} />
                </span>
                <span>
                  <span className="block text-sm font-medium text-zinc-100">
                    {option.label}
                  </span>
                  <span className="mt-1 block text-sm leading-5 text-zinc-500">
                    {option.description}
                  </span>
                </span>
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleSignIn}
            className="mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-primary px-5 text-sm font-medium text-white transition hover:bg-blue-400"
          >
            Sign In
            <ArrowRight className="h-4 w-4" strokeWidth={1.9} />
          </button>
        </div>
      </section>
    </main>
  );
}
