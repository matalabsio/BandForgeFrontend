const stats = [
  { value: "Band 9", label: "Trainer" },
  { value: "AI-Evaluated", label: "Writing" },
  { value: "10,000+", label: "Questions" },
] as const;

/** Full-width stats strip below the hero — always a single row. */
export function BandForgeStatsBar() {
  return (
    <section
      aria-label="BandForge highlights"
      className="relative z-10 -mt-1 border-y border-border-soft bg-surface-alt sm:-mt-2"
    >
      <div className="bf-container">
        <div className="flex flex-row items-stretch justify-center divide-x divide-border-muted py-2.5 sm:py-[26px]">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 px-1.5 text-center sm:gap-1 sm:px-4 lg:flex-row lg:gap-[11px]"
            >
              <p className="font-display text-[0.8125rem] leading-tight font-bold text-navy sm:text-[1.0625rem] lg:text-[1.1875rem]">
                {stat.value}
              </p>
              <p className="text-[0.6875rem] leading-tight text-muted-light sm:text-sm">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
