const PULSE = "animate-pulse bg-ink/[0.06]";

function Pulse({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-2xl bg-ink/[0.06] ${className}`} />;
}

function PageHeaderSkeleton() {
  return (
    <div className="space-y-2">
      <div className={`h-2.5 w-16 rounded ${PULSE}`} />
      <div className={`h-8 w-40 max-w-full rounded-lg ${PULSE}`} />
      <div className={`h-4 w-72 max-w-full rounded ${PULSE}`} />
    </div>
  );
}

/** Last-resort content placeholder — never the dashboard 6-card grid. */
export function GenericAppContentSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading">
      <PageHeaderSkeleton />
      <Pulse className="h-40 w-full" />
      <Pulse className="h-56 w-full" />
    </div>
  );
}

/** /streak — header, streak stats, calendar. */
export function StreakContentSkeleton() {
  return (
    <div
      className="mx-auto w-full max-w-4xl space-y-5 sm:space-y-6"
      aria-busy="true"
      aria-label="Loading streak"
    >
      <PageHeaderSkeleton />
      <div className="rounded-[24px] border border-ink/8 bg-white p-5 sm:p-6">
        <div className="grid gap-5 sm:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] sm:gap-6">
          <Pulse className="h-40 w-full sm:h-44" />
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-1 sm:gap-3">
            <Pulse className="h-16 w-full sm:h-[4.25rem]" />
            <Pulse className="h-16 w-full sm:h-[4.25rem]" />
            <Pulse className="h-16 w-full sm:h-[4.25rem]" />
          </div>
        </div>
      </div>
      <div className="rounded-[24px] border border-ink/8 bg-white p-4 sm:p-6">
        <div className={`mb-4 h-6 w-28 rounded-lg ${PULSE}`} />
        <Pulse className="h-44 w-full sm:h-52" />
      </div>
    </div>
  );
}

/** /content-library — title, featured banner, chips, lesson grid. */
export function LibraryContentSkeleton() {
  return (
    <div className="space-y-8" aria-busy="true" aria-label="Loading library">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <PageHeaderSkeleton />
        <Pulse className="hidden h-11 w-full max-w-xs lg:block" />
      </div>
      <Pulse className="h-44 w-full sm:h-52" />
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className={`h-9 w-20 rounded-full ${PULSE}`} />
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }, (_, i) => (
          <Pulse key={i} className="h-36 w-full" />
        ))}
      </div>
    </div>
  );
}

/** /profile — avatar card, settings rows, form. */
export function ProfileContentSkeleton() {
  return (
    <div
      className="mx-auto max-w-5xl space-y-6"
      aria-busy="true"
      aria-label="Loading profile"
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr] lg:items-start">
        <div className="rounded-2xl border border-border-soft bg-white p-6 sm:p-8">
          <div className="flex flex-col items-center">
            <div className={`size-20 rounded-full ${PULSE}`} />
            <div className={`mt-4 h-6 w-36 rounded-lg ${PULSE}`} />
            <div className={`mt-2 h-4 w-44 rounded ${PULSE}`} />
            <div className={`mt-2 h-4 w-40 rounded ${PULSE}`} />
          </div>
          <div className="mt-6 grid grid-cols-3 gap-4 border-t border-border-soft pt-6">
            {Array.from({ length: 3 }, (_, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <div className={`h-6 w-10 rounded ${PULSE}`} />
                <div className={`h-3 w-16 rounded ${PULSE}`} />
              </div>
            ))}
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }, (_, g) => (
            <div
              key={g}
              className="overflow-hidden rounded-2xl border border-border-soft bg-white"
            >
              <div className={`h-11 w-full border-b border-border-soft ${PULSE}`} />
              {Array.from({ length: 3 }, (_, r) => (
                <div
                  key={r}
                  className="flex items-center gap-3 border-b border-border-soft px-4 py-3 last:border-b-0"
                >
                  <div className={`size-8 shrink-0 rounded-lg ${PULSE}`} />
                  <div className={`h-4 flex-1 rounded ${PULSE}`} />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
      <Pulse className="h-64 w-full" />
    </div>
  );
}

/** /practice — title + 4 skill cards. */
export function PracticeHubSkeleton() {
  return (
    <div className="space-y-6 pb-2" aria-busy="true" aria-label="Loading practice">
      <PageHeaderSkeleton />
      <div className="grid gap-3 sm:grid-cols-2">
        {Array.from({ length: 4 }, (_, i) => (
          <div
            key={i}
            className="flex items-start gap-3.5 rounded-2xl border border-ink/8 bg-white px-4 py-4 sm:px-5"
          >
            <div className={`size-11 shrink-0 rounded-2xl ${PULSE}`} />
            <div className="min-w-0 flex-1 space-y-2 pt-0.5">
              <div className={`h-4 w-24 rounded ${PULSE}`} />
              <div className={`h-3 w-full max-w-[12rem] rounded ${PULSE}`} />
              <div className={`h-3 w-20 rounded ${PULSE}`} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** /plan — title, results strip, 3 plan cards. */
export function PlanSelectionSkeleton() {
  return (
    <div className="space-y-8" aria-busy="true" aria-label="Loading plans">
      <PageHeaderSkeleton />
      <Pulse className="h-36 w-full" />
      <div className="grid gap-5 lg:grid-cols-3">
        {Array.from({ length: 3 }, (_, i) => (
          <Pulse key={i} className="h-80 w-full" />
        ))}
      </div>
    </div>
  );
}

/**
 * /test — content-only mock hub (no exam chrome; DashboardShell already wraps).
 * Shape matches MockTestHubSkeleton’s inner main.
 */
export function TestHubContentSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading mock tests">
      <PageHeaderSkeleton />
      <div className="-mx-1 flex gap-3 overflow-hidden px-1">
        {Array.from({ length: 5 }, (_, i) => (
          <Pulse
            key={i}
            className="h-[132px] w-[148px] shrink-0 sm:w-auto sm:flex-1"
          />
        ))}
      </div>
      <Pulse className="h-64 w-full" />
      <div className="grid gap-3 sm:grid-cols-3">
        {Array.from({ length: 3 }, (_, i) => (
          <Pulse key={i} className="h-[140px] w-full" />
        ))}
      </div>
    </div>
  );
}
