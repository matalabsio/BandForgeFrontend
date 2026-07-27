import { SeoPrimaryCta } from "@/components/seo/seo-cta-button";
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
        <SeoPrimaryCta href={diagnosticPaths.landing} className="shrink-0">
          Start free diagnostic
        </SeoPrimaryCta>
      </div>
    </div>
  );
}
