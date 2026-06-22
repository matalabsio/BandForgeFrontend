import type { LucideIcon } from "lucide-react";

type Props = {
  label: string;
  band: string;
  weakness: string;
  Icon: LucideIcon;
};

export function DiagnosticReportModuleCard({
  label,
  band,
  weakness,
  Icon,
}: Props) {
  return (
    <div className="rounded-2xl border border-navy/[0.07] bg-[#F4F7FA] p-4 sm:p-5">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2.5">
          <Icon className="size-5 shrink-0 text-cyan" strokeWidth={2} />
          <span className="truncate text-sm font-medium text-[#1B2B45] sm:text-[15px]">
            {label}
          </span>
        </div>
        <span className="shrink-0 font-mono text-xl font-medium text-teal sm:text-[30px]">
          {band}
        </span>
      </div>
      <p className="text-[11.5px] leading-snug font-light text-[#6E83A0] sm:text-[13px] sm:leading-[1.45]">
        {weakness}
      </p>
    </div>
  );
}
