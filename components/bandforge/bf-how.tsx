const steps = [
  {
    n: "01",
    title: "Take a full mock",
    body: "Reading, Listening, Writing, Speaking — strict timers, authentic controls.",
  },
  {
    n: "02",
    title: "Get AI-powered evaluation",
    body: "Instant objective scores plus deep Writing analysis and Speaking insights.",
  },
  {
    n: "03",
    title: "Improve with targeted practice",
    body: "Weak-area maps and recommended drills — not one-size-fits-all PDFs.",
  },
] as const;

export function BandForgeHow() {
  return (
    <section id="how" className="bf-section bg-white/60">
      <div className="bf-container">
        <div className="mx-auto max-w-3xl text-center">
          <p className="bf-eyebrow">
            How it works
          </p>
          <h2 className="bf-section-title mt-3">
            From mock test to measurable band lift.
          </h2>
        </div>

        <ol className="mt-12 grid gap-4 lg:grid-cols-3 lg:gap-5">
          {steps.map((s) => (
            <li
              key={s.n}
              className="bf-min-card relative p-6 pt-9"
            >
              <span className="absolute left-6 top-0 inline-flex -translate-y-1/2 rounded-full border border-teal/20 bg-white px-3 py-1 text-meta font-bold text-teal shadow-[var(--shadow-soft)]">
                {s.n}
              </span>
              <h3 className="text-h4 text-navy">{s.title}</h3>
              <p className="mt-2 text-body leading-relaxed text-ink/70">{s.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
