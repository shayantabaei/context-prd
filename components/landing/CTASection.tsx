import { Sparkles } from "lucide-react";

export function CTASection() {
  return (
    <section id="final-cta" className="px-5 py-24 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-5xl rounded-xl border border-line bg-surface p-8 text-center sm:p-14">
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-blue-300">
          Create the first draft
        </p>
        <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-[-0.02em] text-zinc-50 sm:text-4xl">
          Turn company knowledge into an engineering-ready PRD
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-zinc-400">
          Start with approved organizational context, internal templates, and
          SDLC expectations so your next PRD is specific from the first pass.
        </p>
        <a
          href="/auth/login"
          className="mt-8 inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-5 text-sm font-medium text-white transition hover:bg-blue-400"
        >
          <Sparkles className="h-4 w-4" strokeWidth={1.9} />
          Create first PRD
        </a>
      </div>
    </section>
  );
}
