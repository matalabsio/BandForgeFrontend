import Link from "next/link";
import { ClockIcon } from "@/components/bandforge/dashboard/icons";
import {
  MOCK_TEST_PANEL,
  getMockMeta,
  mockTestNumberPath,
  mockTestsIndexPath,
  type MockSlug,
  type MockTestPanelSlot,
} from "@/lib/mock-catalog";
import type { MockCatalogSlot } from "@/lib/mock-catalog-api";
import { cn } from "@/lib/utils";

type Props = {
  /** Live catalog panel from the API (preferred). */
  slots?: MockCatalogSlot[];
  /** Highlight the active test (0 = none). */
  activeNumber?: number;
  variant?: "cards" | "pills";
};

function navLinkLabel(slot: { displayLabel: string; examTitle: string; available: boolean }): string {
  const status = slot.available ? "live" : "coming soon";
  return `${slot.displayLabel}, ${slot.examTitle}, ${status}`;
}

function slotMinutes(
  slot: MockCatalogSlot | MockTestPanelSlot | { number: number; totalMinutes?: number; slug?: MockSlug | null },
): number {
  if ("totalMinutes" in slot && typeof slot.totalMinutes === "number") {
    return slot.totalMinutes;
  }
  if ("slug" in slot && slot.slug) {
    return getMockMeta(slot.slug as MockSlug).totalMinutes;
  }
  return 120;
}

function examTitleShort(examTitle: string): string {
  return examTitle.replace(/^IELTS Academic\s+/i, "");
}

export function MockTestPickerGrid({
  slots: catalogSlots,
  activeNumber = 0,
  variant = "cards",
}: Props) {
  const pillsOnly = variant === "pills";

  const slots: Array<{
    number: number;
    displayLabel: string;
    examTitle: string;
    available: boolean;
  }> = catalogSlots
    ? catalogSlots.map((slot) => ({
        number: slot.number,
        displayLabel: slot.displayLabel,
        examTitle: slot.examTitle,
        available: slot.available,
      }))
    : MOCK_TEST_PANEL.map((slot) => ({
        number: slot.number,
        displayLabel: slot.displayLabel,
        examTitle: slot.examTitle,
        available: slot.available,
      }));

  return (
    <nav aria-label="Mock test selection">
      {!pillsOnly ? (
        <div className="mb-2 flex items-center justify-between gap-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--exam-ink-muted)]">
            Switch test
          </p>
          {activeNumber > 0 ? (
            <Link
              href={mockTestsIndexPath()}
              className="cursor-pointer text-[12px] font-semibold text-[var(--exam-accent)] transition-colors duration-200 hover:text-[var(--exam-accent-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--exam-accent)]"
            >
              All tests
            </Link>
          ) : null}
        </div>
      ) : null}

      <div className={pillsOnly ? "" : "-mx-1 overflow-x-auto px-1 pb-1"}>
        <ul
          className={cn(
            "flex min-w-min list-none gap-2 p-0",
            !pillsOnly && "md:grid md:min-w-0 md:grid-cols-5 md:gap-2",
          )}
          role={pillsOnly ? "tablist" : undefined}
        >
          {slots.map((slot) => {
            const isActive = activeNumber > 0 && slot.number === activeNumber;
            const minutes = slotMinutes(
              catalogSlots?.find((s) => s.number === slot.number) ??
                MOCK_TEST_PANEL.find((s) => s.number === slot.number) ??
                slot,
            );

            return (
              <li key={slot.number}>
                <Link
                  href={mockTestNumberPath(slot.number)}
                  prefetch={slot.available}
                  aria-current={isActive ? "page" : undefined}
                  aria-label={navLinkLabel(slot)}
                  className={cn(
                    "block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--exam-accent)]",
                    !slot.available && "opacity-80 hover:opacity-100",
                  )}
                >
                  <span
                    className={cn(
                      "inline-flex shrink-0 items-center rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                      !pillsOnly && "md:hidden",
                      isActive
                        ? "bg-[var(--exam-accent)] text-white"
                        : "border border-[var(--exam-border)] bg-white text-[var(--exam-ink)]",
                      !slot.available && !isActive && "text-[var(--exam-ink-muted)]",
                    )}
                    role={pillsOnly ? "tab" : undefined}
                    aria-selected={pillsOnly ? isActive : undefined}
                  >
                    {slot.displayLabel}
                    {!slot.available ? (
                      <span className="ml-1.5 text-[10px] font-bold uppercase tracking-wide opacity-70">
                        Soon
                      </span>
                    ) : null}
                  </span>

                  {!pillsOnly ? (
                    <div
                      className={cn(
                        "relative hidden h-full w-[132px] shrink-0 flex-col rounded-xl border p-3 transition-colors duration-200 motion-reduce:transition-none md:flex md:w-auto md:shrink",
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
                                ? "bg-ink text-white"
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
                        {examTitleShort(slot.examTitle)}
                      </p>

                      <div
                        className="mt-auto flex items-center gap-1 pt-2 text-[10px] font-medium text-[var(--exam-ink-muted)]"
                        aria-hidden
                      >
                        {slot.available ? (
                          <>
                            <ClockIcon className="size-3 text-[var(--exam-accent)]" />
                            <span>{minutes}m</span>
                          </>
                        ) : null}
                      </div>
                    </div>
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
