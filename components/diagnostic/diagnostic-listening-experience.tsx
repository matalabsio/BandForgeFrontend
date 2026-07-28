"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { DiagnosticSplitShell } from "@/components/diagnostic/diagnostic-split-shell";
import { DiagnosticModuleGuard } from "@/components/diagnostic/diagnostic-module-guard";
import { DIAGNOSTIC_EXAM_STEPS, examStepIndex } from "@/components/diagnostic/diagnostic-exam-steps";
import {
  DiagnosticExamColumn,
  DiagnosticExamScroll,
} from "@/components/diagnostic/diagnostic-exam-shell";
import { DiagnosticModuleFooter } from "@/components/diagnostic/diagnostic-module-footer";
import { DiagnosticTimerPill } from "@/components/diagnostic/ui/diagnostic-timer-pill";
import {
  DIAGNOSTIC_LISTENING_TIMER_SEC,
  diagnosticPaths,
} from "@/lib/diagnostic-catalog";
import {
  loadDiagnosticPack,
  packToListeningPart,
  type DiagnosticPack,
} from "@/lib/diagnostic-pack";
import { buildModuleReview, scoreListeningModule } from "@/lib/diagnostic-scoring";
import {
  advanceDiagnosticModule,
  isListeningPrepComplete,
  markListeningAudioPlayed,
  readDiagnosticProgress,
  saveModuleAnswers,
} from "@/lib/diagnostic-storage";
import { diagnosticTransitionPath } from "@/lib/diagnostic-transitions";
import { QuestionAudio } from "@/modules/listening/components/question-audio";
import { ListeningPreviewBanner } from "@/modules/listening/components/listening-preview-banner";
import { ListeningQuestionsPanel } from "@/modules/listening/components/listening-questions-panel";
import { useListeningPreviewCountdown } from "@/modules/listening/hooks/use-listening-preview-countdown";
import {
  questionsBrowsable,
  type ListeningPartAudioPhase,
} from "@/modules/listening/lib/listening-part-intro";
import type { ListeningPart } from "@/modules/listening/types";

function initialDiagnosticPhase(audioPlayed: boolean): ListeningPartAudioPhase {
  if (audioPlayed) return "complete";
  return "preview";
}

