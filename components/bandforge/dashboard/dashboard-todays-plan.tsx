import {
  BookIcon,
  HeadphonesIcon,
  MicIcon,
  PencilIcon,
} from "@/components/bandforge/dashboard/icons";
import { BRAND_TODAYS_PLAN } from "@/lib/brand-mock-data";
import type { ModuleKey } from "@/lib/brand-mock-data";
import type { ComponentType, SVGProps } from "react";

const moduleIcons: Record<
  ModuleKey,
  ComponentType<SVGProps<SVGSVGElement>>
> = {
  listening: HeadphonesIcon,
  reading: BookIcon,
  writing: PencilIcon,
  speaking: MicIcon,
};

export function DashboardTodaysPlan() {
  const dateLabel =
    new Intl.DateTimeFormat("en-GB", {
      weekday: "short",
      month: "short",
      day: "numeric",
    }).format(new Date()).replace(",", " ·") ?? "Today";

  return (
    <section>
      <div className="mb-3.5 flex items-center justify-between">
        <span className="font-mono text-xs tracking-[0.1em] text-muted-light uppercase">
          Today&apos;s plan
        </span>
        <span className="font-mono text-xs text-cyan">{dateLabel}</span>
      </div>
      <div className="-mx-1 flex gap-4 overflow-x-auto px-1 pb-1">
        {BRAND_TODAYS_PLAN.map((task) => {
          const Icon = moduleIcons[task.moduleKey];
          return (
            <article
              key={task.id}
              className="flex w-[300px] shrink-0 items-center gap-[15px] rounded-[0.9375rem] border border-border-soft bg-white px-5 py-[18px]"
            >
              <div className="flex size-[42px] shrink-0 items-center justify-center rounded-[11px] bg-cyan-soft text-cyan">
                <Icon className="size-[22px]" strokeWidth={2} />
              </div>
              <div className="min-w-0">
                <p className="mb-1 font-mono text-[0.65625rem] tracking-[0.06em] text-cyan uppercase">
                  {task.module}
                </p>
                <p className="font-display text-base font-bold text-navy">
                  {task.title}
                </p>
                <p className="mt-0.5 text-[0.78125rem] font-light text-muted">
                  {task.subtitle}
                </p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
