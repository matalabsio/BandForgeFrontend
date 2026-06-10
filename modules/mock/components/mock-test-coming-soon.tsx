import type { MockTestPanelSlot } from "@/lib/mock-catalog";
import { MockTestHubShell } from "@/modules/mock/components/mock-test-hub-shell";

type Props = {
  slot: MockTestPanelSlot;
};

export function MockTestComingSoon({ slot }: Props) {
  return (
    <MockTestHubShell activeNumber={slot.number}>
      <section
        className="rounded-2xl border border-dashed border-[var(--exam-border)] bg-white px-6 py-12 text-center shadow-sm sm:py-14"
        aria-labelledby="mock-coming-soon-heading"
      >
        <span className="inline-flex rounded-full bg-[var(--exam-surface)] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--exam-ink-muted)]">
          Coming soon
        </span>
        <h1
          id="mock-coming-soon-heading"
          className="mt-3 font-display text-xl font-bold text-[var(--exam-ink)] sm:text-2xl"
        >
          {slot.examTitle}
        </h1>
        <p className="mx-auto mt-3 max-w-md text-[14px] leading-relaxed text-[var(--exam-ink-muted)]">
          {slot.displayLabel} is being prepared. Choose Test 1 or Test 2 from
          the list above, or browse all tests from the catalog.
        </p>
      </section>
    </MockTestHubShell>
  );
}
