import { MockTestPickerGrid } from "@/modules/mock/components/mock-test-picker-grid";

type Props = {
  activeNumber: number;
  children: React.ReactNode;
};

export function MockTestHubShell({ activeNumber, children }: Props) {
  return (
    <div className="px-4 py-6 sm:px-6 sm:py-8">
      <div className="bf-dash-enter mx-auto max-w-6xl space-y-6">
        <header className="space-y-1">
          <h1 className="font-display text-xl font-bold tracking-tight text-[var(--exam-ink)] sm:text-2xl">
            Full mock tests
          </h1>
          <p className="max-w-2xl text-[13px] leading-relaxed text-[var(--exam-ink-muted)]">
            Select a test below, complete the readiness check, then work through
            Listening → Reading → Writing in order.
          </p>
        </header>

        <MockTestPickerGrid activeNumber={activeNumber} />

        {children}
      </div>
    </div>
  );
}
