import type { LearningStudyPlan } from "@/lib/learning-types";
import { BookOpenCheck, CalendarClock, Layers3, Timer } from "lucide-react";
import type { ComponentType, SVGProps } from "react";

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

export function countStudyDaysCompleted(plan: LearningStudyPlan): number {
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

type Metric = {
  label: string;
  value: string;
  hint: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
};

export function DashboardTimelineSection({
  currentDay,
  totalDays,
  daysRemaining,
  examDate,
  studyPlan,
}: Props) {
  const day = currentDay ?? 1;
  const total = totalDays ?? studyPlan.total_days ?? 0;
  const studyDaysDone = countStudyDaysCompleted(studyPlan);
  const examLabel = formatExamDate(examDate ?? studyPlan.exam_date ?? null);

  let countdownValue = "—";
  let countdownHint = "Set your exam date";
  if (daysRemaining != null) {
    if (daysRemaining === 0 && examDate) {
      const examPassed = examDate < todayIso();
      countdownValue = examPassed ? "Passed" : "Today";
      countdownHint = examPassed ? "Exam date passed" : "Exam day";
    } else if (daysRemaining > 0) {
      countdownValue = String(daysRemaining);
      countdownHint = daysRemaining === 1 ? "day to test" : "days to test";
    } else {
      countdownValue = "Passed";
      countdownHint = "Exam date passed";
    }
  }

  const metrics: Metric[] = [
    {
      label: "Plan day",
      value: total > 0 ? `${day}/${total}` : String(day),
      hint: total > 0 ? `${Math.min(100, Math.round((day / total) * 100))}% through plan` : "In progress",
      Icon: Layers3,
    },
    {
      label: "Countdown",
      value: countdownValue,
      hint: countdownHint,
      Icon: Timer,
    },
    {
      label: "Exam",
      value: examLabel ?? "Not set",
      hint: examLabel ? "Target test date" : "Add date in profile",
      Icon: CalendarClock,
    },
    {
      label: "Study days",
      value: String(studyDaysDone),
      hint: studyDaysDone === 1 ? "day completed" : "days completed",
      Icon: BookOpenCheck,
    },
  ];

  return (
    <section className="bf-dash-enter" aria-label="Timeline metrics">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {metrics.map(({ label, value, hint, Icon }) => (
          <article
            key={label}
            className="group rounded-2xl border border-ink/8 bg-white p-4 transition-colors duration-200 hover:border-cyan/30 sm:p-5"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-light">
                {label}
              </p>
              <span className="flex size-8 items-center justify-center rounded-xl bg-cyan-soft text-teal transition-colors duration-200 group-hover:bg-cyan/15">
                <Icon className="size-4" strokeWidth={2.1} aria-hidden />
              </span>
            </div>
            <p className="mt-3 font-display text-xl font-bold tabular-nums tracking-tight text-ink sm:text-2xl">
              {value}
            </p>
            <p className="mt-1 text-[12px] text-muted">{hint}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
