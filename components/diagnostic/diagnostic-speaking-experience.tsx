"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import {
  acquireSpeakingWakeLock,
  type SpeakingWakeLockHandle,
} from "@/modules/speaking/lib/speaking-wake-lock";
import type { SpeakingSessionRecording } from "@/modules/speaking/types";

export function DiagnosticSpeakingExperience() {
  const router = useRouter();
  const [pack, setPack] = useState<DiagnosticPack | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [micScope] = useState<string | null>(
    () => readDiagnosticProgress()?.attemptId ?? null,
  );
  const [micPassed, setMicPassed] = useState(() => {
    const progress = readDiagnosticProgress();
    if (!progress?.attemptId) return false;
    return readMicCheckPassed(progress.attemptId);
  });
  const [flowMeta, setFlowMeta] = useState<SpeakingFlowMeta | null>(null);
  const [speakingAnswers, setSpeakingAnswers] = useState<DiagnosticSpeakingAnswers>(
    () =>
      readDiagnosticProgress()?.answers.speaking ?? {
        part1: {},
        part2: null,
      },
  );

  useEffect(() => {
    void loadDiagnosticPack()
      .then(setPack)
      .catch((e: unknown) => {
        setError(e instanceof Error ? e.message : "Could not load diagnostic.");
      });
  }, []);

  const wakeLockRef = useRef<SpeakingWakeLockHandle | null>(null);

  useEffect(() => {
    if (!micPassed || !pack) return;

    let cancelled = false;
    void acquireSpeakingWakeLock().then((handle) => {
      if (cancelled) {
        void handle.release();
        return;
      }
      wakeLockRef.current = handle;
    });

    return () => {
      cancelled = true;
      const handle = wakeLockRef.current;
      wakeLockRef.current = null;
      if (handle) void handle.release();
    };
  }, [micPassed, pack]);

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
      const expectedQuestionIds = [
        ...pack.speaking.part1.questions.map((question) => question.id),
        ...(pack.speaking.part2.enabled ? ["diagnostic-p2"] : []),
      ];
      const recordedQuestionIds = new Set(recordings.map((recording) => recording.questionId));
      const missingCount = expectedQuestionIds.filter(
        (questionId) => !recordedQuestionIds.has(questionId),
      ).length;
      if (missingCount > 0) {
        setError(
          `Please record every speaking answer before submitting (${missingCount} remaining).`,
        );
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
      const wake = wakeLockRef.current;
      wakeLockRef.current = null;
      if (wake) void wake.release();
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
              <DiagnosticExamColumn className="py-4 sm:py-6 lg:py-8">
                <div className="mb-4 rounded-[16px] border border-navy/12 bg-white p-4 shadow-[0_10px_24px_rgba(13,31,60,0.06)] sm:mb-5 sm:p-5">
                  <p className="font-mono text-[10px] tracking-[0.14em] text-teal uppercase">
                    Speaking format
                  </p>
                  <h2 className="mt-1.5 text-lg font-semibold leading-tight text-navy sm:text-xl">
                    Video-first examiner prompts, timed answers, one-take flow
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-[#334155]">
                    Complete a quick mic check first. Then Part 1, Part 2 prep + long
                    turn, and Part 3 run continuously like the real IELTS speaking test.
                  </p>
                </div>
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
