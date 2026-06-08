import Link from "next/link";
import { ClockIcon } from "@/components/bandforge/dashboard/icons";
import {
  MOCK_TEST_PANEL,
  getMockMeta,
  mockTestNumberPath,
} from "@/lib/mock-catalog";
import { cn } from "@/lib/utils";

type Props = {
  activeNumber: number;
};

function slotMinutes(number: number): number {
  const slot = MOCK_TEST_PANEL.find((row) => row.number === number);
  if (slot?.slug) return getMockMeta(slot.slug).totalMinutes;
  return 120;
}

export function MockTestPickerGrid({ activeNumber }: Props) {
  return (
    <div className="-mx-1 overflow-x-auto px-1 pb-1">
      <div className="flex min-w-min gap-3 sm:grid sm:min-w-0 sm:grid-cols-5">
        {MOCK_TEST_PANEL.map((slot) => {
          const isActive = slot.number === activeNumber;
          const minutes = slotMinutes(slot.number);

          const card = (
            <div
              className={cn(
                "relative flex w-[148px] shrink-0 flex-col rounded-xl border p-3.5 transition-all sm:w-auto sm:shrink",
                isActive
                  ? "border-[var(--exam-accent)] bg-white shadow-md ring-2 ring-[var(--exam-accent)]/20"
                  : slot.available
                    ? "border-[var(--exam-border)] bg-white hover:border-[var(--exam-accent)]/40 hover:shadow-sm"
                    : "border-[var(--exam-border)] bg-[var(--exam-surface)]",
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <span
                  className={cn(
                    "flex size-7 items-center justify-center rounded-lg text-[13px] font-bold tabular-nums",
                    isActive
                      ? "bg-[var(--exam-accent)] text-white"
                      : slot.available
                        ? "bg-[#0F172A] text-white"
                        : "bg-[var(--exam-border)] text-[var(--exam-ink-muted)]",
                  )}
                >
                  {slot.number}
                </span>
                {!slot.available ? (
                  <span className="rounded-full bg-[var(--exam-border)] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[var(--exam-ink-muted)]">
                    Soon
                  </span>
                ) : isActive ? (
                  <span className="text-[9px] font-bold uppercase tracking-wide text-[var(--exam-accent)]">
                    Active
                  </span>
                ) : null}
              </div>

              <p className="mt-2.5 text-[13px] font-bold leading-tight text-[var(--exam-ink)]">
                {slot.displayLabel}
              </p>

              <p className="mt-0.5 line-clamp-2 text-[10px] leading-snug text-[var(--exam-ink-muted)]">
                {slot.examTitle.replace("IELTS Academic ", "")}
              </p>

              <div className="mt-auto flex items-center gap-1 pt-2.5 text-[10px] font-medium text-[var(--exam-ink-muted)]">
                <ClockIcon className="size-3 text-[var(--exam-accent)]" />
                <span>{minutes}m</span>
              </div>
            </div>
          );

          if (slot.available && !isActive) {
            return (
              <Link
                key={slot.number}
                href={mockTestNumberPath(slot.number)}
                className="block rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--exam-accent)]"
                prefetch
              >
                {card}
              </Link>
            );
          }

          return (
            <div
              key={slot.number}
              className={cn(!slot.available && "opacity-60")}
              aria-current={isActive ? "page" : undefined}
            >
              {card}
            </div>
          );
        })}
      </div>
    </div>
  );
}
