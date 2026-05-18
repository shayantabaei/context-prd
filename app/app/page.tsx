import { AuthGate } from "@/components/auth/AuthGate";
import { ResetWorkspaceButton } from "@/components/auth/ResetWorkspaceButton";
import { AppShell } from "@/components/app/AppShell";

const recentPrds = [
  "Billing Platform Usage Controls",
  "Partner Permissions Expansion",
  "Risk Review Automation"
];

export default function AppPage() {
  return (
    <AuthGate requireWorkspace>
      <AppShell>
        <section>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-blue-300">
                Workspace
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-[-0.02em]">
                Acme Engineering
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">
                Authenticated app shell for generated PRDs, trusted context,
                standards, and delivery workflows.
              </p>
            </div>
            <ResetWorkspaceButton />
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              ["Configured sources", "12"],
              ["Active templates", "6"],
              ["Generated PRDs", "24"]
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-xl border border-line bg-surface p-5"
              >
                <p className="text-sm text-zinc-500">{label}</p>
                <p className="mt-3 text-3xl font-semibold text-zinc-50">
                  {value}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-xl border border-line bg-surface p-5">
            <h2 className="text-lg font-semibold tracking-[-0.01em]">
              Recent PRDs
            </h2>
            <div className="mt-4 divide-y divide-white/10">
              {recentPrds.map((prd) => (
                <div
                  key={prd}
                  className="flex items-center justify-between py-3 text-sm"
                >
                  <span className="font-medium text-zinc-200">{prd}</span>
                  <span className="text-zinc-500">Ready for review</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </AppShell>
    </AuthGate>
  );
}
