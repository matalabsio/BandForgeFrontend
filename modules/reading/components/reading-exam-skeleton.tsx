import { ExamSectionLoader } from "@/modules/shared/components/exam-section-loader";

type ReadingExamSkeletonProps = {
  title?: string;
  subtitle?: string;
  /** Pulse layout only — no heavy blur spinner (plan / fast boots). */
  light?: boolean;
};

function ReadingExamSkeletonLayout() {
  return (
    <div className="flex min-h-dvh flex-col animate-pulse">
      <div className="h-12 shrink-0 border-b border-[var(--reading-border)] bg-[var(--reading-bar)]" />
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <div className="min-h-[40vh] flex-1 border-b border-[var(--reading-border)] bg-[var(--reading-paper)] p-5 sm:p-6 lg:min-h-0 lg:border-b-0 lg:border-r">
          <div className="mx-auto max-w-prose space-y-4">
            <div className="mx-auto h-6 w-2/3 rounded bg-[var(--reading-border)]" />
            <div className="h-3 w-full rounded bg-[var(--reading-border)]/80" />
            <div className="h-3 w-full rounded bg-[var(--reading-border)]/80" />
            <div className="h-3 w-5/6 rounded bg-[var(--reading-border)]/80" />
            <div className="h-3 w-full rounded bg-[var(--reading-border)]/80" />
            <div className="h-3 w-4/5 rounded bg-[var(--reading-border)]/80" />
          </div>
        </div>
        <div className="w-full space-y-4 bg-[var(--reading-surface)] p-4 lg:w-[min(44%,560px)] lg:shrink-0">
          <div className="h-4 w-32 rounded bg-[var(--reading-border)]" />
          <div className="h-24 rounded-lg bg-white" />
          <div className="h-24 rounded-lg bg-white" />
          <div className="h-10 rounded-lg bg-white" />
        </div>
      </div>
    </div>
  );
}

export function ReadingExamSkeleton({
  title = "Loading reading section…",
  subtitle,
  light = false,
}: ReadingExamSkeletonProps = {}) {
  if (light) {
    return (
      <div
        className="relative flex min-h-dvh w-full flex-1 flex-col"
        role="status"
        aria-live="polite"
        aria-busy="true"
        aria-label={title}
      >
        <div className="pointer-events-none select-none" aria-hidden>
          <ReadingExamSkeletonLayout />
        </div>
        <div className="absolute inset-x-0 bottom-0 z-10 flex justify-center pb-8 pt-4">
          <div className="rounded-full border border-[var(--reading-border)] bg-white/95 px-4 py-2 shadow-sm backdrop-blur-sm">
            <p className="text-[13px] font-medium text-navy">{title}</p>
            {subtitle ? (
              <p className="text-[11px] text-ink/55">{subtitle}</p>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  return (
    <ExamSectionLoader
      title={title}
      subtitle={subtitle}
      hint="Almost ready — hang on a moment."
    >
      <ReadingExamSkeletonLayout />
    </ExamSectionLoader>
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
