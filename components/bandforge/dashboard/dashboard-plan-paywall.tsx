import Link from "next/link";
import { Lock } from "lucide-react";

export function DashboardPlanPaywall() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-[#E8EDF3] bg-white shadow-[0_2px_12px_rgba(13,31,60,0.05)] sm:rounded-[18px]">
      <div className="pointer-events-none select-none blur-[5px]">
        <div className="space-y-4 p-[18px] sm:p-[22px] sm:px-[26px]">
          <div className="h-24 rounded-xl bg-[#EEF2F7]" />
          <div className="grid grid-cols-2 gap-3">
            <div className="h-16 rounded-xl bg-[#EEF2F7]" />
            <div className="h-16 rounded-xl bg-[#EEF2F7]" />
            <div className="h-16 rounded-xl bg-[#EEF2F7]" />
            <div className="h-16 rounded-xl bg-[#EEF2F7]" />
          </div>
          <div className="h-32 rounded-xl bg-[#EEF2F7]" />
        </div>
      </div>

      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2.5 bg-[rgba(248,250,252,0.55)] px-6 sm:gap-[13px]">
        <div className="flex size-[46px] items-center justify-center rounded-full bg-[#0D1F3C] shadow-[0_8px_20px_rgba(13,31,60,0.30)] sm:size-[52px] sm:shadow-[0_10px_24px_rgba(13,31,60,0.30)]">
          <Lock className="size-5 text-white sm:size-[22px]" strokeWidth={2} />
        </div>
        <p className="text-center text-[13.5px] font-semibold text-[#0D1F3C] sm:text-[15px]">
          Unlock your personalised study plan
        </p>
        <p className="max-w-sm text-center text-[12.5px] text-[#475569] sm:text-[13px]">
          Get daily videos, practice tasks, hub progress, and mock unlocks with
          the Full Skill Program.
        </p>
        <Link
          href="/diagnostic/results?checkout=1"
          className="mt-1 inline-flex h-10 cursor-pointer items-center justify-center rounded-full bg-cyan px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-sky-hover"
        >
          View your plan &amp; subscribe
        </Link>
      </div>
    </div>
  );
}
