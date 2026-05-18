import { AuthGate } from "@/components/auth/AuthGate";
import { AppShell } from "@/components/app/AppShell";

export default function NewPrdPage() {
  return (
    <AuthGate requireWorkspace>
      <AppShell>
        <section>
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-blue-300">
            Create PRD
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.02em]">
            Start a new engineering-ready PRD
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">
            This placeholder represents the next authenticated workflow. The
            first landing-page milestone only wires navigation into this route.
          </p>

          <div className="mt-8 rounded-xl border border-line bg-surface p-5">
            <div className="grid gap-4 md:grid-cols-2">
              {[
                ["Initiative name", "Partner billing permissions"],
                ["Primary team", "Platform Engineering"],
                ["Delivery workflow", "Standard SDLC"],
                ["Output template", "Enterprise PRD"]
              ].map(([label, value]) => (
                <label key={label} className="block">
                  <span className="text-sm font-medium text-zinc-300">
                    {label}
                  </span>
                  <span className="mt-2 flex h-11 items-center rounded-md border border-line bg-[#09090b] px-3 text-sm text-zinc-100">
                    {value}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </section>
      </AppShell>
    </AuthGate>
  );
}
