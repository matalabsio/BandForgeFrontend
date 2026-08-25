"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DiagnosticWaitState } from "@/components/diagnostic/ui/diagnostic-processing-loader";
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
    setReady(true);
  }, [module, router]);

  if (!ready) {
    return (
      <div className="flex min-h-dvh flex-col">
        <DiagnosticWaitState />
      </div>
    );
  }

  return <>{children}</>;
}
