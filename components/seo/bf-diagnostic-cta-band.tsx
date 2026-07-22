import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { diagnosticPaths } from "@/lib/diagnostic-catalog";

type Props = {
  headline?: string;
  subline?: string;
};

/** Above-the-fold diagnostic CTA — required on language and local landings. */
export function BfDiagnosticCtaBand({
  headline = "Find your real IELTS band in 15 minutes — free.",
  subline = "No payment required. Section-wise scores in minutes.",
}: Props) {
  return (
    <div className="border-b border-teal/20 bg-teal/5">
      <div className="bf-container flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:py-6">
        <div>
          <p className="font-display text-base font-semibold text-navy sm:text-lg">
            {headline}
          </p>
          <p className="mt-1 text-sm text-ink/60">{subline}</p>
        </div>
        <Link
          href={diagnosticPaths.landing}
          prefetch
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-cyan px-5 py-3 font-display text-sm font-semibold text-white no-underline shadow-[0_8px_20px_rgb(0_151_167/0.3)] transition-colors hover:bg-brand-sky-hover sm:px-6 sm:text-[0.9375rem]"
        >
          Start free diagnostic
          <ArrowRight className="size-4 shrink-0" strokeWidth={2.25} aria-hidden />
        </Link>
      </div>
    </div>
  );
}
