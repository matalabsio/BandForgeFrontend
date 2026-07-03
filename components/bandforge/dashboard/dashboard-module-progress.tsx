import Link from "next/link";
import {
  BookIcon,
  HeadphonesIcon,
  MicIcon,
  PencilIcon,
} from "@/components/bandforge/dashboard/icons";
import { DashboardModuleProgressAction } from "@/components/bandforge/dashboard/dashboard-module-progress-action";
import type { DashboardRecentAttempt } from "@/components/bandforge/dashboard/types";
import type { DashboardModule } from "@/components/bandforge/dashboard/types";
import {
  countCompletedForModule,
  moduleBandLabel,
  type ModuleBand,
} from "@/components/scores/scores-utils";
import { mockTestNumberPath } from "@/lib/mock-catalog";
import type { ResultModule } from "@/lib/exam-session-storage";
import type { ComponentType, SVGProps } from "react";
import { cn } from "@/lib/utils";

const moduleIcons: Record<
  DashboardModule,
  ComponentType<SVGProps<SVGSVGElement>>
> = {
  listening: HeadphonesIcon,
  reading: BookIcon,
  writing: PencilIcon,
  speaking: MicIcon,
};

function StatusPill() {
  return (
    <span className="mt-1.5 inline-flex items-center gap-1 self-start rounded-full bg-[#e5eef9] px-2 py-0.5 text-[0.625rem] font-semibold text-[#3b6fb0] lg:mt-2 lg:py-1 lg:text-[0.6875rem]">
      Under review
    </span>
  );
}

function BandScore({
  displayBand,
  hasBand,
  underReview,
  size = "sm",
}: {
  displayBand: string;
  hasBand: boolean;
  underReview: boolean;
  size?: "sm" | "lg";
}) {
  return (
    <div className="shrink-0 text-right">
      <p
        className={cn(
          "font-mono leading-none font-medium",
          size === "lg" ? "text-2xl" : "text-lg min-[520px]:text-xl",
          hasBand
            ? "text-cyan"
            : underReview
              ? "text-[#3b6fb0]"
              : "text-muted-light",
        )}
      >
        {displayBand}
      </p>
      <p className="mt-0.5 text-[0.625rem] text-muted-light min-[520px]:text-[0.65625rem]">
        {hasBand ? "band" : underReview ? "status" : "band"}
      </p>
    </div>
  );
}

export function DashboardModuleProgress({
  recent,
  bands,
  testedCount,
  moduleCount,
}: {
  recent: DashboardRecentAttempt[];
  bands: ModuleBand[];
  testedCount: number;
  moduleCount: number;
}) {
  const testedLabel = `${testedCount} / ${moduleCount} tested`;

  return (
    <section>
      <div className="mb-3 flex items-center justify-between lg:hidden">
        <span className="font-mono text-[0.6875rem] tracking-[0.1em] text-muted-light uppercase">
          Your modules
        </span>
        <span className="font-mono text-[0.6875rem] text-muted-light">
          {testedLabel}
        </span>
      </div>
      <ul className="grid grid-cols-1 items-stretch gap-2.5 min-[520px]:grid-cols-2 min-[520px]:gap-3 lg:grid-cols-5 lg:gap-3">
        {bands.map((mod) => {
          const Icon = moduleIcons[mod.module];
          const testsDone = countCompletedForModule(recent, mod.module, mod.part);
          const hasBand = mod.band != null && mod.band > 0;
          const underReview = mod.reviewState === "under_review";
          const progress = hasBand
            ? Math.min(100, Math.round((mod.band! / 9) * 100))
            : 0;
          const displayBand = moduleBandLabel(mod.band, mod.reviewState, mod.live);
          const actionLabel =
            testsDone > 0 ? (mod.href ? "View results" : "Continue") : "Start";
          const href = mod.href ?? mockTestNumberPath(1);
          const actionClassName =
            "mt-auto flex w-full items-center justify-center rounded-full bg-cyan py-2 text-xs font-semibold text-white transition-colors hover:bg-brand-sky-hover min-[520px]:py-2.5 min-[520px]:text-sm lg:py-3 lg:text-sm";

          return (
            <li key={mod.key} className="flex min-w-0">
              <article className="flex h-full w-full flex-col rounded-2xl border border-border-soft border-l-[3px] border-l-cyan bg-white p-3 min-[520px]:p-3.5 lg:p-[18px]">
                <div className="flex items-start gap-2.5 lg:hidden">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-cyan-soft text-cyan min-[520px]:size-10">
                    <Icon
                      className="size-[18px] min-[520px]:size-5"
                      strokeWidth={2}
                    />
                  </div>
                  <div className="flex min-w-0 flex-1 items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="truncate font-display text-[0.9375rem] font-bold leading-tight text-navy min-[520px]:text-base">
                        {mod.label}
                      </h3>
                      <p className="mt-0.5 text-[0.6875rem] text-muted-light min-[520px]:text-[0.75rem]">
                        {testsDone} {testsDone === 1 ? "attempt" : "attempts"}
                      </p>
                      {underReview ? <StatusPill /> : null}
                    </div>
                    <BandScore
                      displayBand={displayBand}
                      hasBand={hasBand}
                      underReview={underReview}
                    />
                  </div>
                </div>

                <div className="hidden lg:block">
                  <div className="mb-3.5 flex items-start justify-between gap-2">
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-cyan-soft text-cyan">
                      <Icon className="size-[23px]" strokeWidth={2} />
                    </div>
                    <BandScore
                      displayBand={displayBand}
                      hasBand={hasBand}
                      underReview={underReview}
                      size="lg"
                    />
                  </div>
                  <h3 className="font-display text-lg font-bold text-navy">
                    {mod.label}
                  </h3>
                  <p className="mt-1 text-[0.78125rem] text-muted-light">
                    {testsDone} {testsDone === 1 ? "attempt" : "attempts"}
                  </p>
                  {underReview ? <StatusPill /> : null}
                </div>

                <div
                  className={cn(
                    "h-1.5 overflow-hidden rounded bg-[#edf1f6] lg:h-[7px]",
                    underReview ? "mt-2 mb-2 lg:mb-3" : "my-2 lg:my-3",
                  )}
                >
                  <div
                    className="h-full rounded bg-cyan transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                {mod.href && mod.attemptId && mod.testNumber != null ? (
                  <DashboardModuleProgressAction
                    href={href}
                    testNumber={mod.testNumber}
                    module={mod.module as ResultModule}
                    attemptId={mod.attemptId}
                    className={actionClassName}
                  >
                    {actionLabel}
                  </DashboardModuleProgressAction>
                ) : (
                  <Link href={href} className={actionClassName}>
                    {actionLabel}
                  </Link>
                )}
              </article>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
