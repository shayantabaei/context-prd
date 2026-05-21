import { AuthGate } from "@/components/auth/AuthGate";
import { AppShell } from "@/components/app/AppShell";
import { CreatePrdWorkflow } from "@/components/create-prd/CreatePrdWorkflow";

export default function NewPrdPage() {
  return (
    <AuthGate requireWorkspace>
      <AppShell>
        <CreatePrdWorkflow />
      </AppShell>
    </AuthGate>
  );
}
