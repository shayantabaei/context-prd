import { FileText, Menu, Sparkles, Workflow } from "lucide-react";
import { ProductMockup } from "./ProductMockup";

export function LandingHero() {
  return (
    <section className="relative border-b border-line">
      <header className="border-b border-white/10 bg-[#0b0b0d]">
        <div className="mx-auto grid h-14 max-w-7xl grid-cols-[1fr_auto] items-center gap-4 px-5 sm:px-8 lg:grid-cols-[1fr_auto_1fr] lg:px-10">
          <a
            href="#"
            className="flex items-center gap-3"
            aria-label="ContextPRD home"
          >
            <FileText className="h-5 w-5 text-blue-400" strokeWidth={1.9} />
            <span className="text-sm font-semibold tracking-[-0.01em] text-white">
              ContextPRD
            </span>
          </a>

          <nav className="hidden items-center justify-center gap-8 text-sm font-medium text-zinc-300 lg:flex">
            <a href="#workflow" className="transition hover:text-white">
              How it works
            </a>
            <a href="#preview" className="transition hover:text-white">
              Features
            </a>
            <a href="#security" className="transition hover:text-white">
              Enterprise
            </a>
          </nav>

          <div className="hidden items-center justify-end gap-4 lg:flex">
            <a
              href="/signin"
              className="text-sm font-medium text-zinc-300 transition hover:text-white"
            >
              Sign In
            </a>
            <a
              href="/signin"
              className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-white transition hover:bg-blue-400"
            >
              Get Started
            </a>
          </div>

          <button
            type="button"
            className="grid h-9 w-9 place-items-center justify-self-end rounded-md text-zinc-300 transition hover:bg-white/[0.04] hover:text-white lg:hidden"
            aria-label="Open navigation menu"
          >
            <Menu className="h-4 w-4" strokeWidth={1.9} />
          </button>
        </div>
      </header>

      <div className="mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-7xl flex-col px-5 py-4 sm:px-8 lg:px-10">

        <div className="grid flex-1 items-center gap-12 py-14 lg:grid-cols-[0.9fr_1.1fr] lg:py-16">
          <div className="max-w-3xl">
            <p className="mb-5 w-fit rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1.5 text-xs font-medium uppercase tracking-[0.16em] text-blue-200">
              Company-context-aware PRDs
            </p>
            <h1 className="text-4xl font-semibold leading-[1.05] tracking-[-0.02em] text-zinc-50 sm:text-5xl lg:text-5xl 2xl:text-6xl">
              Turn company knowledge into engineering-ready PRDs
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-zinc-400 sm:text-lg">
              ContextPRD grounds every draft in internal standards, architecture
              guidance, SDLC workflows, and approved sources so product,
              engineering, and QA teams can align faster.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="/signin"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-5 text-sm font-medium text-white transition hover:bg-blue-400"
              >
                <Sparkles className="h-4 w-4" strokeWidth={1.9} />
                Start generating PRDs
              </a>
              <a
                href="#workflow"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-zinc-700 bg-zinc-900/50 px-5 text-sm font-medium text-zinc-200 transition hover:border-zinc-500 hover:bg-zinc-800"
              >
                <Workflow className="h-4 w-4 text-zinc-400" strokeWidth={1.9} />
                View workflow
              </a>
            </div>
          </div>
          <ProductMockup />
        </div>
      </div>
    </section>
  );
}
