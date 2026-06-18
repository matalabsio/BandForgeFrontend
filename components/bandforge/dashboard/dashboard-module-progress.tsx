import Link from "next/link";
import {
  BookIcon,
  HeadphonesIcon,
  MicIcon,
  PencilIcon,
} from "@/components/bandforge/dashboard/icons";
import { BRAND_DASHBOARD_MODULE_PROGRESS } from "@/lib/brand-mock-data";
import type { ModuleKey } from "@/lib/brand-mock-data";
import type { ComponentType, SVGProps } from "react";
import { cn } from "@/lib/utils";

const moduleIcons: Record<
  ModuleKey,
  ComponentType<SVGProps<SVGSVGElement>>
> = {
  listening: HeadphonesIcon,
  reading: BookIcon,
  writing: PencilIcon,
  speaking: MicIcon,
};

function StatusPill({
  status,
}: {
  status: "ai_feedback_ready" | "under_review";
}) {
  if (status === "ai_feedback_ready") {
    return (
      <span className="inline-flex items-center gap-1 self-start rounded-full bg-[#fbf1d9] px-2 py-1 text-[0.6875rem] font-semibold text-[#b7791f]">
        AI Feedback Ready
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 self-start rounded-full bg-[#e5eef9] px-2 py-1 text-[0.6875rem] font-semibold text-[#3b6fb0]">
      Under Review
    </span>
  );
}

export function DashboardModuleProgress() {
  return (
    <section>
      <div className="mb-3.5 flex items-center justify-between lg:hidden">
        <span className="font-mono text-[0.6875rem] tracking-[0.1em] text-muted-light uppercase">
          Your modules
        </span>
        <span className="font-mono text-[0.6875rem] text-muted-light">
          4 / 4 tested
        </span>
      </div>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {BRAND_DASHBOARD_MODULE_PROGRESS.map((mod) => {
          const Icon = moduleIcons[mod.key];
          return (
            <li key={mod.key}>
              <article className="flex h-full flex-col rounded-2xl border border-border-soft border-l-[3px] border-l-cyan bg-white p-5">
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex size-11 items-center justify-center rounded-xl bg-cyan-soft text-cyan">
                    <Icon className="size-[23px]" strokeWidth={2} />
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-2xl leading-none font-medium text-cyan">
                      {mod.band?.toFixed(1) ?? "—"}
                    </p>
                    <p className="mt-0.5 text-[0.65625rem] text-muted-light">
                      band
                    </p>
                  </div>
                </div>
                <h3 className="font-display text-lg font-bold text-navy">
                  {mod.title}
                </h3>
                <p className="mt-1 text-[0.78125rem] text-muted-light">
                  {mod.testsCompleted} / {mod.totalTests} tests
                </p>
                {mod.status ? <StatusPill status={mod.status} /> : null}
                <div
                  className={cn(
                    "h-[7px] overflow-hidden rounded bg-[#edf1f6]",
                    mod.status ? "mt-2.5 mb-4" : "my-3.5",
                  )}
                >
                  <div
                    className="h-full rounded bg-cyan"
                    style={{ width: `${mod.progress}%` }}
                  />
                </div>
                <Link
                  href={mod.href}
                  className="mt-auto flex w-full items-center justify-center rounded-full bg-cyan py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-sky-hover"
                >
                  {mod.nextAction}
                </Link>
              </article>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
