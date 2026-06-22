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
  DiagnosticPassageText,
} from "@/components/diagnostic/diagnostic-exam-shell";
import { DiagnosticAudioStrip } from "@/components/diagnostic/ui/diagnostic-audio-strip";
import { DiagnosticTimerPill } from "@/components/diagnostic/ui/diagnostic-timer-pill";
import { DIAGNOSTIC_LISTENING_TIMER_SEC } from "@/lib/diagnostic-catalog";
import {
  loadDiagnosticPack,
  packToListeningPart,
  type DiagnosticPack,
} from "@/lib/diagnostic-pack";
import { buildModuleReview, scoreListeningModule } from "@/lib/diagnostic-scoring";
import {
  advanceDiagnosticModule,
  readDiagnosticProgress,
  saveModuleAnswers,
} from "@/lib/diagnostic-storage";
import { diagnosticTransitionPath } from "@/lib/diagnostic-transitions";
import { ListeningQuestionsPanel } from "@/modules/listening/components/listening-questions-panel";
import type { ListeningPart } from "@/modules/listening/types";

export function DiagnosticListeningExperience() {
  const router = useRouter();
  const [pack, setPack] = useState<DiagnosticPack | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentQuestionId, setCurrentQuestionId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const listeningPart: ListeningPart | null = useMemo(
    () => (pack ? packToListeningPart(pack) : null),
    [pack],
  );

  useEffect(() => {
    const progress = readDiagnosticProgress();
    if (progress?.answers.listening) {
      setAnswers(progress.answers.listening);
    }
    void loadDiagnosticPack()
      .then(setPack)
      .catch((e: unknown) => {
        setError(e instanceof Error ? e.message : "Could not load diagnostic.");
      });
  }, []);

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
              onExpire={handleSubmit}
            />
          }
        >
          {pack && listeningPart ? (
            <DiagnosticExamScroll>
              <DiagnosticExamColumn>
                {pack.listening.audioUrl ? (
                  <DiagnosticAudioStrip
                    src={pack.listening.audioUrl}
                    className="mb-5 lg:mb-8"
                  />
                ) : null}

                <details className="mb-5 rounded-xl border border-navy/10 bg-navy/[0.03] px-4 py-3">
                  <summary className="cursor-pointer text-sm font-medium text-[#5A6B82]">
                    Show transcript
                  </summary>
                  <div className="mt-3 border-t border-navy/8 pt-3">
                    <DiagnosticPassageText text={pack.listening.transcript} />
                  </div>
                </details>

                <ListeningQuestionsPanel
                  part={listeningPart}
                  answers={answers}
                  currentQuestionId={currentQuestionId}
                  onAnswer={handleAnswer}
                  onFocus={setCurrentQuestionId}
                  partPlayed
                  visible
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
