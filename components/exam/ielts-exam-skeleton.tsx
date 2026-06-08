import { ExamSectionLoader } from "@/modules/shared/components/exam-section-loader";
import { MockTestHubSkeleton } from "@/modules/mock/components/mock-test-hub-skeleton";

type IeltsExamSkeletonProps = {
  title?: string;
  subtitle?: string;
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
          </div>
        </div>
        <div className="w-full space-y-4 bg-[var(--exam-surface)] p-4 lg:w-[min(44%,520px)] lg:shrink-0">
          <div className="h-4 w-32 rounded bg-[var(--exam-border)]" />
          <div className="h-28 rounded-lg bg-white" />
        </div>
      </div>
    </div>
  );
}

export function IeltsExamSkeleton({
  title = "Loading section…",
  subtitle,
}: IeltsExamSkeletonProps = {}) {
  return (
    <ExamSectionLoader title={title} subtitle={subtitle}>
      <IeltsExamSkeletonLayout />
    </ExamSectionLoader>
  );
}

export function IeltsHubSkeleton() {
  return <MockTestHubSkeleton />;
}
