"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2, Star } from "lucide-react";
import { DiagnosticChrome } from "@/components/diagnostic/diagnostic-chrome";
import { useCountdown } from "@/hooks/use-countdown";
import {
  DIAGNOSTIC_TRANSITIONS,
  type DiagnosticTransitionSlug,
} from "@/lib/diagnostic-transitions";
import { hasInProgressDiagnostic } from "@/lib/diagnostic-storage";
import { cn } from "@/lib/utils";

type Props = {
  slug: DiagnosticTransitionSlug;
};

export function DiagnosticInterstitialExperience({ slug }: Props) {
  const router = useRouter();
  const config = DIAGNOSTIC_TRANSITIONS[slug];
  const remaining = useCountdown(config.countdownSec);
  const canContinue = remaining === 0;
  const progressPct =
    ((config.countdownSec - remaining) / config.countdownSec) * 100;

  useEffect(() => {
    if (!hasInProgressDiagnostic()) {
      router.replace("/diagnostic");
    }
  }, [router]);

  useEffect(() => {
    if (remaining !== 0) return;
    router.replace(config.nextPath);
  }, [remaining, router, config.nextPath]);

  return (
    <DiagnosticChrome variant="marketing" fillViewport>
      <div
        className="flex min-h-0 flex-1 flex-col bg-white"
        style={{
          backgroundImage:
            "radial-gradient(640px 420px at 50% 42%, rgba(0,151,167,0.16), rgba(13,31,60,0) 64%)",
        }}
      >
        <div className="shrink-0 px-4 pt-4 sm:px-6">
          <div className="mx-auto max-w-lg text-center">
            <p className="text-[13.5px] font-light text-[#5A6B82]">
              <CheckCircle2
                className="mr-1.5 inline size-[15px] text-cyan"
                aria-hidden
              />
              <span className="font-medium text-navy">{config.completedLabel}</span>{" "}
              {config.nextLabel} begins in{" "}
              <span className="font-mono font-medium text-teal">{remaining}s</span>
            </p>
            <div className="mt-3 h-[3px] overflow-hidden rounded-sm bg-navy/10">
              <div
                className="h-full rounded-sm bg-cyan transition-[width] duration-1000 ease-linear"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center px-4 py-8 sm:px-6">
          <div className="w-full max-w-md rounded-[22px] border border-navy/5 bg-[#F4F7FA] p-7 shadow-[0_20px_50px_rgba(13,31,60,0.10)] sm:p-8">
            <svg
              width="34"
              height="34"
              viewBox="0 0 24 24"
              fill="rgba(0,188,212,0.18)"
              className="mb-3.5"
              aria-hidden
            >
              <path d="M7 7h4v4c0 2.2-1.4 3.7-3.5 4.2l-.5-1.4c1.1-.3 1.7-.9 1.8-1.8H7zm8 0h4v4c0 2.2-1.4 3.7-3.5 4.2l-.5-1.4c1.1-.3 1.7-.9 1.8-1.8H15z" />
            </svg>
            <blockquote className="font-display text-xl leading-snug font-medium tracking-tight text-pretty text-navy">
              &ldquo;{config.quote}&rdquo;
            </blockquote>
            <div className="mt-5 flex items-center gap-2.5">
              <div className="flex size-10 items-center justify-center rounded-full bg-cyan/14 font-display text-[15px] font-bold text-teal">
                {config.quoteInitials}
              </div>
              <div>
                <p className="text-sm font-semibold text-navy">
                  {config.quoteAttribution}
                </p>
                <p className="font-mono text-[11.5px] text-[#6E83A0]">
                  {config.quoteLocation}
                </p>
              </div>
            </div>
            <div className="mt-4 flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="size-[18px] fill-teal text-teal" />
              ))}
            </div>
          </div>

          <button
            type="button"
            disabled={!canContinue}
            onClick={() => router.replace(config.nextPath)}
            className={cn(
              "mt-8 flex h-[54px] w-full max-w-md cursor-pointer items-center justify-center gap-2 rounded-[14px] font-display text-base font-semibold text-white transition-colors",
              canContinue
                ? "bg-cyan shadow-[0_14px_30px_rgba(0,188,212,0.30)] hover:bg-brand-sky-hover"
                : "cursor-not-allowed bg-cyan/40",
            )}
          >
            {config.ctaLabel}
            <ArrowRight className="size-4" aria-hidden />
          </button>
        </div>
      </div>
    </DiagnosticChrome>
  );
}
