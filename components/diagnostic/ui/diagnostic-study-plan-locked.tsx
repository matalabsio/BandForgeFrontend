import Link from "next/link";
import { Lock } from "lucide-react";
import { bfPrimaryCtaNavClass } from "@/components/bandforge/bf-primary-cta-styles";
import type { StudyPlanWeek } from "@/lib/diagnostic-plan-content";
import { cn } from "@/lib/utils";

type Props = {
  weeks: StudyPlanWeek[];
  unlocked?: boolean;
};

export function DiagnosticStudyPlanLocked({ weeks, unlocked = false }: Props) {
  if (unlocked) {
    return (
      <div className="overflow-hidden rounded-2xl border border-[#E8EDF3] bg-white shadow-[0_2px_12px_rgba(13,31,60,0.05)] sm:rounded-[18px]">
        <div className="p-[18px] sm:p-[22px] sm:px-[26px]">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-4">
            {weeks.map((week) => (
              <div key={week.title}>
                <p className="mb-2.5 font-display text-sm font-bold text-[#0097A7] sm:mb-2.5 sm:text-sm">
                  {week.title}
                </p>
                <div className="space-y-0 text-[12.5px] leading-[1.95] font-normal text-[#475569] sm:text-[13px] sm:leading-8">
                  {week.items.map((item) => (
                    <p key={item}>{item}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-[#E8EDF3] bg-white shadow-[0_2px_12px_rgba(13,31,60,0.05)] sm:rounded-[18px]">
      <div className="pointer-events-none select-none blur-[5px]">
        <div className="p-[18px] sm:p-[22px] sm:px-[26px]">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-4">
            {weeks.map((week) => (
              <div key={week.title}>
                <p className="mb-2.5 font-display text-sm font-bold text-[#0097A7] sm:mb-2.5 sm:text-sm">
                  {week.title}
                </p>
                <div className="space-y-0 text-[12.5px] leading-[1.95] font-normal text-[#475569] sm:text-[13px] sm:leading-8">
                  {week.items.map((item) => (
                    <p key={item}>{item}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2.5 bg-[rgba(248,250,252,0.55)] px-6 sm:gap-[13px]">
        <div className="flex size-[46px] items-center justify-center rounded-full bg-[#0D1F3C] shadow-[0_8px_20px_rgba(13,31,60,0.30)] sm:size-[52px] sm:shadow-[0_10px_24px_rgba(13,31,60,0.30)]">
          <Lock className="size-5 text-white sm:size-[22px]" strokeWidth={2} />
        </div>
        <p className="text-[13.5px] font-semibold text-[#0D1F3C] sm:text-[15px]">
          <span className="sm:hidden">Purchase to unlock</span>
          <span className="hidden sm:inline">Purchase your plan to unlock.</span>
        </p>
        <Link
          href="/pricing"
          className={cn(bfPrimaryCtaNavClass, "mt-1")}
        >
          View subscription plans
        </Link>
      </div>
    </div>
  );
}
