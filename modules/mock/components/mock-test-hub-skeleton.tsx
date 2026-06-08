import { IELTS_EXAM_VARS } from "@/components/exam/ielts-exam-theme";

function Pulse({ className }: { className: string }) {
  return <div className={`animate-pulse rounded bg-[var(--exam-border)] ${className}`} />;
}

export function MockTestHubSkeleton() {
  return (
    <div
      className="ielts-exam-theme min-h-dvh bg-[#eef2f6] text-[var(--exam-ink)]"
      style={IELTS_EXAM_VARS}
    >
      <header className="sticky top-0 z-20 border-b border-[var(--exam-border)] bg-white shadow-sm">
        <div className="mx-auto flex h-11 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <Pulse className="h-5 w-12" />
            <Pulse className="h-4 w-24" />
          </div>
          <Pulse className="h-3 w-28" />
        </div>
      </header>

      <main className="px-4 py-6 sm:px-6 sm:py-8">
        <div className="mx-auto max-w-6xl animate-pulse space-y-6">
          <header className="space-y-2">
            <Pulse className="h-7 w-48 sm:h-8 sm:w-56" />
            <Pulse className="h-4 w-full max-w-xl" />
            <Pulse className="h-4 w-4/5 max-w-lg" />
          </header>

          <div className="-mx-1 flex gap-3 overflow-hidden px-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-[132px] w-[148px] shrink-0 rounded-xl border border-[var(--exam-border)] bg-white p-3.5 sm:w-auto sm:flex-1"
              >
                <div className="flex justify-between">
                  <Pulse className="size-7 rounded-lg" />
                  {i === 0 ? <Pulse className="h-3 w-10" /> : null}
                </div>
                <Pulse className="mt-3 h-4 w-16" />
                <Pulse className="mt-1 h-3 w-full" />
                <Pulse className="mt-auto pt-6 h-3 w-10" />
              </div>
            ))}
          </div>

          <div className="overflow-hidden rounded-2xl border border-[var(--exam-border)] bg-white shadow-sm">
            <div className="border-b border-[var(--exam-border)] px-5 py-5 sm:px-6">
              <Pulse className="h-3 w-14" />
              <Pulse className="mt-2 h-6 w-56" />
              <Pulse className="mt-2 h-3 w-32" />
              <Pulse className="mt-4 h-1.5 w-full rounded-full" />
            </div>
            <div className="space-y-4 p-5 sm:p-6">
              <Pulse className="h-4 w-28" />
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Pulse key={i} className="h-10 w-full" />
                ))}
              </div>
              <div className="flex gap-3 pt-1">
                <Pulse className="h-11 w-36 rounded-xl" />
                <Pulse className="h-11 w-28 rounded-xl" />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Pulse className="h-4 w-20" />
            <div className="grid gap-3 sm:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Pulse key={i} className="h-[140px] rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
