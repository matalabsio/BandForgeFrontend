const traditional = [
  "Sell a full course before measuring where you stand",
  "Batch lectures with delayed, generic feedback",
  "High fees for classroom bundles you may not need",
  "Limited individual work review on Writing and Speaking",
] as const;

const bandforge = [
  "Free 15-minute diagnostic first — section-wise bands",
  "Targeted Full Skill Program (Rs. 2499) — all four skills until exam day",
  "AI instantly plus Band 9 human review within 48 hours",
  "12 tasks over 90 days, mock on completion, Completion Guarantee",
] as const;

export function BandForgeComparison() {
  return (
    <section id="why" className="bf-section bg-white/70">
      <div className="bf-container">
        <div className="mx-auto max-w-3xl text-center">
          <p className="bf-eyebrow">
            Why BandForge
          </p>
          <h2 className="font-display mt-3 text-[1.625rem] leading-[1.1] font-bold tracking-[-0.025em] text-balance text-navy sm:text-[2rem] sm:leading-[1.08] sm:tracking-[-0.03em] lg:text-[2.375rem]">
            Measure first. Train only what you need.
          </h2>
        </div>

        <div className="mt-10 grid gap-5 sm:mt-12 sm:grid-cols-2 lg:grid-cols-2">
          <div className="bf-min-card p-6 sm:p-8">
            <h3 className="text-h4 text-ink/50">Traditional coaching</h3>
            <ul className="mt-6 space-y-3">
              {traditional.map((t) => (
                <li
                  key={t}
                  className="flex gap-3 text-body leading-relaxed text-ink/60"
                >
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-ink/25" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="bf-glow-teal relative overflow-hidden rounded-3xl border border-teal/25 bg-navy p-6 text-white sm:p-8">
            <div className="bf-grid-fine absolute inset-0 opacity-20" aria-hidden />
            <div className="relative">
              <h3 className="text-h4 text-white">BandForge</h3>
              <ul className="mt-6 space-y-3">
                {bandforge.map((t) => (
                  <li
                    key={t}
                    className="flex gap-3 text-body leading-relaxed text-white/85"
                  >
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-teal-light shadow-[0_0_8px_#00bcd4]" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
