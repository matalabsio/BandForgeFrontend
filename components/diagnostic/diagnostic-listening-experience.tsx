"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Headphones } from "lucide-react";
import { DiagnosticChrome } from "@/components/diagnostic/diagnostic-chrome";
import { DiagnosticModuleGuard } from "@/components/diagnostic/diagnostic-module-guard";
import {
  DiagnosticExamColumn,
  DiagnosticExamScroll,
  DiagnosticExamShell,
} from "@/components/diagnostic/diagnostic-exam-shell";
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
import { ListeningQuestionsPanel } from "@/modules/listening/components/listening-questions-panel";
import type { ListeningPart } from "@/modules/listening/types";

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
    markListeningAudioPlayed();
  }, []);

  const questionsVisible = audioPlayed || !pack?.listening.audioUrl;

  return (
    <DiagnosticModuleGuard module="listening">
      <DiagnosticChrome variant="exam" fillViewport>
        <DiagnosticExamShell
          module="listening"
          moduleIcon={Headphones}
          error={error}
          loading={!pack || !listeningPart}
          footerLabel="Submit listening"
          footerBusy={submitting}
          onFooter={handleSubmit}
          footerWidth="narrow"
          timer={
            <DiagnosticTimerPill
              durationSeconds={DIAGNOSTIC_LISTENING_TIMER_SEC}
              active={questionsVisible}
              onExpire={handleSubmit}
            />
          }
        >
          {pack && listeningPart ? (
            <DiagnosticExamScroll>
              <DiagnosticExamColumn>
                {pack.listening.audioUrl ? (
                  <div className="mb-5 lg:mb-8">
                    <QuestionAudio
                      audioUrl={pack.listening.audioUrl}
                      played={audioPlayed}
                      variant="exam"
                      autoplay={!audioPlayed}
                      allowManualStartAfterBegin={!audioPlayed}
                      onCompleted={handleAudioCompleted}
                      sectionNote="The recording plays once. Questions unlock after the audio ends."
                    />
                  </div>
                ) : (
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
                  partPlayed={questionsVisible}
                  visible={questionsVisible}
                  variant="diagnostic"
                />
              </DiagnosticExamColumn>
            </DiagnosticExamScroll>
          ) : null}
        </DiagnosticExamShell>
      </DiagnosticChrome>
    </DiagnosticModuleGuard>
  );
}
