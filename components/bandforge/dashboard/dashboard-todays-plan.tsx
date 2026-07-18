import Link from "next/link";
import {
  BookIcon,
  HeadphonesIcon,
  MicIcon,
  PencilIcon,
} from "@/components/bandforge/dashboard/icons";
import type { LearningStudyTask } from "@/lib/learning-types";
import type { ComponentType, SVGProps } from "react";

const moduleIcons: Record<
  string,
  ComponentType<SVGProps<SVGSVGElement>>
> = {
  listening: HeadphonesIcon,
  reading: BookIcon,
  writing: PencilIcon,
  speaking: MicIcon,
  vocabulary: BookIcon,
  grammar: PencilIcon,
};

const MODULE_LABEL: Record<string, string> = {
  listening: "Listening",
  reading: "Reading",
  writing: "Writing",
  speaking: "Speaking",
  vocabulary: "Vocabulary",
  grammar: "Grammar",
};

type Props = {
  tasks?: LearningStudyTask[];
};

export function DashboardTodaysPlan({ tasks = [] }: Props) {
  const dateLabel =
    new Intl.DateTimeFormat("en-GB", {
      weekday: "short",
      month: "short",
      day: "numeric",
    }).format(new Date()).replace(",", " ·") ?? "Today";

  const visible = tasks.filter((t) => t.status !== "skipped").slice(0, 4);

  return (
    <section>
      <div className="mb-3.5 flex items-center justify-between">
        <span className="font-mono text-xs tracking-[0.1em] text-muted-light uppercase">
          Today&apos;s plan
        </span>
        <span className="font-mono text-xs text-cyan">{dateLabel}</span>
      </div>
      {visible.length === 0 ? (
        <p className="rounded-[0.9375rem] border border-border-soft bg-white px-5 py-4 text-sm text-muted">
          Complete a practice set to unlock personalized daily tasks.{" "}
          <Link href="/study-plan" className="font-semibold text-cyan hover:underline">
            View study plan
          </Link>
        </p>
      ) : (
        <div className="-mx-1 flex gap-4 overflow-x-auto px-1 pb-1">
          {visible.map((task, index) => {
            const Icon = moduleIcons[task.module] ?? BookIcon;
            return (
              <Link
                key={`${task.id}-${index}`}
                href={task.href || "/mocks"}
                className="flex w-[300px] shrink-0 items-center gap-[15px] rounded-[0.9375rem] border border-border-soft bg-white px-5 py-[18px] transition-colors hover:border-cyan/40"
              >
                <div className="flex size-[42px] shrink-0 items-center justify-center rounded-[11px] bg-cyan-soft text-cyan">
                  <Icon className="size-[22px]" strokeWidth={2} />
                </div>
                <div className="min-w-0">
                  <p className="mb-1 font-mono text-[0.65625rem] tracking-[0.06em] text-cyan uppercase">
                    {MODULE_LABEL[task.module] ?? task.module}
                    {task.status === "done" ? " · Done" : ""}
                  </p>
                  <p className="font-display text-base font-bold text-navy">
                    {task.title}
                  </p>
                  <p className="mt-0.5 text-[0.78125rem] font-light text-muted">
                    {task.subtitle || `~${task.duration_min} min`}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
