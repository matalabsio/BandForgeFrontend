import { Sparkles } from "lucide-react";
import type { PlanPreview } from "@/lib/plan-preview";
import { skillLabel } from "@/lib/diagnostic-performance";
import type { SkillKey } from "@/lib/diagnostic-performance";
import { formatSessionOrder } from "@/lib/plan-preview";

type Props = {
  preview: PlanPreview;
};

function daySplitLabel(preview: PlanPreview): string {
  const keys: SkillKey[] = ["listening", "reading", "writing", "speaking"];
  return keys
    .map((k) => `${skillLabel(k).charAt(0)} ${preview.dayAllocation[k]}`)
    .join(" · ");
}

export function DiagnosticPlanPreviewSection({ preview }: Props) {
  return (
    <section className="rounded-2xl border border-[#E8EDF3] bg-white p-5 shadow-[0_2px_12px_rgba(13,31,60,0.05)] sm:p-6">
      <div className="mb-4 flex items-center gap-2">
        <Sparkles className="size-5 text-[#0097A7]" strokeWidth={2} />
        <h2 className="font-display text-lg font-bold text-[#0D1F3C]">
          Your personalised plan preview
        </h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl bg-[#F8FAFC] px-4 py-3">
          <p className="text-[10px] font-semibold tracking-[0.08em] text-[#94A3B8] uppercase">
            Primary focus
          </p>
          <p className="mt-1 text-sm font-semibold text-[#0D1F3C]">
            {preview.focusLabel}
          </p>
        </div>
        <div className="rounded-xl bg-[#F8FAFC] px-4 py-3">
          <p className="text-[10px] font-semibold tracking-[0.08em] text-[#94A3B8] uppercase">
            Prep timeline
          </p>
          <p className="mt-1 text-sm font-semibold text-[#0D1F3C]">
            {preview.daysRemaining} days to test · {preview.totalDays}-day plan
          </p>
        </div>
        <div className="rounded-xl bg-[#F8FAFC] px-4 py-3">
          <p className="text-[10px] font-semibold tracking-[0.08em] text-[#94A3B8] uppercase">
            Day focus split
          </p>
          <p className="mt-1 font-mono text-sm font-medium text-[#0D1F3C]">
            {daySplitLabel(preview)}
          </p>
        </div>
        <div className="rounded-xl bg-[#F8FAFC] px-4 py-3">
          <p className="text-[10px] font-semibold tracking-[0.08em] text-[#94A3B8] uppercase">
            Daily session
          </p>
          <p className="mt-1 text-sm font-medium text-[#0D1F3C]">
            {preview.sessionPathKind === "foundation"
              ? "Foundation"
              : "Mixed rhythm"}
            {" · "}
            <span className="font-mono text-[#0097A7]">
              {formatSessionOrder(preview.sessionOrder)}
            </span>
          </p>
        </div>
      </div>

      <p className="mt-4 text-[13px] leading-relaxed text-[#5A6B82]">
        {preview.sessionPathDescription}
      </p>
    </section>
  );
}
