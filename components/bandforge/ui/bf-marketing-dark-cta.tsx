import type { ReactNode } from "react";
import { BfBrandBars } from "@/components/bandforge/bf-brand-bars";
import { cn } from "@/lib/utils";

type Props = {
  headline: string;
  children: ReactNode;
  className?: string;
  gradientClassName?: string;
  id?: string;
};

/** Navy gradient CTA block with brand bars — landing and about variants. */
export function BfMarketingDarkCta({
  headline,
  children,
  className,
  gradientClassName,
  id,
}: Props) {
  return (
    <section
      id={id}
      className={cn(
        "bg-navy bg-[radial-gradient(360px_200px_at_50%_0%,rgb(0_151_167/0.22),transparent_72%)] lg:bg-[radial-gradient(640px_300px_at_50%_0%,rgb(0_151_167/0.2),transparent_70%)]",
        gradientClassName,
        className,
      )}
    >
      <div className="bf-container px-7 py-[3.25rem] text-center lg:px-10 lg:py-[5.25rem]">
        <div className="mb-6 flex h-7 items-end justify-center gap-1.5 lg:mb-[26px] lg:h-10 lg:gap-[9px]">
          <BfBrandBars size="sm" className="h-7 lg:hidden" />
          <BfBrandBars size="md" className="hidden h-10 lg:flex" />
        </div>
        <h2 className="font-display mx-auto mb-7 max-w-[20ch] text-[1.625rem] leading-[1.15] font-bold tracking-[-0.025em] text-balance text-white lg:mb-8 lg:text-[2.625rem] lg:leading-[1.1] lg:tracking-[-0.035em]">
          {headline}
        </h2>
        {children}
      </div>
    </section>
  );
}
