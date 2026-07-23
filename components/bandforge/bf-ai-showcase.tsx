export function BandForgeAiShowcase() {
  return (
    <section id="evaluation" className="bf-section bg-white/20">
      <div className="bf-container">
        <div className="mx-auto max-w-3xl text-center">
          <p className="bf-eyebrow">AI evaluation</p>
          <h2 className="font-display mt-3 text-[1.625rem] leading-[1.1] font-bold tracking-[-0.025em] text-balance text-navy sm:text-[2rem] sm:leading-[1.08] lg:text-[2.375rem]">
            Detailed feedback in seconds, not days.
          </h2>
          <p className="bf-copy mx-auto mt-5 max-w-2xl">
            Bands, sub-criteria, and concrete fixes — examiner-style feedback
            beside your response.
          </p>
        </div>

        <div className="mt-8 grid gap-5 sm:mt-12 md:grid-cols-2 lg:items-stretch">
          <div className="bf-min-card flex flex-col p-6 sm:p-8">
            <p className="text-meta font-semibold uppercase tracking-wider text-ink/45">
              Your response · Task 2
            </p>
            <p className="mt-4 flex-1 rounded-xl border border-border bg-white p-3.5 font-mono text-[0.75rem] leading-relaxed text-ink/80 sm:p-4 sm:text-[0.8125rem]">
              Technology has both advantages and disadvantages for young
              learners. It provides access to resources that were not available
              before…
            </p>
          </div>

          <div className="bf-glow-teal relative flex flex-col overflow-hidden rounded-3xl border border-teal/20 bg-navy p-6 text-white sm:p-8">
            <div className="relative">
              <span className="inline-block rounded-lg bg-teal/20 px-3 py-1 text-body font-bold text-teal-light">
                Overall writing · Band 6.5
              </span>
              <ul className="mt-6 space-y-3 text-body leading-relaxed text-white/80">
                <li>
                  <span className="font-semibold text-teal-light">Grammar: </span>
                  Article omission before countable nouns — impacts GRA ceiling.
                </li>
                <li>
                  <span className="font-semibold text-teal-light">Lexical: </span>
                  Replace repeated “advantages / disadvantages” with precise
                  collocations.
                </li>
                <li>
                  <span className="font-semibold text-teal-light">Cohesion: </span>
                  Clearer topic sentences; link conclusion back to the thesis.
                </li>
              </ul>
              <div className="mt-6 flex flex-wrap gap-2">
                {["+0.5 CC potential", "TR on track", "15 min rewrite"].map(
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
