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
      {/* Mobile: title row + band */}
      <div className="mb-2.5 flex items-center justify-between lg:hidden">
        <div className="flex items-center gap-[11px]">
          <div className="flex size-[38px] items-center justify-center rounded-[10px] bg-[#e6f6f8] text-cyan">
            <Icon className="size-5" strokeWidth={2} />
          </div>
          <h3 className="font-display text-[1.0625rem] font-bold text-navy">
            {title}
          </h3>
        </div>
        <p className="font-mono text-[0.6875rem] text-muted-light">
          Your band:{" "}
          <span className="font-medium text-cyan">{band ?? "—"}</span>
        </p>
      </div>

      {/* Desktop: icon block */}
      <div className="mb-[18px] hidden size-[46px] items-center justify-center rounded-xl bg-[#e6f6f8] text-cyan lg:flex">
        <Icon className="size-6" strokeWidth={2} />
      </div>
      <h3 className="font-display hidden text-[1.1875rem] font-bold text-navy lg:block">
        {title}
      </h3>
      <p className="text-[0.84375rem] leading-normal text-muted lg:mt-2.5 lg:mb-[18px] lg:text-sm lg:leading-[1.55]">
        {description}
      </p>
      <p className="mt-0 hidden border-t border-[#eef2f6] pt-3.5 font-mono text-xs text-muted-light lg:block">
        Your band:{" "}
        <span className="font-medium text-cyan">{band ?? "—"}</span>
      </p>
    </article>
  );
}
