import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { diagnosticPaths } from "@/lib/diagnostic-catalog";

type Props = {
  className: string;
};

/** Hero primary CTA — diagnostic test (no login required). */
export function BfHeroStartCta({ className }: Props) {
  return (
    <Link
      href={diagnosticPaths.landing}
      prefetch
      className={className}
      aria-label="Diagnostic test — take the 90-minute IELTS test"
    >
      <span className="relative z-[1]">Diagnostic test</span>
      <ArrowRight
        className="relative z-[1] size-[1.125rem] shrink-0 transition-[transform,color] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-1"
        strokeWidth={2.25}
        aria-hidden
      />
    </Link>
  );
}
