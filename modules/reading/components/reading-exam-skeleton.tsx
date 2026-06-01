export function ReadingExamSkeleton() {
  return (
    <div className="flex min-h-[calc(100dvh-3rem)] flex-col animate-pulse">
      <div className="h-12 border-b border-[var(--reading-border)] bg-[var(--reading-bar)]" />
      <div className="flex flex-1 flex-col lg:flex-row">
        <div className="flex-1 border-b border-[var(--reading-border)] bg-[var(--reading-paper)] p-6 lg:border-b-0 lg:border-r">
          <div className="mx-auto max-w-prose space-y-4">
            <div className="h-6 w-2/3 rounded bg-[var(--reading-border)]" />
            <div className="h-3 w-full rounded bg-[var(--reading-border)]/80" />
            <div className="h-3 w-full rounded bg-[var(--reading-border)]/80" />
            <div className="h-3 w-5/6 rounded bg-[var(--reading-border)]/80" />
            <div className="h-3 w-full rounded bg-[var(--reading-border)]/80" />
          </div>
        </div>
        <div className="w-full space-y-4 bg-[var(--reading-surface)] p-4 lg:w-[min(44%,520px)] lg:shrink-0">
          <div className="h-4 w-32 rounded bg-[var(--reading-border)]" />
          <div className="h-24 rounded-lg bg-white" />
          <div className="h-24 rounded-lg bg-white" />
        </div>
      </div>
    </div>
  );
}

export function ReadingHubSkeleton() {
  return (
    <div className="mx-auto max-w-3xl animate-pulse space-y-6 px-4 py-8">
      <div className="h-8 w-64 rounded bg-[var(--reading-border)]" />
      <div className="h-4 w-full max-w-lg rounded bg-[var(--reading-border)]/70" />
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="h-40 rounded-xl bg-white" />
        <div className="h-40 rounded-xl bg-white" />
      </div>
    </div>
  );
}
