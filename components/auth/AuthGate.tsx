"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getMockSession, type MockAuthState } from "@/lib/mock-session";

type AuthGateProps = {
  children: React.ReactNode;
  requireWorkspace?: boolean;
  onboardingOnly?: boolean;
};

export function AuthGate({
  children,
  requireWorkspace = false,
  onboardingOnly = false
}: AuthGateProps) {
  const router = useRouter();
  const [state, setState] = useState<MockAuthState | null>(null);

  useEffect(() => {
    const session = getMockSession();
    setState(session.state);

    if (session.state === "unauthenticated") {
      router.replace("/signin");
      return;
    }

    if (requireWorkspace && session.state !== "authenticated_with_workspace") {
      router.replace("/onboarding/workspace");
      return;
    }

    if (onboardingOnly && session.state === "authenticated_with_workspace") {
      router.replace("/app");
    }
  }, [onboardingOnly, requireWorkspace, router]);

  if (state === null) {
    return (
      <main className="grid min-h-screen place-items-center bg-canvas text-sm text-zinc-500">
        Loading workspace...
      </main>
    );
  }

  if (state === "unauthenticated") {
    return (
      <main className="grid min-h-screen place-items-center bg-canvas text-sm text-zinc-500">
        Redirecting to sign in...
      </main>
    );
  }

  if (requireWorkspace && state !== "authenticated_with_workspace") {
    return (
      <main className="grid min-h-screen place-items-center bg-canvas text-sm text-zinc-500">
        Redirecting to workspace setup...
      </main>
    );
  }

  if (onboardingOnly && state === "authenticated_with_workspace") {
    return (
      <main className="grid min-h-screen place-items-center bg-canvas text-sm text-zinc-500">
        Opening workspace...
      </main>
    );
  }

  return <>{children}</>;
}
