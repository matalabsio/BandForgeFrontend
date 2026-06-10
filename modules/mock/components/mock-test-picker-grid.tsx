import Link from "next/link";
import { ClockIcon } from "@/components/bandforge/dashboard/icons";
import {
  MOCK_TEST_PANEL,
  getMockMeta,
  mockTestNumberPath,
  mockTestsIndexPath,
  type MockTestPanelSlot,
} from "@/lib/mock-catalog";
import { cn } from "@/lib/utils";

type Props = {
  /** Highlight the active test (0 = none). */
  activeNumber?: number;
};

function slotMinutes(slot: MockTestPanelSlot): number {
  if (slot.slug) return getMockMeta(slot.slug).totalMinutes;
  return 120;
}

function navLinkLabel(slot: MockTestPanelSlot): string {
  const status = slot.available ? "live" : "coming soon";
  return `${slot.displayLabel}, ${slot.examTitle}, ${status}`;
}

export function MockTestPickerGrid({ activeNumber = 0 }: Props) {
  return (
    <nav aria-label="Mock test selection">
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--exam-ink-muted)]">
          Switch test
        </p>
        {activeNumber > 0 ? (
          <Link
            href={mockTestsIndexPath()}
            className="cursor-pointer text-[12px] font-semibold text-[var(--exam-accent)] transition-colors duration-200 hover:text-[#0891B2] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--exam-accent)]"
          >
            All tests
          </Link>
        ) : null}
      </div>

      <div className="-mx-1 overflow-x-auto px-1 pb-1">
        <ul className="flex min-w-min list-none gap-2 p-0 sm:grid sm:min-w-0 sm:grid-cols-5">
          {MOCK_TEST_PANEL.map((slot) => {
            const isActive = activeNumber > 0 && slot.number === activeNumber;
            const minutes = slotMinutes(slot);

            return (
              <li key={slot.number}>
                <Link
                  href={mockTestNumberPath(slot.number)}
                  prefetch={slot.available}
                  aria-current={isActive ? "page" : undefined}
                  aria-label={navLinkLabel(slot)}
                  className={cn(
                    "block rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--exam-accent)]",
                    !slot.available && "opacity-80 hover:opacity-100",
                  )}
                >
                  <div
                    className={cn(
                      "relative flex h-full w-[132px] shrink-0 flex-col rounded-xl border p-3 transition-colors duration-200 motion-reduce:transition-none sm:w-auto sm:shrink",
                      isActive
                        ? "border-[var(--exam-accent)] bg-white shadow-md ring-2 ring-[var(--exam-accent)]/20"
                        : slot.available
                          ? "border-[var(--exam-border)] bg-white hover:border-[var(--exam-accent)]/40 hover:shadow-sm"
                          : "border-[var(--exam-border)] bg-[var(--exam-surface)] hover:border-[var(--exam-ink-muted)]/30",
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={cn(
                          "flex size-7 items-center justify-center rounded-lg text-[12px] font-bold tabular-nums",
                          isActive
                            ? "bg-[var(--exam-accent)] text-white"
                            : slot.available
                              ? "bg-[#0F172A] text-white"
                              : "bg-[var(--exam-border)] text-[var(--exam-ink-muted)]",
                        )}
                        aria-hidden
                      >
                        {slot.number}
                      </span>
                      {!slot.available ? (
                        <span
                          className="rounded-full bg-[var(--exam-border)] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[var(--exam-ink-muted)]"
                          aria-hidden
                        >
                          Soon
                        </span>
                      ) : isActive ? (
                        <span
                          className="text-[9px] font-bold uppercase tracking-wide text-[var(--exam-accent)]"
                          aria-hidden
                        >
                          Active
                        </span>
                      ) : (
                        <span
                          className="text-[9px] font-bold uppercase tracking-wide text-emerald-600"
                          aria-hidden
                        >
                          Live
                        </span>
                      )}
                    </div>

                    <p
                      className="mt-2 text-[12px] font-bold leading-tight text-[var(--exam-ink)]"
                      aria-hidden
                    >
                      {slot.displayLabel}
                    </p>

                    <p
                      className="mt-0.5 line-clamp-2 text-[10px] leading-snug text-[var(--exam-ink-muted)]"
                      aria-hidden
                    >
                      {slot.examTitle.replace("IELTS Academic ", "")}
                    </p>

                    <div
                      className="mt-auto flex items-center gap-1 pt-2 text-[10px] font-medium text-[var(--exam-ink-muted)]"
                      aria-hidden
                    >
                      <ClockIcon className="size-3 text-[var(--exam-accent)]" />
                      <span>{minutes}m</span>
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
