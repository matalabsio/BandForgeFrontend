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
          <span className="font-mono text-teal">42:10</span>
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
            className="w-0.5 rounded-full bg-teal/80"
            style={{ height: `${20 + ((i * 17) % 55)}%` }}
          />
        ))}
      </div>
    );
  }
  if (type === "radar") {
    return (
      <div className="mt-4 flex h-20 items-center justify-center rounded-lg border border-border bg-surface">
        <svg viewBox="0 0 100 100" className="h-16 w-16 text-teal/30" aria-hidden>
          <polygon
            fill="currentColor"
            points="50,8 88,38 72,88 28,88 12,38"
            className="text-teal/15"
          />
          <polygon
            fill="rgb(0 151 167 / 0.35)"
            stroke="rgb(0 151 167)"
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
            className="w-3 rounded-sm bg-gradient-to-t from-navy to-teal"
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
          <span className="h-1.5 w-1.5 rounded-full bg-teal" />
          {t}
          {i === 0 ? (
            <span className="ml-auto text-meta text-teal">Next</span>
          ) : null}
        </div>
      ))}
    </div>
  );
}

export function BandForgeFeatures() {
  return (
    <section
      id="features"
      className="bf-section bg-white/30"
    >
      <div className="bf-container">
        <div className="mx-auto max-w-3xl text-center">
          <p className="bf-eyebrow">
            Core product
          </p>
          <h2 className="bf-section-title mt-3">
            Everything you need to close the gap to your target band.
          </h2>
          <p className="bf-copy mx-auto mt-5 max-w-2xl">
            One platform for full mocks, granular AI feedback, and practice that
            respects how you actually study — especially on your phone.
          </p>
        </div>

        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
          {features.map((f) => (
            <li
              key={f.title}
              className="bf-min-card bf-card-hover flex flex-col p-6 transition-transform duration-200 hover:-translate-y-0.5 motion-reduce:transform-none"
            >
              <h3 className="text-h4 text-navy">{f.title}</h3>
              <p className="mt-2 text-body leading-relaxed text-ink/65">
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
