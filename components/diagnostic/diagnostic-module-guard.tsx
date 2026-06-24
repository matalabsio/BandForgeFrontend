"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { diagnosticPaths } from "@/lib/diagnostic-catalog";
import {
  readDiagnosticProgress,
  type DiagnosticModule,
} from "@/lib/diagnostic-storage";

type Props = {
  module: DiagnosticModule;
  children: React.ReactNode;
};

/** Redirect if no in-progress static diagnostic attempt. */
export function DiagnosticModuleGuard({ module, children }: Props) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const progress = readDiagnosticProgress();
    if (!progress || progress.status !== "in_progress") {
      router.replace(diagnosticPaths.landing);
      return;
    }
    if (progress.currentModule !== module) {
      router.replace(diagnosticPaths[progress.currentModule]);
      return;
    }
    if (module === "speaking" && !progress.writingEvaluation?.evaluation_id) {
      router.replace(diagnosticPaths.writing);
      return;
    }
    setReady(true);
  }, [module, router]);

  if (!ready) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}
