"use client";

import { useCallback, useMemo, useState } from "react";
import { IeltsExamToolbar } from "@/components/exam/ielts-exam-toolbar";
import { IELTS_EXAM_VARS } from "@/components/exam/ielts-exam-theme";
import { bankExerciseToListeningPart } from "@/lib/bank-exercise-to-exam";
import type { BankExerciseStart } from "@/lib/practice-api";
import { ListeningAudioPanel } from "@/modules/listening/components/listening-audio-panel";
import { ListeningQuestionsPanel } from "@/modules/listening/components/listening-questions-panel";
import { useListeningPreviewCountdown } from "@/modules/listening/hooks/use-listening-preview-countdown";
import { audioPanelInstruction } from "@/modules/listening/lib/listening-question-groups";
import {
  questionsBrowsable,
  type ListeningPartAudioPhase,
} from "@/modules/listening/lib/listening-part-intro";

type Props = {
  exercise: BankExerciseStart;
  hubHref: string;
  hubLabel: string;
  busy: boolean;
  error: string | null;
  onSubmit: (answers: Record<string, string>) => void;
};

export function PracticeListeningExam({
  exercise,
  hubHref,
  hubLabel,
  busy,
  error,
  onSubmit,
}: Props) {
  const part = useMemo(() => bankExerciseToListeningPart(exercise), [exercise]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentQuestionId, setCurrentQuestionId] = useState<string | null>(
    () => part.questions[0]?.id ?? null,
  );
  const [played, setPlayed] = useState<Record<string, true>>({});
  const [playedParts, setPlayedParts] = useState<Record<number, true>>({});
  const hasAudio = Boolean(part.questions.some((q) => q.audio_url?.trim()));
  const [phase, setPhase] = useState<ListeningPartAudioPhase>(() =>
    hasAudio ? "awaiting_start" : "complete",
  );

  const handlePreviewComplete = useCallback(() => {
    setPhase("playing");
  }, []);

  const { remaining: previewRemaining, progressPct: previewProgressPct } =
    useListeningPreviewCountdown({
      phase,
      onPreviewComplete: handlePreviewComplete,
      resetKey: exercise.attempt_id,
    });

  const answeredCount = part.questions.filter((q) =>
    (answers[q.id] ?? "").trim(),
  ).length;

  return (
    <div
      className="ielts-exam-theme fixed inset-0 z-40 flex flex-col overflow-hidden bg-[var(--exam-surface)] text-[var(--exam-ink)]"
      style={IELTS_EXAM_VARS}
    >
      <IeltsExamToolbar
        moduleName="Listening"
        stageLabel={`Part ${part.part}`}
        testTitle={part.title}
        hubHref={hubHref}
        hubLabel={hubLabel}
        remainingSeconds={20 * 60}
        timerActive={false}
        answeredCount={answeredCount}
        totalQuestions={part.questions.length}
        busy={busy}
        plainHeader
        onSubmit={() => onSubmit(answers)}
      />
      {error ? (
        <p
          className="shrink-0 border-b border-red-200 bg-red-50 px-4 py-2 text-center text-[13px] text-red-700"
          role="alert"
        >
          {error}
        </p>
      ) : null}
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <div className="min-h-[38vh] flex-1 border-b border-[var(--exam-border)] lg:min-h-0 lg:max-h-[calc(100dvh-3rem)] lg:w-[min(56%,1fr)] lg:border-b-0 lg:border-r">
          <ListeningAudioPanel
            part={part}
            played={played}
            playedParts={playedParts}
            onPlayed={(id) => setPlayed((prev) => ({ ...prev, [id]: true }))}
            onPartPlayed={(n) => {
              setPlayedParts((prev) => ({ ...prev, [n]: true }));
              setPhase("complete");
            }}
            instruction={audioPanelInstruction(part)}
            phase={phase}
            onBeginSection={() => setPhase("preview")}
            previewRemaining={previewRemaining}
            previewProgressPct={previewProgressPct}
          />
        </div>
        <div className="min-h-[52vh] border-t border-[var(--exam-border)] lg:min-h-0 lg:w-[min(44%,480px)] lg:shrink-0 lg:border-l lg:border-t-0 lg:max-h-[calc(100dvh-3rem)]">
          <ListeningQuestionsPanel
            part={part}
            answers={answers}
            currentQuestionId={currentQuestionId}
            onAnswer={(id, value) =>
              setAnswers((prev) => ({ ...prev, [id]: value }))
            }
            onFocus={setCurrentQuestionId}
            partPlayed={Boolean(playedParts[part.part])}
            visible={questionsBrowsable(phase) || !hasAudio}
            phase={phase}
            submitBusy={busy}
            onSubmitPart={() => onSubmit(answers)}
          />
        </div>
      </div>
    </div>
  );
}
