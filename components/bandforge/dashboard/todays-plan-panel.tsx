"use client";

import Link from "next/link";
import { Check, Play, Target } from "lucide-react";
import { useMemo, useState, useTransition } from "react";
import {
  BookIcon,
  HeadphonesIcon,
  MicIcon,
  PencilIcon,
} from "@/components/bandforge/dashboard/icons";
import { patchLearningTask } from "@/lib/learning-api";
import type { LearningStudyTask } from "@/lib/learning-types";
import { cn } from "@/lib/utils";
import type { ComponentType, SVGProps } from "react";

const moduleIcons: Record<
  string,
  ComponentType<SVGProps<SVGSVGElement>>
> = {
  listening: HeadphonesIcon,
  reading: BookIcon,
  writing: PencilIcon,
  speaking: MicIcon,
};

const MODULE_LABEL: Record<string, string> = {
  listening: "Listening",
  reading: "Reading",
  writing: "Writing",
  speaking: "Speaking",
};

type TaskRow = LearningStudyTask & { clientKey: string };

type Props = {
  initialTasks: LearningStudyTask[];
  userId: string;
};

function withClientKeys(tasks: LearningStudyTask[]): TaskRow[] {
  return tasks.map((t, i) => ({ ...t, clientKey: `${t.id}__${i}` }));
}

function groupTasks(tasks: TaskRow[]) {
  const visible = tasks.filter((t) => t.status !== "skipped");
  const videos = visible.filter((t) => t.task_type === "watch");
  const practice = visible.filter(
    (t) => t.task_type === "practice" || t.task_type === "submit",
  );
  const other = visible.filter(
    (t) =>
      t.task_type !== "watch" &&
      t.task_type !== "practice" &&
      t.task_type !== "submit",
  );
  return {
    videos,
    practice: [...practice, ...other],
  };
}

function sumMinutes(tasks: LearningStudyTask[]): number {
  return tasks.reduce((acc, t) => acc + (t.duration_min ?? 0), 0);
}

function TaskGroup({
  title,
  icon: Icon,
  tasks,
  pending,
  onToggle,
}: {
  title: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  tasks: TaskRow[];
  pending: boolean;
  onToggle: (task: TaskRow) => void;
}) {
  const minutes = sumMinutes(tasks);

  if (tasks.length === 0) return null;

  return (
    <div>
      <div className="mb-2.5 flex items-center justify-between">
        <p className="flex items-center gap-2 text-[13px] font-semibold text-navy">
          <Icon className="size-4 text-cyan" strokeWidth={2} />
          {title}
        </p>
        <span className="font-mono text-[11px] text-muted">
          ~{minutes} min
        </span>
      </div>
      <ul className={cn("space-y-2", pending && "opacity-80")}>
        {tasks.map((task) => {
          const ModuleIcon = moduleIcons[task.module] ?? BookIcon;
          const done = task.status === "done";

          return (
            <li key={task.clientKey}>
              <div
                className={cn(
                  "flex items-center gap-3 rounded-xl border border-border-soft bg-white px-3 py-3 sm:px-4",
                  done && "opacity-75",
                )}
              >
                <button
                  type="button"
                  onClick={() => onToggle(task)}
                  aria-label={done ? "Mark pending" : "Mark done"}
                  className={cn(
                    "flex size-5 shrink-0 items-center justify-center rounded border transition-colors",
                    done
                      ? "border-cyan bg-cyan text-white"
                      : "border-border-soft hover:border-cyan/50",
                  )}
                >
                  {done ? <Check className="size-3" strokeWidth={3} /> : null}
                </button>
                <Link
                  href={task.href || "/study-plan"}
                  className="flex min-w-0 flex-1 items-center gap-3"
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-cyan-soft text-cyan">
                    <ModuleIcon className="size-[18px]" strokeWidth={2} />
                  </span>
                  <span className="min-w-0">
                    <p className="truncate text-sm font-semibold text-navy">
                      {task.title}
                    </p>
                    <p className="text-xs text-muted">
                      {MODULE_LABEL[task.module] ?? task.module}
                      {" · "}
                      {task.subtitle || `~${task.duration_min} min`}
                    </p>
                  </span>
                </Link>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function TodaysPlanPanel({ initialTasks, userId: _userId }: Props) {
  const [tasks, setTasks] = useState(() => withClientKeys(initialTasks));
  const [pending, startTransition] = useTransition();

  const { videos, practice } = useMemo(() => groupTasks(tasks), [tasks]);

  const dateLabel = new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    month: "short",
    day: "numeric",
  })
    .format(new Date())
    .replace(",", " ·");

  function toggleTask(task: TaskRow) {
    const nextStatus = task.status === "done" ? "pending" : "done";
    setTasks((prev) =>
      prev.map((t) =>
        t.clientKey === task.clientKey ? { ...t, status: nextStatus } : t,
      ),
    );
    startTransition(async () => {
      try {
        await patchLearningTask(task.id, nextStatus);
      } catch {
        setTasks((prev) =>
          prev.map((t) =>
            t.clientKey === task.clientKey ? { ...t, status: task.status } : t,
          ),
        );
      }
    });
  }

  const hasTasks = videos.length > 0 || practice.length > 0;

  return (
    <section className="bf-dash-enter">
      <div className="mb-3.5 flex items-center justify-between">
        <span className="font-mono text-xs tracking-[0.1em] text-muted-light uppercase">
          Today&apos;s plan
        </span>
        <span className="font-mono text-xs text-cyan">{dateLabel}</span>
      </div>

      {!hasTasks ? (
        <p className="rounded-[0.9375rem] border border-border-soft bg-white px-5 py-4 text-sm text-muted">
          No tasks scheduled for today.{" "}
          <Link href="/study-plan" className="font-semibold text-cyan hover:underline">
            View full study plan
          </Link>
        </p>
      ) : (
        <div className="space-y-5 rounded-2xl border border-border-soft bg-white p-4 sm:p-5">
          <TaskGroup
            title="Videos"
            icon={Play}
            tasks={videos}
            pending={pending}
            onToggle={toggleTask}
          />
          <TaskGroup
            title="Practice"
            icon={Target}
            tasks={practice}
            pending={pending}
            onToggle={toggleTask}
          />
        </div>
      )}
    </section>
  );
}
