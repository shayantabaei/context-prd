"use client";

import { useRouter } from "next/navigation";
import { clearMockSession } from "@/lib/mock-session";

export function SignOutButton() {
  const router = useRouter();

  function handleSignOut() {
    clearMockSession();
    router.push("/signin");
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      className="text-sm font-medium text-zinc-400 transition hover:text-white"
    >
      Sign out
    </button>
  );
}
