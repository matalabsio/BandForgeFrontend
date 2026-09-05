const PULSE = "animate-pulse bg-ink/[0.06]";

/** Shared pulse class for BandForge plan / practice placeholders. */
export const bfPlanPulseClass = PULSE;

/** Today's plan–shaped skeleton (skill stacks + task rows). */
export function TodaysPlanSkeleton({
  label = "Loading today’s plan",
}: {
  label?: string;
} = {}) {
  return (
    <div className="space-y-6" aria-busy="true" aria-label={label}>
      <div className="space-y-2">
        <div className={`h-3 w-28 rounded ${PULSE}`} />
        <div className={`h-8 w-48 max-w-full rounded-lg ${PULSE}`} />
        <div className={`h-4 w-72 max-w-full rounded ${PULSE}`} />
      </div>
      <div className="space-y-5 rounded-2xl border border-border-soft bg-white p-4 sm:p-5">
        <div className={`h-3 w-56 max-w-full rounded ${PULSE}`} />
        {Array.from({ length: 3 }, (_, stack) => (
          <div key={stack} className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div className={`h-4 w-24 rounded ${PULSE}`} />
              <div className={`h-3 w-14 rounded ${PULSE}`} />
            </div>
            {Array.from({ length: stack === 0 ? 3 : 2 }, (_, row) => (
              <div
                key={row}
                className="flex items-center gap-3 rounded-xl border border-border-soft px-3 py-3 sm:px-4"
              >
                <div className={`size-5 shrink-0 rounded ${PULSE}`} />
                <div className={`size-9 shrink-0 rounded-lg ${PULSE}`} />
                <div className="min-w-0 flex-1 space-y-2">
                  <div className={`h-4 w-40 max-w-full rounded ${PULSE}`} />
                  <div className={`h-3 w-16 rounded ${PULSE}`} />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/** Full plan calendar–shaped skeleton (header + month grid). */
export function FullPlanCalendarSkeleton({
  label = "Loading your full plan",
}: {
  label?: string;
} = {}) {
  return (
    <div className="space-y-5 pb-16" aria-busy="true" aria-label={label}>
      <div className="space-y-2 max-w-xl">
        <div className={`h-3 w-28 rounded ${PULSE}`} />
        <div className={`h-8 w-40 max-w-full rounded-lg ${PULSE}`} />
        <div className={`h-4 w-72 max-w-full rounded ${PULSE}`} />
      </div>
      <div className="rounded-[28px] border border-white/60 bg-white/55 p-4 shadow-[0_8px_40px_rgba(8,145,178,0.08)] backdrop-blur-xl sm:p-6">
        <div className={`mx-auto mb-4 h-5 w-36 rounded ${PULSE}`} />
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {Array.from({ length: 7 }, (_, i) => (
            <div key={`hdr-${i}`} className={`h-3 rounded ${PULSE}`} />
          ))}
          {Array.from({ length: 35 }, (_, i) => (
            <div
              key={`cell-${i}`}
              className={`aspect-square rounded-xl border border-border-soft/60 ${PULSE}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/** Thin “opening session” strip — no video block, for plan → MT redirects. */
export function PlanOpeningSkeleton({
  label = "Opening practice…",
}: {
  label?: string;
} = {}) {
  return (
    <div className="space-y-5" aria-busy="true" aria-label={label}>
      <div className={`h-3 w-32 rounded ${PULSE}`} />
      <div className={`h-7 w-52 max-w-full rounded-lg ${PULSE}`} />
      <div className="space-y-3 rounded-2xl border border-border-soft bg-white p-5">
        <div className={`h-4 w-3/4 max-w-md rounded ${PULSE}`} />
        <div className={`h-3 w-full rounded ${PULSE}`} />
        <div className={`h-3 w-5/6 rounded ${PULSE}`} />
        <div className={`mt-4 h-32 w-full rounded-xl ${PULSE}`} />
      </div>
      <p className="text-sm text-muted">{label}</p>
    </div>
  );
}
