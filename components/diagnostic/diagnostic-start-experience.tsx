"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { DiagnosticChrome } from "@/components/diagnostic/diagnostic-chrome";
import { DiagnosticLeadForm } from "@/components/diagnostic/ui/diagnostic-lead-form";
import { DiagnosticSectionGrid } from "@/components/diagnostic/ui/diagnostic-section-grid";
import { diagnosticPaths } from "@/lib/diagnostic-catalog";
import {
  isLeadComplete,
  readDiagnosticLead,
  saveDiagnosticLead,
  type DiagnosticLead,
} from "@/lib/diagnostic-lead";
import {
  clearDiagnosticAttempt,
  createDiagnosticAttempt,
  hasInProgressDiagnostic,
  isListeningPrepComplete,
  readDiagnosticProgress,
} from "@/lib/diagnostic-storage";
import { getSubscription } from "@/lib/payments";
import { hasFullSkillProgram } from "@/lib/entitlement";
import { loginPathWithNext } from "@/lib/auth";
import { readDiagnosticResults } from "@/lib/diagnostic-session";
import { PAGE_SEO_COPY } from "@/lib/seo/page-copy";

function WhatsAppNote() {
  return (
    <div className="flex items-center gap-2">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="#25D366" aria-hidden>
        <path d="M12 2a10 10 0 0 0-8.6 15l-1.3 4.8 4.9-1.3A10 10 0 1 0 12 2zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .1-1.7-.1-.4-.1-1-.3-1.6-.6-2.9-1.2-4.7-4.1-4.9-4.3-.1-.2-1.1-1.5-1.1-2.8s.7-2 .9-2.2c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 1.9c.1.2.1.3 0 .5l-.4.6c-.2.2-.3.4-.1.6.1.3.7 1.1 1.5 1.7 1 .9 1.8 1.1 2 1.2.2.1.4.1.5-.1l.6-.8c.2-.2.4-.2.6-.1l1.8.9c.2.1.4.2.4.3.1.1.1.5-.1 1z" />
      </svg>
      <span className="text-[12.5px] font-light text-[#5A6B82]">
        We&apos;ll send your results to this WhatsApp number.
      </span>
    </div>
  );
}

