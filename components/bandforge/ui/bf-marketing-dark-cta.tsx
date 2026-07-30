import type { ReactNode } from "react";
import { BandForgeLogoMark } from "@/components/bandforge/bandforge-logo-link";
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
        "bf-ambient bg-navy bg-[radial-gradient(360px_200px_at_50%_0%,rgb(0_151_167/0.22),transparent_72%)] lg:bg-[radial-gradient(640px_300px_at_50%_0%,rgb(0_151_167/0.2),transparent_70%)]",
        gradientClassName,
        className,
      )}
    >
      <div className="bf-container flex flex-col items-center py-10 text-center sm:py-12 lg:py-[5.25rem]">
        <div className="mb-5 flex justify-center sm:mb-6 lg:mb-[26px]">
          <div className="rounded-md bg-white px-3 py-1.5">
            <BandForgeLogoMark size="sm" className="lg:hidden" />
            <BandForgeLogoMark size="md" className="hidden lg:block" />
          </div>
        </div>
        <h2 className="font-display mx-auto mb-6 max-w-[22ch] text-[1.5rem] leading-[1.15] font-bold tracking-[-0.025em] text-balance text-white sm:mb-7 sm:max-w-[24ch] sm:text-[1.625rem] lg:mb-8 lg:max-w-[28ch] lg:text-[2.625rem] lg:leading-[1.1] lg:tracking-[-0.035em]">
          {headline}
        </h2>
        <div className="flex w-full max-w-md flex-col items-center lg:max-w-none">
          {children}
        </div>
      </div>
    </section>
  );
}
