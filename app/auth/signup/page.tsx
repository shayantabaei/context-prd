import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth/AuthForm";
import { AuthPageShell } from "@/components/auth/AuthPageShell";
import { createClient } from "@/lib/supabase/server";

export default async function SignupPage() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/app");
  }

  return (
    <AuthPageShell
      eyebrow="Create account"
      title="Start using ContextPRD"
      description="Create a lightweight account to access the PRD workflow. Persistence, teams, and production workspace management come later."
    >
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-zinc-500">
          New account
        </p>
        <h2 className="mt-3 text-2xl font-semibold tracking-[-0.02em]">
          Create your account
        </h2>
        <p className="mt-3 text-sm leading-6 text-zinc-400">
          Use email and password auth for this portfolio slice.
        </p>
      </div>
      <AuthForm mode="signup" />
    </AuthPageShell>
  );
}
