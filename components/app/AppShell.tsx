import { SignOutButton } from "@/components/auth/SignOutButton";
import { BrandMark } from "@/components/onboarding/BrandMark";
import { createClient } from "@/lib/supabase/server";

type AppShellProps = {
  children: React.ReactNode;
};

export async function AppShell({ children }: AppShellProps) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  return (
    <main className="min-h-screen bg-canvas text-zinc-50">
      <header className="border-b border-white/10 bg-[#0b0b0d]">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
          <BrandMark />
          <SignOutButton email={user?.email} />
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10">
        {children}
      </div>
    </main>
  );
}
