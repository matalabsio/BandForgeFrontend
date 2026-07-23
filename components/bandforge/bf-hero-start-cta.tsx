import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { diagnosticPaths } from "@/lib/diagnostic-catalog";

type Props = {
  className: string;
};

/** Hero primary CTA — free diagnostic (no login required). */
export function BfHeroStartCta({ className }: Props) {
  return (
    <Link
      href={diagnosticPaths.landing}
      prefetch
      className={className}
      aria-label="Start free diagnostic"
    >
      Start free
      <ArrowRight className="size-[1.125rem] shrink-0" strokeWidth={2.25} aria-hidden />
    </Link>
  );
}
