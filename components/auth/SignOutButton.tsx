"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function SignOutButton({ email }: { email?: string }) {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();

    await supabase.auth.signOut();
    router.push("/auth/login");
    router.refresh();
  }

  return (
    <div className="flex items-center gap-3">
      {email ? (
        <span className="hidden max-w-[220px] truncate text-sm text-zinc-500 sm:inline">
          {email}
        </span>
      ) : null}
      <button
        type="button"
        onClick={handleSignOut}
        className="text-sm font-medium text-zinc-400 transition hover:text-white"
      >
        Sign out
      </button>
    </div>
  );
}
