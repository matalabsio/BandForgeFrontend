import { BandForgeLogoLink } from "@/components/bandforge/bandforge-logo-link";

const PULSE = "animate-pulse bg-ink/[0.06]";

/** Mirrors DashboardTopHeader (greeting card + report / account). */
function DashboardTopHeaderSkeleton() {
  return (
    <div className="rounded-2xl border border-ink/[0.06] bg-white/80 px-3 py-2.5 sm:px-4">
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="min-w-0 flex-1 space-y-1">
          <div className={`h-2.5 w-16 rounded ${PULSE}`} />
          <div className={`h-6 w-28 rounded-md sm:w-36 ${PULSE}`} />
          <div className={`h-3 w-24 rounded sm:w-28 ${PULSE}`} />
        </div>
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <div className={`hidden h-10 w-[9.75rem] rounded-xl sm:block lg:w-[10.5rem] ${PULSE}`} />
          <div className={`h-9 w-[4.25rem] rounded-xl sm:h-10 sm:w-[7rem] ${PULSE}`} />
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
    <div className="space-y-5 sm:space-y-6">
      <DashboardTopHeaderSkeleton />
      <div className="grid gap-5 sm:gap-6 md:grid-cols-2">
        <div className={`h-52 rounded-[24px] sm:h-56 ${PULSE}`} />
        <div className={`h-52 rounded-[24px] sm:h-56 ${PULSE}`} />
      </div>
      <div className="grid gap-5 sm:gap-6 md:grid-cols-2">
        <div className={`h-52 rounded-[24px] ${PULSE}`} />
        <div className={`h-52 rounded-[24px] ${PULSE}`} />
      </div>
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
      className="bf-dashboard relative min-h-dvh text-ink"
      aria-busy="true"
    >
      <span className="sr-only">Loading BandForge…</span>

      <div className="flex min-h-dvh flex-col">
        <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b border-ink/8 bg-white/95 px-4 backdrop-blur-md sm:px-6">
          <BandForgeLogoLink href="/dashboard" size="sm" className="min-w-0 flex-1" priority />
          <div className={`size-9 shrink-0 rounded-full ${PULSE}`} aria-hidden />
        </header>

        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 pb-[calc(4.5rem+env(safe-area-inset-bottom))] sm:px-6 lg:px-8 lg:py-8 lg:pb-10">
          <DashboardShellMainSkeleton />
        </main>
      </div>

      <nav
        className="fixed right-0 bottom-0 left-0 z-20 grid grid-cols-5 border-t border-border-soft bg-white/95 px-1 pt-1.5 pb-[max(0.35rem,env(safe-area-inset-bottom))] lg:hidden"
        aria-hidden
      >
        {Array.from({ length: 5 }, (_, i) => (
          <div
            key={i}
            className="flex min-h-[48px] flex-col items-center justify-center gap-1.5"
          >
            <div className={`size-5 rounded-md ${PULSE}`} />
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
    <div className="bf-dash-enter space-y-5 sm:space-y-6">
      <DashboardTopHeaderSkeleton />
      <div className="grid gap-5 sm:gap-6 md:grid-cols-2">
        <div className={`h-52 rounded-[24px] sm:h-56 ${PULSE}`} />
        <div className={`h-52 rounded-[24px] sm:h-56 ${PULSE}`} />
      </div>
      <div className="grid gap-5 sm:gap-6 md:grid-cols-2">
        <div className={`h-52 rounded-[24px] ${PULSE}`} />
        <div className={`h-52 rounded-[24px] ${PULSE}`} />
      </div>
    </div>
  );
}
