import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  BF_PRIMARY_CTA_GRADIENT,
  BF_PRIMARY_CTA_HOVER,
} from "@/components/bandforge/bf-primary-cta-styles";
import { cn } from "@/lib/utils";

const BASE =
  "inline-flex cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-full border border-transparent font-semibold text-white no-underline shadow-[0_8px_22px_rgb(0_151_167/0.28)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan/40 focus-visible:ring-offset-2";

type SeoPrimaryCtaProps = {
  href: string;
  children: React.ReactNode;
  arrow?: boolean;
  className?: string;
};

/** Primary CTA for SEO pages — matches hero gradient button. */
export function SeoPrimaryCta({
  href,
  children,
  arrow = true,
  className,
}: SeoPrimaryCtaProps) {
  return (
    <Link
      href={href}
      prefetch
      className={cn(
        BASE,
        BF_PRIMARY_CTA_GRADIENT,
        BF_PRIMARY_CTA_HOVER,
        "h-11 w-full max-w-xs px-6 text-sm sm:w-auto sm:px-7",
        className,
      )}
    >
      {children}
      {arrow ? (
        <ArrowRight className="size-4" strokeWidth={2.25} aria-hidden />
      ) : null}
    </Link>
  );
}

type SeoSecondaryCtaProps = {
  href: string;
  children: React.ReactNode;
  className?: string;
};

/** Quiet text-style secondary link — not a second gradient button. */
export function SeoSecondaryCta({
  href,
  children,
  className,
}: SeoSecondaryCtaProps) {
  return (
    <Link
      href={href}
      prefetch
      className={cn(
        "inline-flex h-11 items-center justify-center px-1 text-sm font-semibold text-[#0097a7] no-underline transition-colors hover:text-[#00bcd4]",
        className,
      )}
    >
      {children}
    </Link>
  );
}
