import { ExamSectionLoader } from "@/modules/shared/components/exam-section-loader";
import { MockTestHubSkeleton } from "@/modules/mock/components/mock-test-hub-skeleton";

type IeltsExamSkeletonProps = {
  title?: string;
  subtitle?: string;
  /** Pulse layout only — no heavy blur spinner (plan / fast boots). */
  light?: boolean;
};

function IeltsExamSkeletonLayout() {
  return (
    <div className="flex min-h-dvh flex-col animate-pulse">
      <div className="h-12 border-b border-[var(--exam-border)] bg-[var(--exam-bar)]" />
      <div className="flex flex-1 flex-col lg:flex-row">
        <div className="flex-1 border-b border-[var(--exam-border)] bg-[var(--exam-paper)] p-6 lg:border-b-0 lg:border-r">
          <div className="mx-auto max-w-prose space-y-4">
            <div className="h-6 w-2/3 rounded bg-[var(--exam-border)]" />
            <div className="h-3 w-full rounded bg-[var(--exam-border)]/80" />
            <div className="h-3 w-5/6 rounded bg-[var(--exam-border)]/80" />
            <div className="h-3 w-4/5 rounded bg-[var(--exam-border)]/80" />
            <div className="mt-8 h-24 rounded-lg bg-[var(--exam-border)]/60" />
          </div>
        </div>
        <div className="w-full space-y-4 bg-[var(--exam-surface)] p-4 lg:w-[min(44%,520px)] lg:shrink-0">
          <div className="h-4 w-32 rounded bg-[var(--exam-border)]" />
          <div className="h-28 rounded-lg bg-white" />
          <div className="h-10 rounded-lg bg-white" />
          <div className="h-10 rounded-lg bg-white" />
        </div>
      </div>
    </div>
  );
}

export function IeltsExamSkeleton({
  title = "Loading section…",
  subtitle,
  light = false,
}: IeltsExamSkeletonProps = {}) {
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
          <IeltsExamSkeletonLayout />
        </div>
        <div className="absolute inset-x-0 bottom-0 z-10 flex justify-center pb-8 pt-4">
          <div className="rounded-full border border-[var(--exam-border)] bg-white/95 px-4 py-2 shadow-sm backdrop-blur-sm">
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
      <IeltsExamSkeletonLayout />
    </ExamSectionLoader>
  );
}

export function IeltsHubSkeleton() {
  return <MockTestHubSkeleton />;
}
