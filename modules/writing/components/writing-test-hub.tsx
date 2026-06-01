"use client";

import Link from "next/link";
import { M01_MOCK_TEST_ID, TEST1_WRITING_TASK_COUNT } from "@/lib/mock-catalog";
import { writingTaskPath, writingTestHubPath } from "@/lib/writing-test";
import { useMockSession } from "@/modules/mock/hooks/use-mock-session";
import { cn } from "@/lib/utils";

const TASKS = [
  {
    part: 1 as const,
    title: "Writing Task 1",
    subtitle: "Academic · describe a chart (20 min, ≥150 words)",
    minutes: 20,
  },
  {
    part: 2 as const,
    title: "Writing Task 2",
    subtitle: "Essay · agree/disagree (40 min, ≥250 words)",
    minutes: 40,
  },
];

type Props = {
  mockAttemptId?: string | null;
  mockSlug?: string;
};

export function WritingTestHub({ mockAttemptId, mockSlug }: Props) {
  const { progress } = useMockSession(M01_MOCK_TEST_ID);
  const writingMod = progress?.modules.find((m) => m.module === "writing");

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-10">
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-teal">
        IELTS Writing
      </p>
      <h1 className="mt-2 font-display text-2xl font-bold text-navy">
        Practice writing tasks
      </h1>
      <p className="mt-2 text-[14px] text-ink/65">
        Complete the writing task. Your band is estimated from word count when
        you submit (minimum 150 words for Task 1).
      </p>

      <ul className="mt-8 space-y-4">
        {TASKS.filter((t) => t.part <= TEST1_WRITING_TASK_COUNT).map((t) => {
          const task1Done =
            writingMod?.status === "completed" ||
            writingMod?.part === 2 ||
            progress?.next_part === 2;
          const locked =
            (Boolean(mockAttemptId) && writingMod?.status === "locked") ||
            (Boolean(mockAttemptId) && t.part === 2 && !task1Done);
          const completed = t.part === 1 ? task1Done : writingMod?.status === "completed";
          const inProgress =
            writingMod?.status === "in_progress" && writingMod.part === t.part;

          const href = locked
            ? null
            : writingTaskPath(t.part, {
                mockSlug,
                mockAttemptId: mockAttemptId ?? undefined,
                auto: true,
              });

          const card = (
            <article
              className={cn(
                "rounded-xl border bg-white p-5 shadow-sm transition-colors",
                locked
                  ? "cursor-default border-dashed opacity-60"
                  : "border-border hover:border-teal/40",
                completed && "border-emerald-200",
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="font-display text-lg font-bold text-navy">
                    {t.title}
                  </h2>
                  <p className="mt-1 text-[13px] text-ink/60">{t.subtitle}</p>
                  <p className="mt-2 text-[12px] text-ink/45">{t.minutes} minutes</p>
                </div>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase",
                    completed && "bg-emerald-100 text-emerald-800",
                    inProgress && "bg-amber-100 text-amber-900",
                    locked && "bg-surface text-ink/45",
                    !completed && !inProgress && !locked && "bg-teal/10 text-teal",
                  )}
                >
                  {completed
                    ? "Done"
                    : inProgress
                      ? "In progress"
                      : locked
                        ? "Locked"
                        : "Start"}
                </span>
              </div>
              {!locked ? (
                <p className="mt-3 text-[12px] font-bold text-teal">
                  {completed ? "View in results after submit" : "Open task →"}
                </p>
              ) : (
                <p className="mt-3 text-[12px] text-ink/45">
                  Complete Task 1 first (full mock order)
                </p>
              )}
            </article>
          );

          if (href) {
            return (
              <li key={t.part}>
                <Link href={href} className="block">
                  {card}
                </Link>
              </li>
            );
          }
          return <li key={t.part}>{card}</li>;
        })}
      </ul>

      <p className="mt-6 text-center text-[12px] text-ink/50">
        <Link href={writingTestHubPath()} className="font-medium text-teal hover:underline">
          Writing home
        </Link>
        {mockAttemptId ? (
          <>
            {" · "}
            <Link
              href={`/mock/m01?mock_attempt=${encodeURIComponent(mockAttemptId)}`}
              className="font-medium text-teal hover:underline"
            >
              Back to mock hub
            </Link>
          </>
        ) : null}
      </p>
    </div>
  );
}
