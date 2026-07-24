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
      aria-label="Free diagnostic — take the 90-minute IELTS test"
    >
      Free diagnostic
      <ArrowRight
        className="size-[1.125rem] shrink-0 transition-transform duration-300 ease-out group-hover:translate-x-1"
        strokeWidth={2.25}
        aria-hidden
      />
    </Link>
  );
}
