import { diagnosticPaths } from "@/lib/diagnostic-catalog";

export type DiagnosticTransitionSlug =
  | "listening-reading"
  | "reading-writing"
  | "writing-speaking";

export type DiagnosticTransitionConfig = {
  slug: DiagnosticTransitionSlug;
  completedLabel: string;
  nextLabel: string;
  quote: string;
  quoteAttribution: string;
  quoteLocation: string;
  quoteInitials: string;
  ctaLabel: string;
  nextPath: string;
  countdownSec: number;
};

export const DIAGNOSTIC_TRANSITIONS: Record<
  DiagnosticTransitionSlug,
  DiagnosticTransitionConfig
> = {
  "listening-reading": {
    slug: "listening-reading",
    completedLabel: "Listening complete.",
    nextLabel: "Reading",
    quote:
      "I went from Band 6 to Band 7.5 in six weeks. The diagnostic told me exactly what to fix.",
    quoteAttribution: "Priya M.",
    quoteLocation: "Hyderabad",
    quoteInitials: "PM",
    ctaLabel: "Begin Reading",
    nextPath: diagnosticPaths.reading,
    countdownSec: 10,
  },
  "reading-writing": {
    slug: "reading-writing",
    completedLabel: "Reading complete.",
    nextLabel: "Writing",
    quote:
      "Most candidates underestimate their Writing band by 1.5 bands — find out yours.",
    quoteAttribution: "Arjun K.",
    quoteLocation: "Bengaluru",
    quoteInitials: "AK",
    ctaLabel: "Begin Writing",
    nextPath: diagnosticPaths.writing,
    countdownSec: 10,
  },
  "writing-speaking": {
    slug: "writing-speaking",
    completedLabel: "Writing complete.",
    nextLabel: "Speaking",
    quote:
      "Speaking practice with clear timers made my real test feel familiar.",
    quoteAttribution: "Neha S.",
    quoteLocation: "Mumbai",
    quoteInitials: "NS",
    ctaLabel: "Begin Speaking",
    nextPath: diagnosticPaths.speaking,
    countdownSec: 10,
  },
};

export function diagnosticTransitionPath(slug: DiagnosticTransitionSlug): string {
  return `${diagnosticPaths.transition}/${slug}`;
}

export function isDiagnosticTransitionSlug(
  value: string,
): value is DiagnosticTransitionSlug {
  return value in DIAGNOSTIC_TRANSITIONS;
}
