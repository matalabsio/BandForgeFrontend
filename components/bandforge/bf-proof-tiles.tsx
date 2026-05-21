const tiles = [
  {
    value: "1,800+",
    label: "practice questions seeded",
    hint: "Across Reading, Listening, Writing, and Speaking content drafts.",
  },
  {
    value: "4 modules",
    label: "Listening live today",
    hint: "20 single-play audio questions with instant band + skill breakdown.",
  },
  {
    value: "Instant band",
    label: "no waiting on graders",
    hint: "Objective scoring on submit; AI writing + human-reviewed speaking next.",
  },
] as const;

export function BandForgeProofTiles() {
  return (
    <section
      id="proof"
      aria-label="BandForge proof points"
      className="scroll-mt-20 border-y border-border/70 bg-white/40 py-12 backdrop-blur sm:py-16"
    >
      <div className="bf-container">
        <div className="mx-auto max-w-3xl text-center">
          <p className="bf-eyebrow">Built for outcomes</p>
          <h2 className="mt-3 text-2xl font-bold tracking-tight text-navy sm:text-3xl">
            Why students stay through every mock.
          </h2>
        </div>
        <ul className="mt-8 grid gap-3 sm:mt-10 sm:grid-cols-3 sm:gap-4">
          {tiles.map((t) => (
            <li
              key={t.value}
              className="bf-min-card flex flex-col gap-1.5 p-5 sm:p-6"
            >
              <p className="font-display text-[1.625rem] font-bold leading-tight tracking-tight text-navy sm:text-3xl">
                {t.value}
              </p>
              <p className="text-meta font-semibold uppercase tracking-wider text-teal">
                {t.label}
              </p>
              <p className="mt-1 text-body leading-relaxed text-ink/65">
                {t.hint}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
