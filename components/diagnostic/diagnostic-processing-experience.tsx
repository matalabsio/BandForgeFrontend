"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { DiagnosticSplitShell } from "@/components/diagnostic/diagnostic-split-shell";
import { DIAGNOSTIC_EXAM_STEPS } from "@/components/diagnostic/diagnostic-exam-steps";
import { DiagnosticProcessingLoader } from "@/components/diagnostic/ui/diagnostic-processing-loader";
import { diagnosticPaths, DIAGNOSTIC_PROCESSING_SEC } from "@/lib/diagnostic-catalog";
import { useCountdown } from "@/hooks/use-countdown";
import { pollDiagnosticWritingStatus } from "@/lib/diagnostic-evaluate-writing";
import { readDiagnosticResults } from "@/lib/diagnostic-session";
import {
  applyWritingEvaluationResult,
  clearWritingEvalPending,
  readDiagnosticProgress,
} from "@/lib/diagnostic-storage";
import { cn } from "@/lib/utils";

gsap.registerPlugin(useGSAP);

const WRITING_POLL_MS = 2000;
const WRITING_WAIT_TIMEOUT_MS = 45_000;

type WritingLineState = "pending" | "active" | "done" | "failed";

export function DiagnosticProcessingExperience() {
  const router = useRouter();
  const remaining = useCountdown(DIAGNOSTIC_PROCESSING_SEC);
  const elapsed = DIAGNOSTIC_PROCESSING_SEC - remaining;
  const [activeLine, setActiveLine] = useState(0);
  const [writingLine, setWritingLine] = useState<WritingLineState>("pending");
  const [writingReady, setWritingReady] = useState(false);
  const writingResolvedRef = useRef(false);
  const startedAtRef = useRef(Date.now());
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!readDiagnosticResults()) {
      router.replace(diagnosticPaths.landing);
    }
  }, [router]);

  useEffect(() => {
    const progress = readDiagnosticProgress();
    const needsWriting =
      Boolean(progress?.writingEvalPending) && !progress?.writingEvaluation;

    if (!needsWriting) {
      writingResolvedRef.current = true;
      setWritingReady(true);
      setWritingLine(progress?.writingEvaluation ? "done" : "pending");
      return;
    }

    setWritingLine("active");
    let cancelled = false;

    const finish = (state: WritingLineState) => {
      if (cancelled || writingResolvedRef.current) return;
      writingResolvedRef.current = true;
      setWritingLine(state);
      setWritingReady(true);
    };

    const tick = async () => {
      if (cancelled || writingResolvedRef.current) return;
      const current = readDiagnosticProgress();
      if (!current) {
        finish("failed");
        return;
      }
      try {
        const result = await pollDiagnosticWritingStatus(
          current.attemptId,
          current.writingEvalEssayHash,
        );
        if (cancelled || writingResolvedRef.current) return;
        if (result.status === "complete") {
          applyWritingEvaluationResult(result.evaluation);
          finish("done");
          return;
        }
        if (result.status === "failed") {
          clearWritingEvalPending();
          finish("failed");
          return;
        }
      } catch {
        // Keep polling until timeout.
      }

      if (Date.now() - startedAtRef.current >= WRITING_WAIT_TIMEOUT_MS) {
        clearWritingEvalPending();
        finish("failed");
      }
    };

    void tick();
    const id = window.setInterval(() => {
      void tick();
    }, WRITING_POLL_MS);

    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, []);

  useEffect(() => {
    if (elapsed >= 4) setActiveLine(1);
    if (elapsed >= 8) setActiveLine(2);
  }, [elapsed]);

  useEffect(() => {
    if (remaining > 0) return;
    if (!writingReady) return;
    router.replace(diagnosticPaths.results);
  }, [remaining, writingReady, router]);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduce) return;
      const bits = root.querySelectorAll<HTMLElement>("[data-proc-reveal]");
      gsap.fromTo(
        bits,
        { opacity: 0, y: 18, filter: "blur(8px)" },
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 0.6,
          stagger: 0.08,
          ease: "power3.out",
          clearProps: "filter",
        },
      );
    },
    { scope: rootRef },
  );

  const statusLines: Array<{
    text: string;
    state: "pending" | "active" | "done";
  }> = [
    {
      text: "Submitting Listening and Reading answers\u2026",
      state: activeLine > 0 ? "done" : "active",
    },
    {
      text:
        writingLine === "failed"
          ? "Writing evaluation unavailable \u2014 continuing\u2026"
          : writingLine === "done"
            ? "Writing evaluation complete"
            : "AI-evaluating your Writing response\u2026",
      state:
        writingLine === "done" || writingLine === "failed"
          ? "done"
          : writingLine === "active" || activeLine >= 1
            ? "active"
            : "pending",
    },
    {
      text: "Queuing Speaking recording for certified examiner review\u2026",
      state: activeLine >= 2 ? (writingReady ? "done" : "active") : "pending",
    },
  ];

  return (
    <DiagnosticSplitShell
      steps={DIAGNOSTIC_EXAM_STEPS}
      currentStep={4}
      heading="Calculating results."
      subtitle="We\u2019re scoring your diagnostic now."
      footerNote="Almost done"
      fillViewport
    >
      <div
        ref={rootRef}
        className="flex min-h-0 flex-1 flex-col items-center justify-center overflow-y-auto bg-[radial-gradient(ellipse_at_top,_#F0FBFC_0%,_#FFFFFF_55%)] px-5 py-12 sm:px-8"
      >
        <div
          data-proc-reveal
          className="w-full max-w-md rounded-[24px] border border-[#E8EEF4] bg-white p-7 shadow-[0_16px_48px_rgba(13,31,60,0.07)] sm:p-8"
        >
          <div className="flex justify-center">
            <DiagnosticProcessingLoader />
          </div>
          <h1
            data-proc-reveal
            className="mt-2 text-center font-display text-[24px] font-bold tracking-[-0.02em] text-navy sm:text-[26px]"
          >
            Submitting your diagnostic
          </h1>
          <p
            data-proc-reveal
            className="mt-2 text-center text-[14px] text-[#64748B]"
          >
            Hang tight — this usually takes under a minute.
          </p>

          <ul className="mt-7 space-y-3">
            {statusLines.map((line) => {
              const done = line.state === "done";
              const active = line.state === "active";
              const pending = line.state === "pending";

              return (
                <li
                  key={line.text}
                  data-proc-reveal
                  className={cn(
                    "flex items-center gap-3 rounded-[14px] border px-3.5 py-3 text-sm transition-opacity duration-500",
                    pending && "border-[#EEF2F6] opacity-45",
                    active && "border-cyan/25 bg-[#F0FBFC]",
                    done && "border-[#E8EEF4] bg-[#F8FBFC]",
                  )}
                >
                  <span
                    className={cn(
                      "flex size-6 shrink-0 items-center justify-center rounded-full",
                      done && "bg-cyan text-white",
                      active && "animate-spin border-2 border-cyan/20 border-t-cyan",
                      pending && "border-2 border-[#D5DCE6]",
                    )}
                  >
                    {done ? (
                      <Check className="size-3.5" strokeWidth={3} aria-hidden />
                    ) : null}
                  </span>
                  <span
                    className={cn(
                      active ? "font-medium text-navy" : "font-normal text-[#5A6B82]",
                    )}
                  >
                    {line.text}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </DiagnosticSplitShell>
  );
}
