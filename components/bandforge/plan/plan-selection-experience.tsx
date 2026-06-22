"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Check, Lock, MessageCircle, Shield } from "lucide-react";
import { BfSectionEyebrow, BfSectionHeading } from "@/components/bandforge/ui";
import {
  BRAND_DIAGNOSTIC_SECTIONS,
  BRAND_PLAN_PAGE_TIERS,
} from "@/lib/brand-mock-data";
import {
  readDiagnosticResults,
  type DiagnosticResultsSnapshot,
} from "@/lib/diagnostic-session";
import { marketingAppHref } from "@/components/bandforge/bf-marketing-auth-links";
import { cn } from "@/lib/utils";

function bandLabel(band: number | null | undefined): string {
  if (band == null || band <= 0) return "—";
  return band.toFixed(1);
}

function DiagnosticResultsPanel({
  results,
}: {
  results: DiagnosticResultsSnapshot;
}) {
  const rows = [
    { label: "Overall", score: bandLabel(results.aggregate_band) },
    { label: "Listening", score: bandLabel(results.listening_band) },
    { label: "Reading", score: bandLabel(results.reading_band) },
    { label: "Writing", score: bandLabel(results.writing_band) },
    { label: "Speaking", score: bandLabel(results.speaking_band) },
  ];

  return (
    <div className="rounded-2xl border border-border-soft bg-white p-6">
      <p className="font-display text-sm font-bold text-navy">
        Your diagnostic results
      </p>
      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {rows.map((s) => (
          <div key={s.label} className="text-center">
            <p className="font-mono text-2xl text-cyan">{s.score}</p>
            <p className="text-xs text-muted-light">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function TeaserResultsPanel() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border-soft bg-white p-6">
      <div className="pointer-events-none select-none blur-[6px]">
        <p className="font-display text-sm font-bold text-navy">
          Your diagnostic results
        </p>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {BRAND_DIAGNOSTIC_SECTIONS.map((s) => (
            <div key={s.label} className="text-center">
              <p className="font-mono text-2xl text-cyan">{s.score}</p>
              <p className="text-xs text-muted-light">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/60">
        <Lock className="size-8 text-navy" strokeWidth={1.75} />
        <p className="font-display mt-3 text-base font-bold text-navy">
          Complete the diagnostic to see your scores
        </p>
      </div>
    </div>
  );
}

export function PlanSelectionExperience() {
  const [results, setResults] = useState<DiagnosticResultsSnapshot | null>(null);

  useEffect(() => {
    setResults(readDiagnosticResults());
  }, []);

  return (
    <div className="space-y-8">
      <header>
        <BfSectionEyebrow>After your diagnostic</BfSectionEyebrow>
        <BfSectionHeading className="mt-2">
          Unlock your full band report
        </BfSectionHeading>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
          Your diagnostic is complete. Choose a plan to unlock AI insights, your
          study plan, and unlimited practice.
        </p>
      </header>

      {results ? (
        <DiagnosticResultsPanel results={results} />
      ) : (
        <TeaserResultsPanel />
      )}

      <div className="grid gap-5 lg:grid-cols-3 lg:items-start">
        {BRAND_PLAN_PAGE_TIERS.map((tier) => (
          <article
            key={tier.id}
            className={cn(
              "relative flex flex-col rounded-2xl border p-6 lg:p-8",
              tier.recommended
                ? "border-navy bg-navy text-white shadow-[0_18px_40px_rgb(13_31_60/0.2)]"
                : "border-border-muted bg-white",
            )}
          >
            {tier.recommended ? (
              <span className="absolute -top-3 left-6 rounded-full bg-[#d4a017] px-3 py-1 font-mono text-[0.625rem] tracking-[0.1em] text-navy uppercase">
                Most Popular
              </span>
            ) : null}
            <h3
              className={cn(
                "font-display text-xl font-bold",
                tier.recommended ? "text-white" : "text-navy",
              )}
            >
              {tier.name}
            </h3>
            <p className="mt-2">
              <span
                className={cn(
                  "font-mono text-3xl font-medium",
                  tier.recommended ? "text-cyan" : "text-cyan",
                )}
              >
                {tier.price}
              </span>
              {"period" in tier && tier.period ? (
                <span
                  className={cn(
                    "ml-1 text-sm",
                    tier.recommended ? "text-slate" : "text-muted-light",
                  )}
                >
                  {tier.period}
                </span>
              ) : null}
            </p>
            <p
              className={cn(
                "mt-3 text-sm leading-relaxed",
                tier.recommended ? "text-slate" : "text-muted",
              )}
            >
              {tier.description}
            </p>
            <ul className="mt-5 flex-1 space-y-2.5">
              {tier.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm">
                  <Check
                    className={cn(
                      "mt-0.5 size-4 shrink-0",
                      tier.recommended ? "text-cyan" : "text-cyan",
                    )}
                    strokeWidth={2.5}
                  />
                  <span className={tier.recommended ? "text-slate" : "text-muted"}>
                    {f}
                  </span>
                </li>
              ))}
            </ul>
            <Link
              href={tier.id === "free" ? marketingAppHref() : "#"}
              prefetch
              className={cn(
                "mt-6 flex w-full items-center justify-center rounded-full py-3 font-display text-sm font-semibold transition-colors",
                tier.recommended
                  ? "bg-cyan text-white hover:bg-brand-sky-hover"
                  : tier.variant === "primary"
                    ? "bg-cyan text-white hover:bg-brand-sky-hover"
                    : "border border-cyan text-cyan hover:bg-cyan-soft",
              )}
            >
              {tier.cta}
            </Link>
          </article>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-6 border-t border-border-soft pt-6 text-sm text-muted">
        <span className="inline-flex items-center gap-2">
          <Shield className="size-4 text-cyan" />
          Secure payment
        </span>
        <span className="inline-flex items-center gap-2">
          <Check className="size-4 text-cyan" />
          Cancel anytime
        </span>
        <span className="inline-flex items-center gap-2">
          <MessageCircle className="size-4 text-cyan" />
          WhatsApp support on paid plans
        </span>
      </div>
    </div>
  );
}
