import Link from "next/link";
import {
  ArrowRightIcon,
  BookIcon,
  ClockIcon,
  HeadphonesIcon,
  PencilIcon,
} from "@/components/bandforge/dashboard/icons";
import {
  MOCK_TEST_PANEL,
  getMockMeta,
  mockTestNumberPath,
  type MockTestPanelSlot,
} from "@/lib/mock-catalog";
import { cn } from "@/lib/utils";

const MODULE_ICONS = {
  listening: HeadphonesIcon,
  reading: BookIcon,
  writing: PencilIcon,
} as const;

function slotMeta(slot: MockTestPanelSlot) {
  if (!slot.slug) return null;
  return getMockMeta(slot.slug);
}

function moduleSummary(slot: MockTestPanelSlot): string {
  const meta = slotMeta(slot);
  if (!meta) return "Listening · Reading · Writing";
  return `Listening (${meta.listeningPartCount} parts) · Reading (${meta.readingPassageCount} passages) · Writing (${meta.writingTaskCount} tasks)`;
}

function slotMinutes(slot: MockTestPanelSlot): number {
  return slotMeta(slot)?.totalMinutes ?? 120;
}

function linkLabel(slot: MockTestPanelSlot): string {
  const status = slot.available ? "available now" : "coming soon";
  return `${slot.displayLabel}, ${slot.examTitle}, ${status}, ${slotMinutes(slot)} minutes`;
}

