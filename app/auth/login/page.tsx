import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth/AuthForm";
import { AuthPageShell } from "@/components/auth/AuthPageShell";
import { createClient } from "@/lib/supabase/server";

export default async function LoginPage() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/app");
  }

  return (
    <AuthPageShell
      eyebrow="Secure access"
      title="Sign in to ContextPRD"
      description="Access the AI-assisted workflow for turning initiative context, uploaded documents, and clarification answers into engineering-ready PRDs."
    >
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-zinc-500">
          Welcome back
        </p>
        <h2 className="mt-3 text-2xl font-semibold tracking-[-0.02em]">
          Continue to your workflow
        </h2>
        <p className="mt-3 text-sm leading-6 text-zinc-400">
          Sign in with your email and password to continue generating PRDs.
        </p>
      </div>
      <AuthForm mode="login" />
    </AuthPageShell>
  );
}
