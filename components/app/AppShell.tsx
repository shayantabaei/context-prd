import Link from "next/link";
import {
  BarChart3,
  FileText,
  LayoutDashboard,
  Library,
  Plus,
  Shield
} from "lucide-react";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { BrandMark } from "@/components/onboarding/BrandMark";

type AppShellProps = {
  children: React.ReactNode;
};

const navItems = [
  { label: "Dashboard", href: "/app", icon: LayoutDashboard },
  { label: "PRDs", href: "/app", icon: FileText },
  { label: "Context", href: "/app", icon: Library },
  { label: "Governance", href: "/app", icon: Shield },
  { label: "Metrics", href: "/app", icon: BarChart3 }
];

export function AppShell({ children }: AppShellProps) {
  return (
    <main className="min-h-screen bg-canvas text-zinc-50">
      <header className="border-b border-white/10 bg-[#0b0b0d]">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
          <BrandMark />
          <div className="flex items-center gap-4">
            <Link
              href="/app/new"
              className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-white transition hover:bg-blue-400"
            >
              <Plus className="h-4 w-4" strokeWidth={1.9} />
              Create PRD
            </Link>
            <SignOutButton />
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-8 sm:px-8 lg:grid-cols-[240px_1fr] lg:px-10">
        <aside className="rounded-xl border border-line bg-surface p-3 lg:self-start">
          <nav className="space-y-1">
            {navItems.map((item, index) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={
                    index === 0
                      ? "flex items-center gap-3 rounded-md bg-zinc-800/70 px-3 py-2.5 text-sm font-medium text-zinc-100"
                      : "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-zinc-500 transition hover:bg-zinc-900 hover:text-zinc-200"
                  }
                >
                  <Icon className="h-4 w-4" strokeWidth={1.8} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {children}
      </div>
    </main>
  );
}
