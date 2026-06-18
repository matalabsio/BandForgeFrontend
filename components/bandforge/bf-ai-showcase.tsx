export function BandForgeAiShowcase() {
  return (
    <section
      id="evaluation"
      className="bf-section bg-white/20"
    >
      <div className="bf-container">
        <div className="mx-auto max-w-3xl text-center">
          <p className="bf-eyebrow">
            AI evaluation
          </p>
          <h2 className="font-display mt-3 text-[2rem] leading-[1.08] font-bold tracking-[-0.03em] text-navy sm:text-[2.375rem]">
            Detailed feedback in seconds, not days.
          </h2>
          <p className="bf-copy mx-auto mt-5 max-w-2xl">
            See how BandForge mirrors examiner thinking: bands, sub-criteria, and
            concrete fixes side by side with your response.
          </p>
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-2 lg:items-stretch">
          <div className="bf-min-card flex flex-col p-6 sm:p-8">
            <p className="text-meta font-semibold uppercase tracking-wider text-ink/45">
              Your response · Task 2 (excerpt)
            </p>
            <div className="mt-4 flex-1 rounded-xl border border-border bg-white p-4 font-mono text-[0.8125rem] leading-relaxed text-ink/80">
              <p>
                In my opinion, technology has both advantages and disadvantages
                for young learners. On one hand, it provides access to resources
                that were not available before…
              </p>
            </div>
            <p className="mt-3 text-meta text-ink/50">
              Representative sample for illustration.
            </p>
          </div>

          <div className="bf-glow-teal relative flex flex-col overflow-hidden rounded-3xl border border-teal/20 bg-navy p-6 text-white sm:p-8">
            <div className="bf-grid-fine pointer-events-none absolute inset-0 opacity-25" />
            <div className="relative">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-lg bg-teal/20 px-3 py-1 text-body font-bold text-teal-light">
                  Overall writing · Band 6.5
                </span>
              </div>
              <ul className="mt-6 space-y-4 text-body leading-relaxed text-white/80">
                <li>
                  <span className="font-semibold text-teal-light">Grammar: </span>
                  Article omission before countable nouns in paragraph 2: impacts
                  GRA ceiling.
                </li>
                <li>
                  <span className="font-semibold text-teal-light">Lexical: </span>
                  Some repetition of “advantages / disadvantages”; swap in precise
                  collocations (e.g. “cognitive load”, “screen time”).
                </li>
                <li>
                  <span className="font-semibold text-teal-light">Cohesion: </span>
                  Add clearer topic sentences; “On one hand” works: link back to
                  thesis explicitly in the conclusion.
                </li>
              </ul>
              <div className="mt-8 flex flex-wrap gap-2">
                {["+0.5 CC potential", "TR on track", "15 min rewrite drill"].map(
                  (t) => (
                    <span
                      key={t}
                      className="rounded-md border border-white/15 bg-white/5 px-2.5 py-1 text-meta font-medium text-white/85"
                    >
                      {t}
                    </span>
                  ),
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
