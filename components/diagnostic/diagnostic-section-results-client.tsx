"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { DiagnosticWaitState } from "@/components/diagnostic/ui/diagnostic-processing-loader";
import { diagnosticPaths } from "@/lib/diagnostic-catalog";
import { readDiagnosticResults } from "@/lib/diagnostic-session";
import { readDiagnosticProgress } from "@/lib/diagnostic-storage";
import { diagnosticTransitionPath } from "@/lib/diagnostic-transitions";

type Module = "listening" | "reading";

type Props = {
  module: Module;
  /** Ignored — diagnostic has no section-result pages. */
  fromCompleted?: boolean;
};

/** Resolve where stale L/R section-results bookmarks should go. */
export function resolveDiagnosticSectionResultsRedirect(
  module: Module,
): string {
  const progress = readDiagnosticProgress();
  if (!progress) {
    return readDiagnosticResults()
      ? diagnosticPaths.results
      : diagnosticPaths.landing;
  }
  if (progress.status === "completed") {
    return diagnosticPaths.results;
  }

  if (module === "listening" && progress.currentModule === "reading") {
    return diagnosticTransitionPath("listening-reading");
  }
  if (
    module === "reading" &&
    (progress.currentModule === "writing" ||
      progress.currentModule === "speaking")
  ) {
    return diagnosticTransitionPath("reading-writing");
  }

  return diagnosticPaths[progress.currentModule];
}

/**
 * Diagnostic no longer shows per-section score/review pages.
 * Old bookmarks always redirect into the live journey.
 */
export function DiagnosticSectionResultsClient({ module }: Props) {
  const router = useRouter();

  useEffect(() => {
    router.replace(resolveDiagnosticSectionResultsRedirect(module));
  }, [module, router]);

  return (
    <div className="flex min-h-dvh flex-col">
      <DiagnosticWaitState />
    </div>
  );
}
