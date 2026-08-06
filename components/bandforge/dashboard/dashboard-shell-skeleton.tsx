import { BandForgeLogoLink } from "@/components/bandforge/bandforge-logo-link";

const PULSE = "animate-pulse bg-ink/[0.06]";

/** Mirrors DashboardTopHeader (greeting card + streak / report / account). */
function DashboardTopHeaderSkeleton() {
  return (
    <div className="rounded-[22px] border border-ink/[0.06] bg-white/80 p-4 sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 space-y-2">
          <div className={`h-3 w-20 rounded ${PULSE}`} />
          <div className={`h-8 w-40 max-w-full rounded-lg sm:h-9 sm:w-48 ${PULSE}`} />
          <div className={`h-4 w-52 max-w-[90%] rounded ${PULSE}`} />
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <div className={`h-10 w-[5.5rem] rounded-xl ${PULSE}`} />
          <div className={`h-10 w-[7rem] rounded-xl ${PULSE}`} />
          <div className={`size-10 rounded-xl ${PULSE}`} />
          <div className={`h-10 w-10 rounded-xl sm:w-32 ${PULSE}`} />
        </div>
      </div>
    </div>
  );
}

/**
 * Main-area placeholders inside the app shell (no outer padding — shell provides it).
 * Shaped like dashboard: top header → hero/paywall → section cards.
 */
function DashboardShellMainSkeleton() {
  return (
    <div className="space-y-6">
      <DashboardTopHeaderSkeleton />
      <div className={`h-52 rounded-[22px] sm:h-56 ${PULSE}`} />
      <div className="grid gap-3 sm:grid-cols-2">
        <div className={`h-36 rounded-2xl ${PULSE}`} />
        <div className={`h-36 rounded-2xl ${PULSE}`} />
      </div>
      <div className={`h-40 rounded-[20px] ${PULSE}`} />
    </div>
  );
}

/**
 * Full app shell loading state — mirrors DashboardShell with hideHeader
 * (dashboard / scores chrome: slim top bar + logo; profile controls live in content).
 * Used during auth bootstrap / continue before (app) layout mounts.
 */
export function DashboardAppShellSkeleton() {
  return (
    <div
      className="bf-dashboard relative min-h-dvh bg-surface text-ink"
      aria-busy="true"
    >
      <span className="sr-only">Loading BandForge…</span>

      <div className="flex min-h-dvh flex-col">
        <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b border-ink/8 bg-white/95 px-4 backdrop-blur-md sm:px-6">
          <div
            className={`size-10 shrink-0 rounded-xl border border-ink/10 ${PULSE}`}
            aria-hidden
          />
          <BandForgeLogoLink href="/dashboard" size="sm" className="min-w-0" priority />
        </header>

        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 pb-20 sm:px-6 lg:px-8 lg:py-8 lg:pb-10">
          <DashboardShellMainSkeleton />
        </main>
      </div>

      <nav
        className="fixed right-0 bottom-0 left-0 z-20 grid grid-cols-5 border-t border-border-soft bg-white px-2 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] lg:hidden"
        aria-hidden
      >
        {Array.from({ length: 5 }, (_, i) => (
          <div
            key={i}
            className="flex min-h-[44px] flex-col items-center justify-center gap-1.5"
          >
            <div className={`size-[23px] rounded-md ${PULSE}`} />
            <div className={`h-2 w-8 rounded ${PULSE}`} />
          </div>
        ))}
      </nav>
    </div>
  );
}

/** Loading placeholder for dashboard and profile RSC routes (inside DashboardShell). */
export function DashboardContentSkeleton() {
  return (
    <div className="bf-dash-enter space-y-6">
      <DashboardTopHeaderSkeleton />
      <div className={`h-52 rounded-[22px] sm:h-56 ${PULSE}`} />
      <div className="grid gap-3 sm:grid-cols-2">
        <div className={`h-36 rounded-2xl ${PULSE}`} />
        <div className={`h-36 rounded-2xl ${PULSE}`} />
      </div>
      <div className={`h-40 rounded-[20px] ${PULSE}`} />
    </div>
  );
}
