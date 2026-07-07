"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Mic } from "lucide-react";
import { DiagnosticChrome } from "@/components/diagnostic/diagnostic-chrome";
import {
  DiagnosticExamShell,
  DiagnosticExamScroll,
  DiagnosticExamColumn,
} from "@/components/diagnostic/diagnostic-exam-shell";
import { DiagnosticModuleGuard } from "@/components/diagnostic/diagnostic-module-guard";
import { DiagnosticTimerPill } from "@/components/diagnostic/ui/diagnostic-timer-pill";
import {
  SpeakingExamFlow,
  type SpeakingFlowMeta,
} from "@/modules/speaking/components/speaking-exam-flow";
import { SpeakingMicCheck } from "@/modules/speaking/components/speaking-mic-check";
import { diagnosticPaths } from "@/lib/diagnostic-catalog";
import { computeFinalDiagnosticScores } from "@/lib/diagnostic-finalize";
import { loadDiagnosticPack, type DiagnosticPack } from "@/lib/diagnostic-pack";
import {
  completeDiagnostic,
  readDiagnosticProgress,
  saveModuleAnswers,
  type DiagnosticSpeakingAnswers,
} from "@/lib/diagnostic-storage";
import {
  readMicCheckPassed,
  writeMicCheckPassed,
} from "@/modules/speaking/lib/speaking-mic-check-storage";
import { diagnosticManifestFromPack } from "@/modules/speaking/lib/speaking-question-manifest";
import type { SpeakingSessionRecording } from "@/modules/speaking/types";

export function DiagnosticSpeakingExperience() {
  const router = useRouter();
  const [pack, setPack] = useState<DiagnosticPack | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [micScope, setMicScope] = useState<string | null>(null);
  const [micPassed, setMicPassed] = useState(false);
  const [flowMeta, setFlowMeta] = useState<SpeakingFlowMeta | null>(null);
  const [speakingAnswers, setSpeakingAnswers] = useState<DiagnosticSpeakingAnswers>({
    part1: {},
    part2: null,
  });

  useEffect(() => {
    const progress = readDiagnosticProgress();
    if (progress?.answers.speaking) {
      setSpeakingAnswers(progress.answers.speaking);
    }
    if (progress?.attemptId) {
      setMicScope(progress.attemptId);
      setMicPassed(readMicCheckPassed(progress.attemptId));
    }
    void loadDiagnosticPack()
      .then(setPack)
      .catch((e: unknown) => {
        setError(e instanceof Error ? e.message : "Could not load diagnostic.");
      });
  }, []);

  const handleMicBegin = useCallback(() => {
    if (!micScope) return;
    writeMicCheckPassed(micScope);
    setMicPassed(true);
  }, [micScope]);

  const handleStepRecorded = useCallback(
    (recording: SpeakingSessionRecording) => {
      setSpeakingAnswers((prev) => {
        if (recording.part === 1) {
          const next: DiagnosticSpeakingAnswers = {
            ...prev,
            part1: {
              ...prev.part1,
              [recording.questionId]: {
                durationSec: recording.durationSec,
                completed: true,
              },
            },
          };
          saveModuleAnswers("speaking", next);
          return next;
        }

        if (recording.part === 2) {
          const next: DiagnosticSpeakingAnswers = {
            ...prev,
            part2: {
              prepSec: pack?.speaking.part2.prepSec ?? 60,
              recordSec: recording.durationSec,
              completed: true,
            },
          };
          saveModuleAnswers("speaking", next);
          return next;
        }

        return prev;
      });
    },
    [pack],
  );

  const handleExamComplete = useCallback(
    (recordings: SpeakingSessionRecording[]) => {
      if (!pack || submitting) return;
      const hasPart1 = recordings.some((r) => r.part === 1);
      const hasPart2 = recordings.some((r) => r.part === 2);
      if (!hasPart1 && !hasPart2) {
        setError("Please complete at least one speaking recording before submitting.");
        return;
      }

      setSubmitting(true);
      setError(null);

      const progress = readDiagnosticProgress();
      if (!progress) return;

      const finalAnswers: DiagnosticSpeakingAnswers = { ...speakingAnswers };
      for (const rec of recordings) {
        if (rec.part === 1) {
          finalAnswers.part1[rec.questionId] = {
            durationSec: rec.durationSec,
            completed: true,
          };
        } else if (rec.part === 2) {
          finalAnswers.part2 = {
            prepSec: pack.speaking.part2.prepSec,
            recordSec: rec.durationSec,
            completed: true,
          };
        }
      }
      if (!finalAnswers.part2 && pack.speaking.part2.enabled) {
        finalAnswers.part2 = {
          prepSec: pack.speaking.part2.prepSec,
          recordSec: 0,
          completed: false,
        };
      }
      saveModuleAnswers("speaking", finalAnswers);

      const { scores, review } = computeFinalDiagnosticScores(pack, {
        ...progress,
        answers: { ...progress.answers, speaking: finalAnswers },
      });

      completeDiagnostic(scores, review);
      router.replace(diagnosticPaths.processing);
    },
    [pack, router, speakingAnswers, submitting],
  );

  const manifest = useMemo(
    () => (pack ? diagnosticManifestFromPack(pack) : []),
    [pack],
  );

  const handleFlowMetaChange = useCallback((meta: SpeakingFlowMeta) => {
    setFlowMeta((prev) => {
      if (
        prev &&
        prev.stepIndex === meta.stepIndex &&
        prev.totalSteps === meta.totalSteps &&
        prev.part === meta.part &&
        prev.subPhase === meta.subPhase &&
        prev.prepRemaining === meta.prepRemaining &&
        prev.recordRemaining === meta.recordRemaining &&
        prev.showFooter === meta.showFooter &&
        prev.footerLabel === meta.footerLabel &&
        prev.footerDisabled === meta.footerDisabled
      ) {
        return prev;
      }
      return meta;
    });
  }, []);

  const timer =
    flowMeta?.subPhase === "part2_prep" && flowMeta.prepRemaining != null ? (
      <DiagnosticTimerPill remainingSeconds={flowMeta.prepRemaining} />
    ) : flowMeta?.subPhase === "part2_record" && flowMeta.recordRemaining != null ? (
      <DiagnosticTimerPill remainingSeconds={flowMeta.recordRemaining} />
    ) : undefined;

  return (
    <DiagnosticModuleGuard module="speaking">
      <DiagnosticChrome variant="exam" fillViewport>
        <DiagnosticExamShell
          module="speaking"
          moduleIcon={Mic}
          error={error}
          loading={!pack && micPassed}
          timer={micPassed ? timer : undefined}
        >
          {!micPassed ? (
            <DiagnosticExamScroll>
              <DiagnosticExamColumn className="py-4 sm:py-6">
                <SpeakingMicCheck
                  variant="diagnostic"
                  onBegin={handleMicBegin}
                  beginLabel="Begin diagnostic speaking"
                  totalMinutes={12}
                />
              </DiagnosticExamColumn>
            </DiagnosticExamScroll>
          ) : pack ? (
            <SpeakingExamFlow
              variant="diagnostic"
              manifest={manifest}
              onStepRecorded={handleStepRecorded}
              onFlowMetaChange={handleFlowMetaChange}
              onExamComplete={(recordings) => handleExamComplete(recordings)}
              footerBusy={submitting}
              completeLabel="Submit for examiner review"
            />
          ) : null}
        </DiagnosticExamShell>
      </DiagnosticChrome>
    </DiagnosticModuleGuard>
  );
}
