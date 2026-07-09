"use client";

import { useEffect } from "react";
import { Headphones, Volume2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { DiagnosticChrome } from "@/components/diagnostic/diagnostic-chrome";
import { DiagnosticModuleGuard } from "@/components/diagnostic/diagnostic-module-guard";
import { useCountdown } from "@/hooks/use-countdown";
import {
  DIAGNOSTIC_LISTENING_PREP_SEC,
  diagnosticPaths,
} from "@/lib/diagnostic-catalog";
import {
  isListeningPrepComplete,
  markListeningPrepComplete,
  readDiagnosticProgress,
} from "@/lib/diagnostic-storage";

export function DiagnosticListeningPrepExperience() {
  const router = useRouter();
  const remaining = useCountdown(DIAGNOSTIC_LISTENING_PREP_SEC);
  const progressPct =
    ((DIAGNOSTIC_LISTENING_PREP_SEC - remaining) / DIAGNOSTIC_LISTENING_PREP_SEC) * 100;

  useEffect(() => {
    const progress = readDiagnosticProgress();
    if (!progress || progress.status !== "in_progress") {
      router.replace(diagnosticPaths.landing);
      return;
    }
    if (isListeningPrepComplete(progress)) {
      router.replace(diagnosticPaths.listening);
    }
  }, [router]);

  useEffect(() => {
    if (remaining !== 0) return;
    markListeningPrepComplete();
    router.replace(diagnosticPaths.listening);
  }, [remaining, router]);

  return (
    <DiagnosticModuleGuard module="listening">
      <DiagnosticChrome variant="marketing" fillViewport>
        <div
          className="flex min-h-0 flex-1 flex-col bg-white"
          style={{
            backgroundImage:
              "radial-gradient(640px 420px at 50% 42%, rgba(0,151,167,0.16), rgba(13,31,60,0) 64%)",
          }}
        >
          <div className="shrink-0 px-4 pt-6 sm:px-6">
            <div className="mx-auto max-w-lg text-center">
              <p className="text-[13.5px] font-light text-[#5A6B82]">
                Listening begins in{" "}
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

          <div className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6">
            <div className="w-full max-w-xl rounded-[22px] border border-navy/5 bg-[#F4F7FA] p-7 shadow-[0_20px_50px_rgba(13,31,60,0.10)] sm:p-8">
              <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-cyan/12 text-cyan">
                <Headphones className="size-6" aria-hidden />
              </div>
              <h1 className="text-center font-display text-2xl font-semibold text-navy sm:text-[30px]">
                Listening is first
              </h1>
              <p className="mt-2 text-center text-sm leading-relaxed text-[#5A6B82]">
                Get ready before the recording starts.
              </p>
              <ul className="mt-6 space-y-3 rounded-2xl border border-navy/10 bg-white p-4 text-sm text-[#1B2B45]">
                <li className="flex items-start gap-2.5">
                  <Volume2 className="mt-0.5 size-4 shrink-0 text-cyan" aria-hidden />
                  <span>Find a quiet space where you can focus without interruption.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Headphones className="mt-0.5 size-4 shrink-0 text-cyan" aria-hidden />
                  <span>Plug in earphones or headphones for clear audio.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="mt-1 size-2 shrink-0 rounded-full bg-cyan" aria-hidden />
                  <span>You&apos;ll have 30 seconds to read the questions before the recording starts.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </DiagnosticChrome>
    </DiagnosticModuleGuard>
  );
}
