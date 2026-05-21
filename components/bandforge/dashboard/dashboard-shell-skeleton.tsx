import { DashboardBackground } from "@/components/bandforge/dashboard/dashboard-background";

function Pulse({ className }: { className: string }) {
  return (
    <div
      className={`animate-pulse rounded-2xl bg-[#0F172A]/[0.06] ${className}`}
    />
  );
}

export function DashboardShellSkeleton({
  children,
}: {
  children?: React.ReactNode;
}) {
  return (
    <div className="bf-dash relative min-h-dvh text-[#0F172A]">
      <DashboardBackground />

      <aside
        className="fixed left-4 top-4 z-40 hidden h-[calc(100dvh-2rem)] w-[72px] flex-col items-center rounded-[24px] border border-white/60 bg-white/70 py-5 shadow-[0_10px_40px_rgba(15,23,42,0.08)] backdrop-blur-xl lg:flex xl:left-6 xl:w-[220px]"
        aria-hidden
      >
        <Pulse className="h-10 w-10 rounded-2xl" />
        <div className="mt-8 flex flex-1 flex-col gap-2">
          <Pulse className="h-12 w-full" />
          <Pulse className="h-12 w-full" />
        </div>
      </aside>

      <div className="lg:pl-[100px] xl:pl-[248px]">
        <header className="sticky top-0 z-30 border-b border-white/50 bg-white/60 backdrop-blur-xl">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
            <Pulse className="h-10 w-10 lg:hidden" />
            <Pulse className="h-6 w-28 lg:hidden" />
            <Pulse className="hidden h-4 w-24 lg:block" />
            <Pulse className="h-9 w-24" />
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
          {children ?? <DashboardContentSkeleton />}
        </main>
      </div>

      <nav
        className="fixed bottom-0 left-0 right-0 z-30 flex items-center justify-around border-t border-white/60 bg-white/85 px-2 py-2 backdrop-blur-xl lg:hidden"
        aria-hidden
      >
        <Pulse className="h-12 w-16" />
        <Pulse className="h-12 w-16" />
        <Pulse className="h-12 w-16" />
      </nav>
      <div className="h-16 lg:hidden" aria-hidden />
    </div>
  );
}

export function DashboardContentSkeleton() {
  return (
    <div className="space-y-8" aria-busy="true" aria-label="Loading dashboard">
      <Pulse className="h-48 w-full rounded-[32px]" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <Pulse key={i} className="h-28 w-full rounded-[18px]" />
        ))}
      </div>
      <Pulse className="h-36 w-full rounded-[28px]" />
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <Pulse className="h-64 w-full rounded-[24px]" />
        <Pulse className="h-64 w-full rounded-[24px]" />
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Pulse className="h-56 w-full rounded-[24px]" />
        <Pulse className="h-56 w-full rounded-[24px]" />
      </div>
    </div>
  );
}
