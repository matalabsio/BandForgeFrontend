"use client";

import { memo } from "react";
import type { ListeningPart, ListeningQuestion } from "@/modules/listening/types";
import { ListeningQuestionPanel } from "@/modules/listening/components/listening-question-panel";
import { QuestionAudio } from "@/modules/listening/components/question-audio";

type Props = {
  part: ListeningPart;
  answers: Record<string, string>;
  played: Record<string, true>;
  currentQuestionId: string | null;
  onAnswer: (questionId: string, value: string) => void;
  onFocus: (questionId: string) => void;
  onPlayed: (questionId: string) => void;
};

function answeredCount(qs: ListeningQuestion[], answers: Record<string, string>): number {
  return qs.filter((q) => (answers[q.id] ?? "").trim().length > 0).length;
}

function PartSectionBase({
  part,
  answers,
  played,
  currentQuestionId,
  onAnswer,
  onFocus,
  onPlayed,
}: Props) {
  const done = answeredCount(part.questions, answers);
  return (
    <section
      id={`part-${part.part}`}
      className="rounded-2xl border border-border bg-surface p-4 sm:p-5"
    >
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

      <ol className="mt-4 space-y-4">
        {part.questions.map((q) => (
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
              audioSlot={
                <QuestionAudio
                  audioUrl={q.audio_url ?? null}
                  played={Boolean(played[q.id])}
                  onCompleted={() => onPlayed(q.id)}
                />
              }
            />
          </li>
        ))}
      </ol>
    </section>
  );
}

export const PartSection = memo(PartSectionBase);