export function DiagnosticStartExperience() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  // SSR-safe defaults — hydrate from localStorage after mount to avoid mismatch.
  const [canContinue, setCanContinue] = useState(false);
  const [hasCompletedResults, setHasCompletedResults] = useState(false);
  const [lead, setLead] = useState<Partial<DiagnosticLead>>({});

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      setLead(readDiagnosticLead() ?? {});
      setCanContinue(hasInProgressDiagnostic());
      setHasCompletedResults(Boolean(readDiagnosticResults()));
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const runCheck = () => {
      void (async () => {
        try {
          const sub = await getSubscription();
          if (!cancelled && hasFullSkillProgram(sub)) {
            router.replace("/dashboard");
          }
        } catch {
          /* guest or offline — show diagnostic form */
        }
      })();
    };

    // Defer subscription check until after first paint so H1 can win LCP.
    if (typeof requestAnimationFrame === "function") {
      const frame = requestAnimationFrame(runCheck);
      return () => {
        cancelled = true;
        cancelAnimationFrame(frame);
      };
    }

    runCheck();
    return () => {
      cancelled = true;
    };
  }, [router]);

  const formValid = isLeadComplete(lead);

  const goToCurrentModule = () => {
    const progress = readDiagnosticProgress();
    const currentModule = progress?.currentModule ?? "listening";
    if (currentModule === "listening" && !isListeningPrepComplete(progress)) {
      router.replace(diagnosticPaths.listeningPrep);
      return;
    }
    router.replace(diagnosticPaths[currentModule]);
  };

  const persistAndStart = () => {
    if (!isLeadComplete(lead)) return;
    saveDiagnosticLead(lead);
    clearDiagnosticAttempt();
    createDiagnosticAttempt();
    router.replace(diagnosticPaths.listeningPrep);
  };

  const handleStart = () => {
    setBusy(true);
    persistAndStart();
  };

  const handleContinue = () => {
    setBusy(true);
    if (isLeadComplete(lead)) saveDiagnosticLead(lead);
    goToCurrentModule();
  };

  const handleStartOver = () => {
    setBusy(true);
    persistAndStart();
  };

  return (
    <DiagnosticChrome variant="marketing">
      <div className="mx-auto w-full max-w-6xl flex-1 px-4 pb-10 sm:px-6 lg:pb-16">
        <div className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-12 xl:gap-16">
          {/* Hero column */}
          <div className="pt-2 pb-8 lg:pt-6 lg:pb-0">
            <span className="inline-flex items-center rounded-full border border-teal/18 bg-[#E6F6F8] px-3 py-1.5 font-mono text-[11px] tracking-[0.14em] text-teal uppercase">
              Free diagnostic · No sign-up to start
            </span>
            <h1 className="font-display mt-4 text-[31px] leading-[1.06] font-bold tracking-[-0.025em] text-balance text-navy sm:text-4xl">
              {PAGE_SEO_COPY.diagnostic.h1}
            </h1>
            <p className="mt-3.5 text-[15px] leading-relaxed font-light text-[#5A6B82]">
              {PAGE_SEO_COPY.diagnostic.description}
            </p>
            <div className="mt-6">
              <DiagnosticSectionGrid />
            </div>
          </div>

          {/* Form column */}
          <div className="lg:sticky lg:top-8">
            <div className="rounded-2xl border border-[#E3E9F1] bg-white p-5 shadow-[0_20px_50px_rgba(13,31,60,0.08)] sm:p-6">
              <h2 className="font-display text-[21px] font-bold tracking-[-0.015em] text-navy">
                Start your free diagnostic
              </h2>
              <p className="mt-1 text-[13.5px] font-light text-[#5A6B82]">
                Takes about 15 minutes. No payment to begin.
              </p>

              <div className="mt-5">
                <DiagnosticLeadForm value={lead} onChange={setLead} />
              </div>

              <div className="mt-3.5">
                <WhatsAppNote />
              </div>

              {canContinue ? (
                <div className="mt-5 space-y-2.5">
                  <button
                    type="button"
                    disabled={busy || !formValid}
                    onClick={handleContinue}
                    className="flex h-[54px] w-full cursor-pointer items-center justify-center gap-2 rounded-[14px] bg-cyan font-display text-base font-semibold text-white shadow-[0_14px_30px_rgba(0,188,212,0.30)] transition-colors hover:bg-brand-sky-hover disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {busy ? "Loading…" : "Continue diagnostic"}
                    <ArrowRight className="size-[18px]" />
                  </button>
                  <button
                    type="button"
                    disabled={busy || !formValid}
                    onClick={handleStartOver}
                    className="flex h-11 w-full cursor-pointer items-center justify-center rounded-[14px] border border-[#D9E0E8] bg-white text-sm font-semibold text-navy hover:bg-surface disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Start over
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  disabled={busy || !formValid}
                  onClick={handleStart}
                  className="mt-5 flex h-[54px] w-full cursor-pointer items-center justify-center gap-2 rounded-[14px] bg-cyan font-display text-base font-semibold text-white shadow-[0_14px_30px_rgba(0,188,212,0.30)] transition-colors hover:bg-brand-sky-hover disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {busy ? "Starting…" : "Begin Diagnostic"}
                  <ArrowRight className="size-[18px]" />
                </button>
              )}

              <p className="mt-3.5 text-center text-[12.5px] font-light text-[#94A3B8]">
                Free. No account required to start.{" "}
                <Link
                  href={loginPathWithNext(
                    hasCompletedResults
                      ? diagnosticPaths.planReveal
                      : diagnosticPaths.landing,
                  )}
                  className="font-medium text-cyan hover:underline"
                >
                  Already subscribed? Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </DiagnosticChrome>
  );
}
