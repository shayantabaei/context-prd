import { ProductMockup } from "./ProductMockup";

export function LandingHero() {
  return (
    <section className="relative border-b border-line">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-5 py-6 sm:px-8 lg:px-10">
        <header className="flex items-center justify-between">
          <a href="#" className="flex items-center gap-3" aria-label="ContextPRD home">
            <span className="grid h-8 w-8 place-items-center rounded-md border border-blue-400/30 bg-blue-500/15 text-sm font-semibold text-blue-200">
              C
            </span>
            <span className="text-sm font-semibold tracking-[-0.01em] text-zinc-100">
              ContextPRD
            </span>
          </a>
          <nav className="hidden items-center gap-7 text-sm text-zinc-400 md:flex">
            <a href="#workflow" className="transition hover:text-zinc-100">
              Workflow
            </a>
            <a href="#preview" className="transition hover:text-zinc-100">
              Preview
            </a>
            <a href="#security" className="transition hover:text-zinc-100">
              Security
            </a>
          </nav>
        </header>

        <div className="grid flex-1 items-center gap-10 py-12 lg:grid-cols-[0.9fr_1.1fr] lg:py-16">
          <div className="max-w-3xl">
            <p className="mb-5 w-fit rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1.5 text-xs font-medium uppercase tracking-[0.16em] text-blue-200">
              Company-context-aware PRDs
            </p>
            <h1 className="text-4xl font-semibold leading-[1.05] tracking-[-0.02em] text-zinc-50 sm:text-5xl lg:text-5xl 2xl:text-6xl">
              Generate engineering-ready PRDs from your company&apos;s
              Confluence knowledge
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-zinc-400 sm:text-lg">
              ContextPRD uses your internal standards, architecture docs, SDLC
              workflows, and product templates to create PRDs that engineering,
              product, and QA teams can actually execute.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="#final-cta"
                className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-5 text-sm font-medium text-white transition hover:bg-blue-400"
              >
                Start generating PRDs
              </a>
              <a
                href="#workflow"
                className="inline-flex h-11 items-center justify-center rounded-md border border-zinc-700 bg-zinc-900/50 px-5 text-sm font-medium text-zinc-200 transition hover:border-zinc-500 hover:bg-zinc-800"
              >
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
