import type { LearningStudyPlan } from "@/lib/learning-types";

type Props = {
  currentDay: number | null;
  totalDays: number | null;
  daysRemaining: number | null;
  examDate: string | null;
  studyPlan: LearningStudyPlan;
};

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function countStudyDaysCompleted(plan: LearningStudyPlan): number {
  const today = todayIso();
  let count = 0;
  for (const week of plan.weeks) {
    for (const day of week.days) {
      if (day.date > today) continue;
      if (day.tasks.some((t) => t.status === "done")) count += 1;
    }
  }
  return count;
}

function formatExamDate(examDate: string | null): string | null {
  if (!examDate) return null;
  const parsed = new Date(`${examDate}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return null;
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(parsed);
}

export function DashboardTimelineSection({
  currentDay,
  totalDays,
  daysRemaining,
  examDate,
  studyPlan,
}: Props) {
  const day = currentDay ?? 1;
  const total = totalDays ?? studyPlan.total_days ?? 0;
  const progressPct =
    total > 0 ? Math.min(100, Math.round((day / total) * 100)) : 0;
  const studyDaysDone = countStudyDaysCompleted(studyPlan);
  const examLabel = formatExamDate(examDate ?? studyPlan.exam_date ?? null);

  let countdownLabel = "Set your exam date to see countdown";
  if (daysRemaining != null) {
    if (daysRemaining === 0 && examDate) {
      const examPassed = examDate < todayIso();
      countdownLabel = examPassed ? "Exam date passed" : "Exam day";
    } else if (daysRemaining > 0) {
      countdownLabel = `${daysRemaining} day${daysRemaining === 1 ? "" : "s"} to test`;
    } else {
      countdownLabel = "Exam date passed";
    }
  }

  return (
    <section className="bf-dash-enter rounded-2xl border border-ink/10 bg-white px-5 py-5 sm:px-6 sm:py-6">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] font-semibold tracking-[0.12em] text-ink/40 uppercase">
            Timeline
          </p>
          <p className="mt-1 font-display text-lg font-bold text-ink sm:text-xl">
            Day {day}
            {total > 0 ? ` / ${total}` : ""}
          </p>
        </div>
        <p className="text-[13px] font-semibold text-cyan sm:text-[14px]">
          {countdownLabel}
        </p>
      </div>

      <div className="h-2.5 overflow-hidden rounded-full bg-ink/[0.06]">
        <div
          className="h-full rounded-full bg-cyan transition-all"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-ink/55 sm:text-[13px]">
        {examLabel ? <span>Exam: {examLabel}</span> : null}
        {studyDaysDone > 0 ? (
          <span>
            {studyDaysDone} study day{studyDaysDone === 1 ? "" : "s"} completed
          </span>
        ) : null}
      </div>
    </section>
  );
}