export function MockTestsCatalog() {
  const liveCount = MOCK_TEST_PANEL.filter((slot) => slot.available).length;

  return (
    <div className="bf-dash-enter space-y-8 px-4 py-6 sm:px-6 sm:py-8">
      <header className="mx-auto max-w-3xl space-y-4 text-center">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--exam-accent)]">
          IELTS Academic
        </p>
        <h1 className="font-display text-2xl font-bold tracking-tight text-[var(--exam-ink)] sm:text-3xl">
          Full mock tests
        </h1>
        <p className="text-[14px] leading-relaxed text-[var(--exam-ink-muted)]">
          Pick a test to open its hub. Complete the readiness check, then work
          through Listening, Reading, and Writing in order.
        </p>

        <dl className="flex flex-wrap items-center justify-center gap-2">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[12px] font-semibold text-emerald-800">
            <dt className="sr-only">Live tests</dt>
            <dd>{liveCount} live</dd>
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-[var(--exam-border)] bg-white px-3 py-1 text-[12px] font-semibold text-[var(--exam-ink-muted)]">
            <dt className="sr-only">Total tests</dt>
            <dd>{MOCK_TEST_PANEL.length} in catalog</dd>
          </div>
        </dl>
      </header>

      <ol
        className="mx-auto grid max-w-3xl list-none gap-3 p-0"
        aria-label="Mock test catalog"
      >
        {MOCK_TEST_PANEL.map((slot) => {
          const meta = slotMeta(slot);
          const minutes = slotMinutes(slot);

          return (
            <li key={slot.number}>
              <Link
                href={mockTestNumberPath(slot.number)}
                prefetch={slot.available}
                aria-label={linkLabel(slot)}
                className={cn(
                  "group flex cursor-pointer flex-col gap-4 overflow-hidden rounded-2xl border p-4 shadow-sm transition-all duration-200 motion-reduce:transition-none sm:flex-row sm:items-center sm:justify-between sm:p-5",
                  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--exam-accent)]",
                  slot.available
                    ? "border-[var(--exam-border)] bg-white hover:border-[var(--exam-accent)]/40 hover:shadow-md"
                    : "border-[var(--exam-border)] bg-[var(--exam-surface)]/40 hover:border-[var(--exam-ink-muted)]/30",
                )}
              >
                  <div className="flex min-w-0 flex-1 items-start gap-4">
                    <span
                      className={cn(
                        "flex size-11 shrink-0 items-center justify-center rounded-xl text-[15px] font-bold tabular-nums",
                        slot.available
                          ? "bg-[#0F172A] text-white"
                          : "bg-[var(--exam-border)] text-[var(--exam-ink-muted)]",
                      )}
                      aria-hidden
                    >
                      {slot.number}
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-[15px] font-bold text-[var(--exam-ink)]">
                          {slot.displayLabel}
                        </h2>
                        {slot.available ? (
                          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-800">
                            Live
                          </span>
                        ) : (
                          <span className="rounded-full bg-[var(--exam-border)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[var(--exam-ink-muted)]">
                            Soon
                          </span>
                        )}
                      </div>

                      <p className="mt-0.5 font-display text-[17px] font-bold leading-snug text-[var(--exam-ink)] sm:text-lg">
                        {slot.examTitle}
                      </p>

                      <p className="mt-2 text-[13px] leading-relaxed text-[var(--exam-ink-muted)]">
                        {slot.available
                          ? moduleSummary(slot)
                          : "This mock is being prepared."}
                      </p>

                      {slot.available && meta ? (
                        <ul
                          className="mt-3 flex flex-wrap gap-2"
                          aria-label="Exam sections"
                        >
                          {(
                            [
                              ["listening", "Listening", meta.listeningMinutes],
                              ["reading", "Reading", meta.readingMinutes],
                              ["writing", "Writing", meta.writingMinutes],
                            ] as const
                          ).map(([key, label, mins]) => {
                            const Icon = MODULE_ICONS[key];
                            return (
                              <li key={key}>
                                <span className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--exam-border)] bg-[var(--exam-surface)] px-2 py-1 text-[11px] font-semibold text-[var(--exam-ink)]">
                                  <Icon
                                    className="size-3.5 text-[var(--exam-accent)]"
                                    aria-hidden
                                  />
                                  {label}
                                  <span className="text-[var(--exam-ink-muted)]">
                                    {mins}m
                                  </span>
                                </span>
                              </li>
                            );
                          })}
                        </ul>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center justify-between gap-4 border-t border-[var(--exam-border)] pt-3 sm:flex-col sm:items-end sm:border-0 sm:pt-0">
                    <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[var(--exam-ink-muted)]">
                      <ClockIcon
                        className="size-3.5 text-[var(--exam-accent)]"
                        aria-hidden
                      />
                      <span>{minutes} min total</span>
                    </span>

                    <span
                      className={cn(
                        "inline-flex min-h-[40px] items-center gap-1.5 rounded-xl px-4 py-2 text-[13px] font-bold transition-colors duration-200 motion-reduce:transition-none",
                        slot.available
                          ? "bg-[var(--exam-accent)] text-white group-hover:bg-[#0891B2]"
                          : "border border-[var(--exam-border)] bg-white text-[var(--exam-ink-muted)] group-hover:border-[var(--exam-ink-muted)]/40",
                      )}
                      aria-hidden
                    >
                      {slot.available ? `Open ${slot.displayLabel}` : "Details"}
                      <ArrowRightIcon className="size-3.5" />
                    </span>
                  </div>
              </Link>
            </li>
          );
        })}
      </ol>

      <section
        className="mx-auto max-w-3xl rounded-2xl border border-[var(--exam-border)] bg-white px-5 py-4 sm:px-6"
        aria-labelledby="mock-test-steps-heading"
      >
        <h2
          id="mock-test-steps-heading"
          className="text-[13px] font-bold text-[var(--exam-ink)]"
        >
          How it works
        </h2>
        <ol className="mt-3 grid gap-2 sm:grid-cols-3">
          {[
            "Select a test from the list",
            "Complete the readiness check",
            "Finish Listening, then Reading, then Writing",
          ].map((step, index) => (
            <li
              key={step}
              className="flex items-start gap-2.5 text-[12px] leading-snug text-[var(--exam-ink-muted)]"
            >
              <span
                className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[var(--exam-accent)]/12 text-[10px] font-bold text-[var(--exam-accent)]"
                aria-hidden
              >
                {index + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