export function DiagnosticListeningExperience() {
  const router = useRouter();
  const [pack, setPack] = useState<DiagnosticPack | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>(
    () => readDiagnosticProgress()?.answers.listening ?? {},
  );
  const [currentQuestionId, setCurrentQuestionId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [audioPlayed, setAudioPlayed] = useState(
    () => readDiagnosticProgress()?.listeningAudioPlayed ?? false,
  );
  const [partAudioPhase, setPartAudioPhase] = useState<ListeningPartAudioPhase>(() =>
    initialDiagnosticPhase(readDiagnosticProgress()?.listeningAudioPlayed ?? false),
  );

  const listeningPart: ListeningPart | null = useMemo(
    () => (pack ? packToListeningPart(pack) : null),
    [pack],
  );

  useEffect(() => {
    const progress = readDiagnosticProgress();
    if (!isListeningPrepComplete(progress)) {
      router.replace(diagnosticPaths.listeningPrep);
      return;
    }
    void loadDiagnosticPack()
      .then(setPack)
      .catch((e: unknown) => {
        setError(e instanceof Error ? e.message : "Could not load diagnostic.");
      });
  }, [router]);

  useEffect(() => {
    if (audioPlayed) {
      setPartAudioPhase("complete");
      return;
    }
    if (pack && !audioPlayed) {
      setPartAudioPhase("preview");
    }
  }, [audioPlayed, pack]);

  const handlePreviewComplete = useCallback(() => {
    setPartAudioPhase("playing");
  }, []);

  const { remaining: previewRemaining, progressPct: previewProgressPct } =
    useListeningPreviewCountdown({
      phase: partAudioPhase,
      onPreviewComplete: handlePreviewComplete,
      resetKey: "diagnostic-listening",
    });

  const handleSubmit = useCallback(() => {
    if (!pack || submitting) return;
    setSubmitting(true);
    const scores = scoreListeningModule(pack.listening.questions, answers);
    const review = buildModuleReview(pack.listening.questions, answers);
    advanceDiagnosticModule("listening", {
      moduleAnswers: { module: "listening", answers },
      scores: {
        listening_band: scores.band,
        reading_band: null,
        writing_band: null,
        speaking_band: null,
        aggregate_band: null,
      },
      review: { listening: review },
    });
    router.replace(diagnosticTransitionPath("listening-reading"));
  }, [pack, answers, submitting, router]);

  const handleAnswer = useCallback((questionId: string, value: string) => {
    setAnswers((prev) => {
      const next = { ...prev, [questionId]: value };
      saveModuleAnswers("listening", next);
      return next;
    });
  }, []);

  const handleAudioCompleted = useCallback(() => {
    setAudioPlayed(true);
    setPartAudioPhase("complete");
    markListeningAudioPlayed();
  }, []);

  const questionsVisible =
    questionsBrowsable(partAudioPhase) || !pack?.listening.audioUrl;
  const showAudioPlayer =
    Boolean(pack?.listening.audioUrl) &&
    (partAudioPhase === "playing" || partAudioPhase === "complete");
  const inPreview = partAudioPhase === "preview";
  /** Exam clock starts after the 30s question-explore preview. */
  const examTimerActive = !inPreview && questionsVisible;

  const loading = !pack || !listeningPart;

  return (
    <DiagnosticModuleGuard module="listening">
      <DiagnosticSplitShell
        steps={DIAGNOSTIC_EXAM_STEPS}
        currentStep={examStepIndex("listening")}
        heading="Listening"
        subtitle="Listen carefully — the recording plays once."
        fillViewport
        timer={
          <DiagnosticTimerPill
            durationSeconds={DIAGNOSTIC_LISTENING_TIMER_SEC}
            active={examTimerActive}
            onExpire={handleSubmit}
          />
        }
      >
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-white">
          {error ? (
            <p className="shrink-0 border-b border-red-100 bg-red-50 px-4 py-2.5 text-center text-sm text-red-700" role="alert">
              {error}
            </p>
          ) : null}

          {loading ? (
            <div className="flex flex-1 items-center justify-center p-8">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan border-t-transparent" role="status" aria-label="Loading" />
            </div>
          ) : (
            <>
              <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                <DiagnosticExamScroll>
                  <DiagnosticExamColumn>
                    {inPreview ? (
                      <div className="mb-5 lg:mb-8">
                        <ListeningPreviewBanner
                          remainingSeconds={previewRemaining}
                          progressPct={previewProgressPct}
                          variant="diagnostic"
                        />
                      </div>
                    ) : null}

                    {showAudioPlayer ? (
                      <div className="mb-5 lg:mb-8">
                        <QuestionAudio
                          audioUrl={pack.listening.audioUrl ?? null}
                          played={audioPlayed}
                          variant="exam"
                          autoplay={partAudioPhase === "playing" && !audioPlayed}
                          allowManualStartAfterBegin={partAudioPhase === "playing"}
                          onCompleted={handleAudioCompleted}
                          sectionNote="Use earphones for the clearest audio. The recording plays once — take notes as you listen and answer while you go. Pausing and replay are disabled."
                          animateCopy
                        />
                      </div>
                    ) : pack.listening.audioUrl ? null : (
                      <p className="mb-5 rounded-xl border border-navy/10 bg-navy/[0.03] px-4 py-3 text-sm text-[#5A6B82] lg:mb-8">
                        Listening audio is unavailable. Questions are shown so you can proceed.
                      </p>
                    )}

                    <ListeningQuestionsPanel
                      part={listeningPart}
                      answers={answers}
                      currentQuestionId={currentQuestionId}
                      onAnswer={handleAnswer}
                      onFocus={setCurrentQuestionId}
                      partPlayed={audioPlayed}
                      visible={questionsVisible}
                      phase={partAudioPhase}
                      variant="diagnostic"
                    />
                  </DiagnosticExamColumn>
                </DiagnosticExamScroll>
              </div>
              <DiagnosticModuleFooter
                label="Submit listening"
                busy={submitting}
                onClick={handleSubmit}
                contentWidth="narrow"
              />
            </>
          )}
        </div>
      </DiagnosticSplitShell>
    </DiagnosticModuleGuard>
  );
}
