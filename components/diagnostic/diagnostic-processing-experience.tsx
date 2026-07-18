"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { DiagnosticChrome } from "@/components/diagnostic/diagnostic-chrome";
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

  useEffect(() => {
    if (!readDiagnosticResults()) {
      router.replace(diagnosticPaths.landing);
    }
  }, [router]);

  // Poll background Writing evaluation while the student waits on this screen.
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

  const statusLines: Array<{
    text: string;
    state: "pending" | "active" | "done";
  }> = [
    {
      text: "Submitting Listening and Reading answers…",
      state: activeLine > 0 ? "done" : "active",
    },
    {
      text:
        writingLine === "failed"
          ? "Writing evaluation unavailable — continuing…"
          : writingLine === "done"
            ? "Writing evaluation complete"
            : "AI-evaluating your Writing response…",
      state:
        writingLine === "done" || writingLine === "failed"
          ? "done"
          : writingLine === "active" || activeLine >= 1
            ? "active"
            : "pending",
    },
    {
      text: "Queuing Speaking recording for certified examiner review…",
      state: activeLine >= 2 ? (writingReady ? "done" : "active") : "pending",
    },
  ];

  return (
    <DiagnosticChrome variant="marketing" fillViewport>
      <div
        className="flex min-h-0 flex-1 flex-col items-center justify-center bg-white px-6 py-16"
        style={{
          backgroundImage:
            "radial-gradient(560px 460px at 50% 38%, rgba(0,151,167,0.16), rgba(13,31,60,0) 64%)",
        }}
      >
        <DiagnosticProcessingLoader />
        <h1 className="text-center font-display text-[26px] font-bold tracking-tight text-navy">
          Submitting Your Diagnostic.
        </h1>

        <ul className="mt-8 w-full max-w-sm space-y-4">
          {statusLines.map((line) => {
            const done = line.state === "done";
            const active = line.state === "active";
            const pending = line.state === "pending";

            return (
              <li
                key={line.text}
                className={cn(
                  "flex items-center gap-3 text-sm transition-opacity duration-500",
                  pending && "opacity-40",
                )}
              >
                <span
                  className={cn(
                    "flex size-5 shrink-0 items-center justify-center rounded-full",
                    done && "bg-cyan/16",
                    active && "border-2 border-navy/14 border-t-teal animate-spin",
                    pending && "border-2 border-navy/14",
                  )}
                >
                  {done ? (
                    <Check className="size-3 text-cyan" strokeWidth={3} />
                  ) : null}
                </span>
                <span
                  className={cn(
                    active ? "font-medium text-navy" : "font-light text-[#5A6B82]",
                  )}
                >
                  {line.text}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </DiagnosticChrome>
  );
}
