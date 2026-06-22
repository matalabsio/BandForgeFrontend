"use client";

import Link from "next/link";
import { diagnosticPaths } from "@/lib/diagnostic-catalog";

type Props = {
  className: string;
};

/** Hero primary CTA — free diagnostic (no login required). */
export function BfHeroStartCta({ className }: Props) {
  return (
    <Link href={diagnosticPaths.landing} prefetch className={className}>
      Take the Free Diagnostic Test
    </Link>
  );
}
