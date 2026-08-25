"use client";

import { useEffect, useMemo } from "react";
import { BookOpen, Headphones, Volume2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { DiagnosticSplitShell } from "@/components/diagnostic/diagnostic-split-shell";
import { DiagnosticModuleGuard } from "@/components/diagnostic/diagnostic-module-guard";
import { DIAGNOSTIC_EXAM_STEPS } from "@/components/diagnostic/diagnostic-exam-steps";
import { DiagnosticStagePanel } from "@/components/diagnostic/ui/diagnostic-stage-panel";
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

const PREP_TIPS = [
  {
    icon: <Volume2 className="size-4" aria-hidden />,
    text: "Find a quiet space where you can focus without interruption.",
  },
  {
    icon: <Headphones className="size-4" aria-hidden />,
    text: "Plug in earphones or headphones for clear audio.",
  },
  {
    icon: <BookOpen className="size-4" aria-hidden />,
    text: "You'll have 30 seconds to read the questions before the recording starts.",
  },
] as const;

export function DiagnosticListeningPrepExperience() {
  const router = useRouter();
  const remaining = useCountdown(DIAGNOSTIC_LISTENING_PREP_SEC);
  const tips = useMemo(() => [...PREP_TIPS], []);

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
      <DiagnosticSplitShell
        steps={DIAGNOSTIC_EXAM_STEPS}
        currentStep={0}
        heading="Listening begins shortly."
        subtitle="Get your headphones ready — the recording plays once."
        footerNote={`Starting in ${remaining}s`}
        fillViewport
      >
        <DiagnosticStagePanel
          title="Listening is first"
          description="Take a moment to settle in. The recording plays once — make every second count."
          remaining={remaining}
          totalSec={DIAGNOSTIC_LISTENING_PREP_SEC}
          countdownLabel="Listening begins in"
          badge={<Headphones className="size-7" strokeWidth={1.75} aria-hidden />}
          tips={tips}
        />
      </DiagnosticSplitShell>
    </DiagnosticModuleGuard>
  );
}
