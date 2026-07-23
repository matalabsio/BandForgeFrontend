import type { ComponentType, SVGProps } from "react";
import { cn } from "@/lib/utils";

type Props = {
  title: string;
  description: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
  band?: string | null;
  className?: string;
};

export function BfModuleCard({
  title,
  description,
  Icon,
  band = null,
  className,
}: Props) {
  return (
    <article
      className={cn(
        "rounded-[14px] border-l-[3px] border-l-cyan bg-white p-5 shadow-[0_2px_10px_rgb(15_25_35/0.04)]",
        "lg:rounded-2xl lg:border-t-[3px] lg:border-l-0 lg:p-[26px] lg:shadow-[0_4px_16px_rgb(15_25_35/0.05)]",
        className,
      )}
    >
      <div className="mb-2.5 flex items-center gap-[11px] sm:flex-col sm:items-center lg:mb-[18px] lg:items-start">
        <div className="flex size-[38px] shrink-0 items-center justify-center rounded-[10px] bg-[#e6f6f8] text-cyan lg:mb-[18px] lg:size-[46px] lg:rounded-xl">
          <Icon className="size-5 lg:size-6" strokeWidth={2} />
        </div>
        <div className="flex min-w-0 flex-1 items-center justify-between gap-3 sm:flex-col sm:justify-center lg:block lg:w-full">
          <h3 className="font-display text-[1.0625rem] font-bold text-navy lg:text-[1.1875rem]">
            {title}
          </h3>
          <p className="shrink-0 font-mono text-[0.6875rem] text-muted-light lg:mt-[18px] lg:hidden">
            Your band:{" "}
            <span className="font-medium text-cyan">{band ?? "—"}</span>
          </p>
        </div>
      </div>
      <p className="text-[0.84375rem] leading-normal text-muted lg:mb-[18px] lg:text-sm lg:leading-[1.55]">
        {description}
      </p>
      <p className="mt-0 hidden border-t border-[#eef2f6] pt-3.5 font-mono text-xs text-muted-light lg:block">
        Your band:{" "}
        <span className="font-medium text-cyan">{band ?? "—"}</span>
      </p>
    </article>
  );
}
