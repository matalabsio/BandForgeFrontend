const features = [
  {
    title: "Real IELTS simulation",
    benefit: "Same pressure, pacing, and layout DNA as the real computer-delivered test.",
    preview: "mock",
  },
  {
    title: "AI writing evaluation",
    benefit: "Task achievement, cohesion, lexical resource, and grammar — in seconds.",
    preview: "writing",
  },
  {
    title: "Speaking analysis",
    benefit: "Fluency, pronunciation, and discourse markers with AI + human review.",
    preview: "wave",
  },
  {
    title: "Weak area detection",
    benefit: "Know exactly which sub-skills drag your overall band — then drill them.",
    preview: "radar",
  },
  {
    title: "Instant Reading & Listening",
    benefit: "Objective keys and band estimates without waiting days for results.",
    preview: "bars",
  },
  {
    title: "Personalised practice",
    benefit: "Recommendations that adapt after every mock — not generic worksheets.",
    preview: "list",
  },
] as const;

function FeaturePreview({ type }: { type: (typeof features)[number]["preview"] }) {
  if (type === "mock") {
    return (
      <div className="mt-5 rounded-2xl border border-border bg-surface/70 p-3">
        <div className="flex justify-between text-[0.625rem] font-medium text-ink/50">
          <span>Q 18 / 40</span>
          <span className="font-mono text-cyan">42:10</span>
        </div>
        <div className="mt-2 h-1.5 rounded-full bg-border">
          <div className="h-full w-[45%] rounded-full bg-navy" />
        </div>
      </div>
    );
  }
  if (type === "writing") {
    return (
      <div className="mt-4 space-y-1.5 rounded-lg border border-border bg-surface p-2.5">
        {["TR", "CC", "LR", "GRA"].map((x, i) => (
          <div key={x} className="flex items-center gap-2">
            <span className="w-8 text-[0.625rem] font-bold text-ink/45">{x}</span>
            <div className="h-1.5 flex-1 rounded-full bg-border">
              <div
                className="h-full rounded-full bg-teal"
                style={{ width: `${[78, 65, 82, 70][i]}%` }}
              />
            </div>
            <span className="text-[0.625rem] font-semibold text-navy">
              {["7", "6.5", "7", "6.5"][i]}
            </span>
          </div>
        ))}
      </div>
    );
  }
  if (type === "wave") {
    return (
      <div className="mt-4 flex h-16 items-end justify-between gap-px rounded-lg border border-border bg-surface px-1 pb-1 pt-2">
        {Array.from({ length: 24 }).map((_, i) => (
          <div
            key={i}
            className="w-0.5 rounded-full bg-cyan/80"
            style={{ height: `${20 + ((i * 17) % 55)}%` }}
          />
        ))}
      </div>
    );
  }
  if (type === "radar") {
    return (
      <div className="mt-4 flex h-20 items-center justify-center rounded-lg border border-border bg-surface">
        <svg viewBox="0 0 100 100" className="size-16 text-cyan-soft" aria-hidden>
          <polygon
            fill="currentColor"
            points="50,8 88,38 72,88 28,88 12,38"
            className="text-cyan-soft"
          />
          <polygon
            fill="rgb(0 188 212 / 0.35)"
            stroke="rgb(0 188 212)"
            strokeWidth="1"
            points="50,22 74,42 64,74 36,74 26,42"
          />
        </svg>
      </div>
    );
  }
  if (type === "bars") {
    return (
      <div className="mt-4 flex h-20 items-end justify-center gap-2 rounded-lg border border-border bg-surface px-3 pb-2">
        {[40, 65, 50, 78, 55].map((h, i) => (
          <div
            key={i}
            className="w-3 rounded-sm bg-gradient-to-t from-teal to-cyan"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
    );
  }
  return (
    <div className="mt-5 space-y-1.5 rounded-2xl border border-border bg-surface/70 p-3">
      {["Fluency drill", "Cohesion pack", "Academic collocations"].map((t, i) => (
        <div
          key={t}
          className="flex items-center gap-2 rounded border border-transparent bg-white px-2 py-1.5 text-[0.625rem] font-medium text-ink/70"
        >
          <span className="size-1.5 rounded-full bg-cyan" />
          {t}
          {i === 0 ? (
            <span className="ml-auto text-xs text-teal">Next</span>
          ) : null}
        </div>
      ))}
    </div>
  );
}

export function BandForgeFeatures() {
  return (
    <section id="features" className="bf-section bg-cyan-soft/30">
      <div className="bf-container">
        <div className="mx-auto max-w-3xl text-center">
          <p className="bf-eyebrow">Content library</p>
          <h2 className="bf-section-title mt-3 text-balance">
            Practice modules for every IELTS skill
          </h2>
          <p className="bf-copy mx-auto mt-5 max-w-2xl">
            Listening, Reading, Writing, and Speaking — structured lessons with
            progress tracking on desktop and mobile.
          </p>
        </div>

        <ul className="mt-8 grid gap-4 sm:mt-12 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
          {features.map((f) => (
            <li
              key={f.title}
              className="bf-min-card bf-card-hover flex flex-col border-t-4 border-t-teal p-5 transition-transform duration-200 hover:-translate-y-0.5 motion-reduce:transform-none sm:p-6"
            >
              <h3 className="text-lg font-bold text-black">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                {f.benefit}
              </p>
              <FeaturePreview type={f.preview} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
