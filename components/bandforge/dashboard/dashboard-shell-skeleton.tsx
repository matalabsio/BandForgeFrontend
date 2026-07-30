import { BandForgeLogoLink } from "@/components/bandforge/bandforge-logo-link";

const PULSE = "animate-pulse bg-ink/[0.06]";

/** Lightweight main-area placeholders inside the app shell. */
function DashboardShellMainSkeleton() {
  return (
    <div className="space-y-6">
      <div className={`h-14 rounded-2xl ${PULSE}`} />
      <div className={`h-40 rounded-[20px] ${PULSE}`} />
      <div className="grid gap-4 sm:grid-cols-2">
        <div className={`h-24 rounded-[20px] ${PULSE}`} />
        <div className={`h-24 rounded-[20px] ${PULSE}`} />
      </div>
      <div className={`h-48 rounded-[20px] ${PULSE}`} />
    </div>
  );
}

/**
 * Full app shell loading state — mirrors DashboardShell dimensions (sidebar closed).
 * Used during (app) layout load and bootstrap session restore.
 */
export function DashboardAppShellSkeleton() {
  return (
    <div
      className="bf-dashboard relative min-h-dvh bg-surface text-ink"
      aria-busy="true"
    >
      <span className="sr-only">Loading BandForge…</span>

      <div className="flex min-h-dvh flex-col">
        <header className="sticky top-0 z-20 border-b border-ink/8 bg-white/95 backdrop-blur-md">
          <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
            <div
              className={`size-10 shrink-0 rounded-xl lg:hidden ${PULSE}`}
              aria-hidden
            />
            <div
              className={`hidden size-10 shrink-0 rounded-xl lg:block ${PULSE}`}
              aria-hidden
            />
            <BandForgeLogoLink href="/dashboard" size="sm" className="min-w-0 flex-1" priority />
            <div className="flex shrink-0 items-center gap-2">
              <div className={`size-9 rounded-full ${PULSE}`} aria-hidden />
              <div className={`size-9 rounded-full ${PULSE}`} aria-hidden />
              <div className={`h-9 w-16 rounded-xl ${PULSE}`} aria-hidden />
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 pb-20 sm:px-6 sm:py-8 lg:px-8 lg:pb-10">
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

/** Loading placeholder for dashboard and profile RSC routes. */
export function DashboardContentSkeleton() {
  return (
    <div className="bf-dash-enter mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
      <div className={`h-8 w-48 rounded-lg ${PULSE}`} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className={`h-24 rounded-[20px] ${PULSE}`} />
        ))}
      </div>
      <div className={`h-64 rounded-[20px] ${PULSE}`} />
      <div className={`h-40 rounded-[20px] ${PULSE}`} />
    </div>
  );
}
