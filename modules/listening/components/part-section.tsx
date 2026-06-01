"use client";

import { memo } from "react";
import type { ListeningPart } from "@/modules/listening/types";
import { ListeningQuestionPanel } from "@/modules/listening/components/listening-question-panel";
import {
  FormCompletionPart,
} from "@/modules/listening/components/form-completion-part";
import { isFormCompletionPart } from "@/modules/listening/lib/form-completion";
import { QuestionAudio } from "@/modules/listening/components/question-audio";

type Props = {
  part: ListeningPart;
  answers: Record<string, string>;
  played: Record<string, true>;
  playedParts: Record<number, true>;
  currentQuestionId: string | null;
  onAnswer: (questionId: string, value: string) => void;
  onFocus: (questionId: string) => void;
  onPlayed: (questionId: string) => void;
  onPartPlayed: (partNumber: number) => void;
  variant?: "default" | "exam";
};

function answeredCount(qs: ListeningPart["questions"], answers: Record<string, string>): number {
  return qs.filter((q) => (answers[q.id] ?? "").trim().length > 0).length;
}

function sortedQuestions(questions: ListeningPart["questions"]) {
  return questions.toSorted((a, b) => a.question_number - b.question_number);
}

/** One R2 clip shared across all questions in the part (founder Section 2 style). */
function isSharedPartAudio(part: ListeningPart): boolean {
  const urls = part.questions
    .map((q) => q.audio_url)
    .filter((u): u is string => Boolean(u && u.trim()));
  if (urls.length === 0) return false;
  return new Set(urls).size === 1;
}

function groupInstruction(part: ListeningPart): string | null {
  const withInstructions = part.questions.find((q) => q.instructions?.trim());
  return withInstructions?.instructions?.trim() ?? null;
}

/** Per-question instructions in exam mode (e.g. matching box text on Q6–10). */
function instructionForQuestion(
  part: ListeningPart,
  question: ListeningPart["questions"][number],
): string | null {
  if (question.instructions?.trim()) {
    return question.instructions.trim();
  }
  if (question.question_type.toLowerCase() === "matching") {
    const anchor = sortedQuestions(part.questions).find(
      (q) => q.question_type.toLowerCase() === "matching" && q.instructions?.trim(),
    );
    return anchor?.instructions?.trim() ?? null;
  }
  return null;
}

function PartSectionBase({
  part,
  answers,
  played,
  playedParts,
  currentQuestionId,
  onAnswer,
  onFocus,
  onPlayed,
  onPartPlayed,
  variant = "default",
}: Props) {
  if (isFormCompletionPart(part)) {
    return (
      <FormCompletionPart
        part={part}
        answers={answers}
        partPlayed={Boolean(playedParts[part.part])}
        currentQuestionId={currentQuestionId}
        onAnswer={onAnswer}
        onFocus={onFocus}
        onPartPlayed={onPartPlayed}
        variant={variant}
        autoplayAudio={variant === "exam"}
      />
    );
  }

  const done = answeredCount(part.questions, answers);
  const sharedAudio = isSharedPartAudio(part);
  const partPlayed = Boolean(playedParts[part.part]);
  // When using shared part audio, don't assume question #1 has the URL.
  // Some question rows may have null audio_url; we still want the first non-null shared clip.
  const sharedUrl = sharedAudio
    ? (part.questions.find((q) => q.audio_url?.trim())?.audio_url ?? null)
    : null;
  const isExam = variant === "exam";
  const showOneAtATime = isExam;
  const ordered = sortedQuestions(part.questions);
  const currentIndex = Math.max(
    0,
    ordered.findIndex((q) => q.id === currentQuestionId),
  );
  const currentQuestion = ordered[currentIndex] ?? ordered[0];
  const visibleQuestions = showOneAtATime && currentQuestion ? [currentQuestion] : ordered;
  const instruction =
    showOneAtATime && currentQuestion
      ? instructionForQuestion(part, currentQuestion)
      : groupInstruction(part);

  const handlePartAudioDone = () => {
    onPartPlayed(part.part);
    for (const q of part.questions) {
      onPlayed(q.id);
    }
  };

  const goToIndex = (index: number) => {
    const target = ordered[index];
    if (target) onFocus(target.id);
  };

  return (
    <section
      id={`part-${part.part}`}
      className={
        isExam
          ? "mt-6"
          : "rounded-2xl border border-border bg-surface p-4 sm:p-5"
      }
    >
      {!isExam ? (
        <header className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h3 className="text-h3 text-navy">{part.title}</h3>
            <p className="mt-1 max-w-2xl text-meta text-ink/70">{part.context}</p>
            <p className="mt-1 text-[12px] uppercase tracking-wider text-teal">
              {part.common_question_type}
            </p>
          </div>
          <span className="rounded-full border border-border bg-white px-3 py-1 text-[12px] font-semibold text-navy">
            {done}/{part.questions.length} answered
          </span>
        </header>
      ) : null}

      {instruction ? (
        <p
          className={
            isExam
              ? "mb-4 text-[12px] leading-relaxed italic text-[#52525b]"
              : "mt-4 text-[12px] italic text-ink/60"
          }
        >
          {instruction}
        </p>
      ) : null}

      {sharedAudio ? (
        <div className={isExam ? "mb-5" : "mt-4"}>
          <QuestionAudio
            audioUrl={sharedUrl}
            played={partPlayed}
            variant={variant}
            autoplay={isExam && !partPlayed}
            onCompleted={handlePartAudioDone}
          />
        </div>
      ) : null}

      {showOneAtATime && currentQuestion ? (
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#a1a1aa]">
          Question {currentQuestion.question_number} of {ordered.length}
        </p>
      ) : null}

      <ol className={isExam ? "space-y-0" : "mt-4 space-y-4"}>
        {visibleQuestions.map((q) => (
          <li
            key={q.id}
            onFocus={() => onFocus(q.id)}
            onClick={() => onFocus(q.id)}
            data-active={currentQuestionId === q.id ? "true" : undefined}
            className="rounded-2xl border border-transparent transition-colors data-[active=true]:border-teal/40"
          >
            <ListeningQuestionPanel
              question={q}
              value={answers[q.id] ?? ""}
              onChange={(value) => onAnswer(q.id, value)}
              hideMeta={false}
              audioSlot={
                sharedAudio ? null : (
                  <QuestionAudio
                    audioUrl={q.audio_url ?? null}
                    played={Boolean(played[q.id])}
                    variant={variant}
                    onCompleted={() => onPlayed(q.id)}
                  />
                )
              }
            />
          </li>
        ))}
      </ol>

      {showOneAtATime && ordered.length > 1 ? (
        <div className="mt-6 flex items-center justify-between gap-3 border-t border-[#e4e4e7] pt-4">
          <button
            type="button"
            disabled={currentIndex <= 0}
            onClick={() => goToIndex(currentIndex - 1)}
            className="min-h-[44px] cursor-pointer border border-[#d4d4d8] bg-white px-4 text-[13px] font-semibold text-[#52525b] transition-colors hover:border-[#a1a1aa] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-[12px] text-[#71717a]">
            {done}/{ordered.length} answered
          </span>
          <button
            type="button"
            disabled={currentIndex >= ordered.length - 1}
            onClick={() => goToIndex(currentIndex + 1)}
            className="min-h-[44px] cursor-pointer border border-[#18181b] bg-[#18181b] px-4 text-[13px] font-semibold text-white transition-colors hover:bg-[#27272a] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
        </div>
      ) : null}
    </section>
  );
}

export const PartSection = memo(PartSectionBase);
