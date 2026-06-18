import Link from "next/link";
import {
  ArrowRightIcon,
  BookIcon,
  ClockIcon,
  HeadphonesIcon,
  LayoutGridIcon,
  PencilIcon,
  TrophyIcon,
} from "@/components/bandforge/dashboard/icons";
import { DashboardCard } from "@/components/bandforge/dashboard/dashboard-card";
import { MOCK_TEST_PANEL, mockTestsIndexPath } from "@/lib/mock-catalog";
import {
  liveCatalogSlots,
  type MockCatalogSlot,
} from "@/lib/mock-catalog-api";
import { cn } from "@/lib/utils";

const EXAM_MODULES = [
  { key: "listening", label: "Listening", Icon: HeadphonesIcon },
  { key: "reading", label: "Reading", Icon: BookIcon },
  { key: "writing", label: "Writing", Icon: PencilIcon },
] as const;

type Props = {
  catalogSlots?: MockCatalogSlot[];
};

export function MockTestsSection({ catalogSlots }: Props) {
  const panel = catalogSlots ?? MOCK_TEST_PANEL.map((slot) => ({
    number: slot.number,
    id: slot.slug ?? "",
    title: slot.examTitle,
    displayLabel: slot.displayLabel,
    examTitle: slot.examTitle,
    available: slot.available,
    listeningPartCount: 4,
    readingPassageCount: 3,
    writingTaskCount: 2,
    listeningMinutes: 30,
    readingMinutes: 30,
    writingMinutes: 60,
    totalMinutes: 120,
    flowHint: "",
  }));

  const liveTests: Array<{ number: number; displayLabel: string }> = catalogSlots
    ? liveCatalogSlots(catalogSlots).map((slot) => ({
        number: slot.number,
        displayLabel: slot.displayLabel,
      }))
    : MOCK_TEST_PANEL.filter((slot) => slot.available).map((slot) => ({
        number: slot.number,
        displayLabel: slot.displayLabel,
      }));
  const liveCount = liveTests.length;
  const totalCount = panel.length;
  const hubPath = mockTestsIndexPath();

  return (
    <section aria-labelledby="dashboard-mock-tests-heading">
      <Link
        href={hubPath}
        aria-label={`Open full mock tests hub, ${liveCount} of ${totalCount} tests live`}
        className={cn(
          "group block cursor-pointer rounded-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan",
        )}
      >
        <DashboardCard
          className={cn(
            "relative overflow-hidden transition-all duration-200 motion-reduce:transition-none",
            "group-hover:border-cyan/25 group-hover:shadow-[0_8px_32px_rgba(6,182,212,0.12)]",
          )}
        >
          <div
            className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan to-teal"
            aria-hidden
          />

          <div className="flex flex-col gap-6 p-5 sm:p-6 lg:flex-row lg:items-stretch lg:gap-8">
            <div className="min-w-0 flex-1">
              <header className="flex flex-wrap items-start gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-cyan/12 text-cyan transition-colors duration-200 group-hover:bg-cyan/18">
                  <TrophyIcon className="size-[18px]" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2
                      id="dashboard-mock-tests-heading"
                      className="font-display text-[17px] font-bold tracking-tight text-ink"
                    >
                      Full mock tests
                    </h2>
                    <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700">
                      {liveCount} live
                    </span>
                  </div>
                  <p className="mt-0.5 text-[12px] font-medium text-ink/50">
                    IELTS Academic · {liveCount} of {totalCount} tests ready
                  </p>
                </div>
              </header>

              <p className="mt-4 max-w-lg text-[14px] leading-[1.55] text-ink/75">
                Timed full mocks in exam order. Open the test hub to pick a mock,
                complete the readiness check, then work through each section.
              </p>

              <div
                className="mt-4 flex flex-wrap items-center gap-1.5"
                aria-hidden
              >
                {EXAM_MODULES.map(({ key, label, Icon }, index) => (
                  <div key={key} className="flex items-center gap-1.5">
                    {index > 0 ? (
                      <ArrowRightIcon className="size-3 shrink-0 text-ink/25" />
                    ) : null}
                    <span className="inline-flex items-center gap-1.5 rounded-lg border border-ink/8 bg-ink/[0.02] px-2.5 py-1.5 text-[11px] font-semibold text-ink/70">
                      <Icon className="size-3.5 shrink-0 text-cyan" />
                      {label}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[12px] font-medium text-ink/50">
                <span className="inline-flex items-center gap-1.5">
                  <ClockIcon className="size-3.5 text-cyan" />
                  ~120 min per test
                </span>
                <span
                  className="hidden h-3 w-px bg-ink/10 sm:block"
                  aria-hidden
                />
                <span className="inline-flex items-center gap-1.5">
                  <LayoutGridIcon className="size-3.5 text-cyan" />
                  {totalCount} tests in hub
                </span>
              </div>
            </div>

            <div className="flex w-full shrink-0 flex-col justify-between gap-4 border-t border-ink/6 pt-5 lg:w-[232px] lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
              <ul className="grid grid-cols-2 gap-2 lg:grid-cols-1" aria-hidden>
                {liveTests.map((slot) => (
                  <li
                    key={slot.number}
                    className="flex items-center gap-2.5 rounded-xl border border-ink/8 bg-ink/[0.02] px-3 py-2.5"
                  >
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-ink text-[12px] font-bold tabular-nums text-white">
                      {slot.number}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-[12px] font-semibold text-ink">
                      {slot.displayLabel}
                    </span>
                    <span className="shrink-0 rounded-full bg-emerald-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-emerald-700">
                      Live
                    </span>
                  </li>
                ))}
              </ul>

              <span
                className={cn(
                  "inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl",
                  "bg-cyan px-5 py-2.5 text-[14px] font-bold text-white",
                  "transition-colors duration-200 motion-reduce:transition-none",
                  "group-hover:bg-cyan",
                )}
              >
                View test hub
                <ArrowRightIcon className="size-4 transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transform-none" />
              </span>
            </div>
          </div>
        </DashboardCard>
      </Link>
    </section>
  );
}
