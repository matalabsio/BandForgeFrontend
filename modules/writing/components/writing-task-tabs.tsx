"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  shortModuleWritingResultsPath,
  writingModuleLabel,
} from "@/lib/mock-catalog";
import type { WritingSessionTask } from "@/modules/writing/types";

type Props = {
  testNumber: number;
  currentAttemptId: string;
  tasks: WritingSessionTask[];
  mockAttemptId?: string | null;
  className?: string;
};

function taskBand(task: WritingSessionTask): number | null {
  if (task.human_band != null) return task.human_band;
  if (task.ai_band != null) return task.ai_band;
  return null;
}

export function WritingTaskTabs({
  testNumber,
  currentAttemptId,
  tasks,
  mockAttemptId = null,
  className,
}: Props) {
  const router = useRouter();
  if (tasks.length <= 1) return null;

  const sorted = [...tasks].toSorted((a, b) => a.part - b.part);

  return (
    <nav
      aria-label="Writing tasks"
      className={cn("flex flex-wrap gap-2", className)}
    >
      {sorted.map((task) => {
        const active = task.attempt_id === currentAttemptId;
        const band = taskBand(task);
        const href = shortModuleWritingResultsPath(testNumber, task.attempt_id, {
          mockAttemptId,
          part: task.part,
        });
        return (
          <Link
            key={task.attempt_id}
            href={href}
            onClick={(e) => {
              e.preventDefault();
              router.push(href);
            }}
            className={cn(
              "inline-flex min-h-[40px] cursor-pointer items-center rounded-full px-4 py-2 text-[13px] font-semibold transition-colors",
              active
                ? "bg-teal text-white"
                : "border border-border bg-surface text-ink/70 hover:border-teal/30 hover:bg-cyan-soft/40",
            )}
            aria-current={active ? "page" : undefined}
          >
            {writingModuleLabel(task.part).replace("Writing · ", "")}
            {band != null ? (
              <span className="ml-2 tabular-nums opacity-90">{band.toFixed(1)}</span>
            ) : (
              <span className="ml-2 text-[11px] font-medium opacity-75">
                Analyzing…
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
