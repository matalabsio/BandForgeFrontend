"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { DiagnosticChrome } from "@/components/diagnostic/diagnostic-chrome";
import { DiagnosticProcessingLoader } from "@/components/diagnostic/ui/diagnostic-processing-loader";
import { diagnosticPaths, DIAGNOSTIC_PROCESSING_SEC } from "@/lib/diagnostic-catalog";
import { useCountdown } from "@/hooks/use-countdown";
import { readDiagnosticResults } from "@/lib/diagnostic-session";
import { cn } from "@/lib/utils";

const STATUS_LINES = [
  "Submitting Listening and Reading answers…",
  "AI-evaluating your Writing response…",
  "Queuing Speaking recording for certified examiner review…",
];

export function DiagnosticProcessingExperience() {
  const router = useRouter();
  const remaining = useCountdown(DIAGNOSTIC_PROCESSING_SEC);
  const elapsed = DIAGNOSTIC_PROCESSING_SEC - remaining;
  const [activeLine, setActiveLine] = useState(0);

  useEffect(() => {
    if (!readDiagnosticResults()) {
      router.replace(diagnosticPaths.landing);
      return;
    }
  }, [router]);

  useEffect(() => {
    if (elapsed >= 4) setActiveLine(1);
    if (elapsed >= 8) setActiveLine(2);
  }, [elapsed]);

  useEffect(() => {
    if (remaining === 0) {
      router.replace(diagnosticPaths.results);
    }
  }, [remaining, router]);

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
          {STATUS_LINES.map((line, index) => {
            const done = index < activeLine;
            const active = index === activeLine;
            const pending = index > activeLine;

            return (
              <li
                key={line}
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
                  {line}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </DiagnosticChrome>
  );
}
