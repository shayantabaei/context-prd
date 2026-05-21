"use client";

import { useRouter } from "next/navigation";
import { setMockSession } from "@/lib/mock-session";

export function ResetWorkspaceButton() {
  const router = useRouter();

  function handleReset() {
    setMockSession("authenticated_without_workspace");
    router.push("/onboarding/workspace");
  }

  return (
    <button
      type="button"
      onClick={handleReset}
      className="rounded-md border border-zinc-700 bg-zinc-900/50 px-3 py-2 text-sm font-medium text-zinc-300 transition hover:border-zinc-500 hover:text-white"
    >
      Reset onboarding
    </button>
  );
}
