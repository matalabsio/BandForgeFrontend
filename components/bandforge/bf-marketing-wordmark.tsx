import Link from "next/link";
import { BfBrandBars } from "@/components/bandforge/bf-brand-bars";
import { cn } from "@/lib/utils";

type Props = {
  href?: string;
  className?: string;
};

/** Text wordmark + bars — matches brand landing header (mobile + desktop). */
export function BfMarketingWordmark({ href = "/", className }: Props) {
  return (
    <Link
      href={href}
      prefetch
      className={cn(
        "inline-flex shrink-0 items-center gap-[9px] transition-opacity hover:opacity-90 lg:gap-[11px]",
        className,
      )}
      aria-label="BandForge home"
    >
      <BfBrandBars size="sm" className="lg:hidden" />
      <BfBrandBars size="lg" className="hidden lg:flex" />
      <span className="font-display text-[1.1875rem] leading-none font-bold tracking-[-0.025em] lg:text-[1.4375rem]">
        <span className="text-navy">Band</span>
        <span className="text-cyan">Forge</span>
      </span>
    </Link>
  );
}
