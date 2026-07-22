const stats = [
  { valueMobile: "15 min", valueDesktop: "15 minutes", label: "Free diagnostic" },
  { valueMobile: "48 hrs", valueDesktop: "48 hours", label: "Band 9 review" },
  { valueMobile: "From ₹999", valueDesktop: "From ₹999", label: "Skill sprints" },
] as const;

/** Full-width stats strip below the hero. */
export function BandForgeStatsBar() {
  return (
    <section
      aria-label="BandForge highlights"
      className="border-y border-border-soft bg-surface-alt"
    >
      <div className="bf-container">
        <div className="flex items-stretch py-0 lg:py-[26px]">
        {stats.map((stat, i) => (
          <div key={stat.label} className="flex flex-1 items-stretch">
            {i > 0 ? (
              <span className="w-px shrink-0 bg-border-muted" aria-hidden />
            ) : null}
            <div className="flex flex-1 flex-col items-center justify-center px-1 py-[14px] text-center sm:flex-row sm:gap-[11px] sm:px-2 sm:py-[18px] sm:text-left lg:flex-row lg:gap-[11px] lg:px-0 lg:py-0">
              <p className="font-display text-[0.8125rem] leading-tight font-bold text-navy sm:text-[0.9375rem] lg:text-[1.1875rem]">
                <span className="lg:hidden">{stat.valueMobile}</span>
                <span className="hidden lg:inline">{stat.valueDesktop}</span>
              </p>
              <p className="mt-0.5 text-[0.6875rem] text-muted-light lg:mt-0 lg:text-sm">
                {stat.label}
              </p>
            </div>
          </div>
        ))}
        </div>
      </div>
    </section>
  );
}
