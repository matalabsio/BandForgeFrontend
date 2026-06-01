const blocks = [
  {
    title: "AI Writing evaluation",
    body: "Criterion-level bands, grammar patterns, and rewrite prompts — before you book another coaching hour.",
    visual: "writing",
  },
  {
    title: "Speaking analysis",
    body: "Fluency, pronunciation, and discourse markers with AI plus human review on flagged responses.",
    visual: "speak",
  },
  {
    title: "Band score reports",
    body: "Overall and skill bands with trend lines so you see whether practice is moving the needle.",
    visual: "report",
  },
  {
    title: "Weak-area insights",
    body: "Automatic tagging of sub-skills that cap your score — then drill with targeted sets.",
    visual: "weak",
  },
  {
    title: "Personalised recommendations",
    body: "What to study next, based on your last mock — not a static PDF syllabus.",
    visual: "reco",
  },
] as const;

function MiniVisual({ type }: { type: (typeof blocks)[number]["visual"] }) {
  if (type === "writing") {
    return (
      <div className="mt-4 space-y-2 rounded-xl border border-border bg-surface p-3">
        {["TR", "CC", "LR", "GRA"].map((x, i) => (
          <div key={x} className="flex items-center gap-2">
            <span className="w-7 text-[0.625rem] font-bold text-ink/40">{x}</span>
            <div className="h-1.5 flex-1 rounded-full bg-border">
              <div
                className="h-full rounded-full bg-teal"
                style={{ width: `${[82, 68, 75, 64][i]}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    );
  }
  if (type === "speak") {
    return (
      <div className="mt-4 flex h-20 items-end justify-between gap-px rounded-xl border border-border bg-surface px-1 pb-1 pt-2">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="w-0.5 rounded-full bg-gradient-to-t from-teal/30 to-teal"
            style={{ height: `${18 + ((i * 13) % 55)}%` }}
          />
        ))}
      </div>
    );
  }
  if (type === "report") {
    return (
      <div className="mt-4 rounded-xl border border-border bg-surface p-3">
        <div className="flex items-end justify-between gap-1">
          {[38, 62, 48, 72].map((h, i) => (
            <div key={i} className="flex flex-1 flex-col items-center gap-1">
              <div
                className="w-full max-w-[2rem] rounded-t bg-gradient-to-t from-navy to-teal"
                style={{ height: `${h}px` }}
              />
              <span className="text-[0.625rem] font-medium text-ink/45">
                {["R", "L", "W", "S"][i]}
              </span>
            </div>
          ))}
        </div>
        <p className="mt-2 text-center text-h4 font-bold text-navy">6.5 → 7.0</p>
        <p className="text-center text-meta text-ink/50">4-week trend (illustrative)</p>
      </div>
    );
  }
  if (type === "weak") {
    return (
      <div className="mt-4 space-y-2 rounded-xl border border-border bg-surface p-3">
        {[
          { t: "Article accuracy", s: "high impact" },
          { t: "Lexical paraphrase", s: "medium" },
        ].map((row) => (
          <div
            key={row.t}
            className="flex items-center justify-between rounded-lg border border-amber-500/20 bg-amber-500/5 px-2 py-1.5"
          >
            <span className="text-[0.6875rem] font-medium text-navy">{row.t}</span>
            <span className="text-[0.625rem] font-semibold uppercase tracking-wide text-amber-700">
              {row.s}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="mt-4 space-y-2 rounded-xl border border-border bg-surface p-3">
      {["Cohesion pack · 12 min", "Speaking shadow · 8 min"].map((t) => (
        <div
          key={t}
          className="flex items-center justify-between rounded-lg bg-white px-2 py-2 text-[0.6875rem] font-medium text-ink/75 shadow-[var(--shadow-soft)]"
        >
          {t}
          <span className="text-meta text-teal">Start</span>
        </div>
      ))}
    </div>
  );
}

export function BandForgePreviewsGallery() {
  return (
    <section
      id="previews"
      className="bf-section border-y border-border/70 bg-white/70"
    >
      <div className="bf-container">
        <div className="mx-auto max-w-3xl text-center">
          <p className="bf-eyebrow">
            AI evaluation demo
          </p>
          <h2 className="bf-section-title mt-3">
            See what you get before you sign in.
          </h2>
          <p className="bf-copy mx-auto mt-5 max-w-2xl">
            Realistic IELTS simulation, instant objective scores, and faster
            improvement loops, all designed mobile-first for students who cannot
            rely on expensive coaching alone.
          </p>
        </div>

        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
          {blocks.map((b) => (
            <li
              key={b.title}
              className="bf-min-card flex flex-col p-6"
            >
              <h3 className="text-h4 text-navy">{b.title}</h3>
              <p className="mt-2 flex-1 text-body leading-relaxed text-ink/65">
                {b.body}
              </p>
              <MiniVisual type={b.visual} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
