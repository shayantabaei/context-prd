import { AuthGate } from "@/components/auth/AuthGate";
import { AppShell } from "@/components/app/AppShell";
import { CreatePrdWorkflow } from "@/components/create-prd/CreatePrdWorkflow";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function NewPrdPage() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <AuthGate>
      <AppShell>
        <CreatePrdWorkflow />
      </AppShell>
    </AuthGate>
  );
}
