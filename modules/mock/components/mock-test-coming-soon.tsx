import type { MockTestPanelSlot } from "@/lib/mock-catalog";
import { MockTestHubShell } from "@/modules/mock/components/mock-test-hub-shell";

type Props = {
  slot: MockTestPanelSlot;
};

export function MockTestComingSoon({ slot }: Props) {
  return (
    <MockTestHubShell activeNumber={slot.number}>
      <div className="rounded-2xl border border-dashed border-[var(--exam-border)] bg-white px-6 py-14 text-center shadow-sm">
        <span className="inline-flex rounded-full bg-[var(--exam-surface)] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--exam-ink-muted)]">
          Coming soon
        </span>
        <h2 className="mt-3 font-display text-xl font-bold text-[var(--exam-ink)]">
          {slot.examTitle}
        </h2>
        <p className="mx-auto mt-3 max-w-md text-[13px] leading-relaxed text-[var(--exam-ink-muted)]">
          {slot.displayLabel} is being prepared. Use Test 1 or Test 2 in the
          meantime.
        </p>
      </div>
    </MockTestHubShell>
  );
}
