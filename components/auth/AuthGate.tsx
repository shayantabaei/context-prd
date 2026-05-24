"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

type AuthGateProps = {
  children: React.ReactNode;
};

export function AuthGate({ children }: AuthGateProps) {
  const router = useRouter();
  const [user, setUser] = useState<User | null | undefined>(undefined);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);

      if (!data.user) {
        router.replace("/auth/login");
      }
    });
  }, [router]);

  if (user === undefined) {
    return (
      <main className="grid min-h-screen place-items-center bg-canvas text-sm text-zinc-500">
        Loading secure session...
      </main>
    );
  }

  if (!user) {
    return (
      <main className="grid min-h-screen place-items-center bg-canvas text-sm text-zinc-500">
        Redirecting to login...
      </main>
    );
  }

  return <>{children}</>;
}
