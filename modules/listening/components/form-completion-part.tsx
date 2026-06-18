"use client";

import { memo, type ReactNode } from "react";
import type { ListeningPart, ListeningQuestion } from "@/modules/listening/types";
import { LabelInlineBlank } from "@/modules/listening/components/listening-inline-answer";
import { QuestionAudio } from "@/modules/listening/components/question-audio";
import { sanitizeInstructionText } from "@/modules/listening/lib/part-instructions";

type Props = {
  part: ListeningPart;
  answers: Record<string, string>;
  partPlayed: boolean;
  currentQuestionId: string | null;
  onAnswer: (questionId: string, value: string) => void;
  onFocus: (questionId: string) => void;
  onPartPlayed: (partNumber: number) => void;
  variant?: "default" | "exam";
  autoplayAudio?: boolean;
  /** When true, audio renders in the left panel (split exam layout). */
  deferAudio?: boolean;
};

function sortedQuestions(questions: ListeningQuestion[]): ListeningQuestion[] {
  return questions.toSorted((a, b) => a.question_number - b.question_number);
}

function FormCompletionPartBase({
  part,
  answers,
  partPlayed,
  currentQuestionId,
  onAnswer,
  onFocus,
  onPartPlayed,
  variant = "default",
  autoplayAudio = false,
  deferAudio = false,
}: Props) {
  const questions = sortedQuestions(part.questions);
  const first = questions[0];
  const audioUrl = first?.audio_url ?? null;
  const instructions =
    sanitizeInstructionText(first?.instructions) ??
    "Write NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer.";
  const isExam = variant === "exam";
  const qStart = questions[0]?.question_number ?? 1;
  const qEnd = questions[questions.length - 1]?.question_number ?? 10;

  if (isExam) {
    return (
      <section
        id={`part-${part.part}`}
        className={deferAudio ? "h-full overflow-y-auto px-4 py-5 sm:px-5" : "mt-6"}
      >
        {!deferAudio ? (
          <>
            <header className="border-b border-[var(--exam-border)] pb-3">
              <h2 className="text-[15px] font-semibold tracking-tight text-[var(--exam-ink)]">
                Part {part.part}
              </h2>
              <p className="mt-1 text-[13px] leading-relaxed text-[var(--exam-ink-muted)]">
                {part.context}
              </p>
              <p className="mt-3 text-[13px] font-medium text-[var(--exam-ink)]">
                Questions {qStart}–{qEnd}
              </p>
              <p className="mt-1 text-[12px] text-[var(--exam-ink-muted)]">
                Complete the notes below.
              </p>
            </header>
            <p className="mt-4 text-[12px] italic text-[var(--exam-ink-muted)]">
              {instructions}
            </p>
            <div className="mt-4">
              <QuestionAudio
                audioUrl={audioUrl}
                played={partPlayed}
                variant="exam"
                autoplay={autoplayAudio && !partPlayed}
                onCompleted={() => onPartPlayed(part.part)}
              />
            </div>
          </>
        ) : (
          <header className="border-b border-[var(--exam-border)] pb-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--exam-accent)]">
              Questions {qStart}–{qEnd}
            </p>
            <p className="mt-2 text-[13px] font-medium text-[var(--exam-ink)]">
              Complete the form below.
            </p>
          </header>
        )}

        <article className="mt-4 border border-[var(--exam-border)] bg-white shadow-sm">
          <div className="border-b border-[var(--exam-border)] px-5 py-4 text-center sm:px-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--exam-ink-muted)]">
              Greenfield College
            </p>
            <p className="mt-1 text-[14px] font-semibold text-[var(--exam-ink)]">
              Course Registration Form
            </p>
          </div>

          <div className="space-y-6 px-5 py-6 sm:px-8">
            <FormSection title="Personal details">
              {questions.slice(0, 4).map((q) => (
                <LabelInlineBlank
                  key={q.id}
                  questionNumber={q.question_number}
                  label={q.prompt}
                  value={answers[q.id] ?? ""}
                  isActive={currentQuestionId === q.id}
                  onChange={(v) => onAnswer(q.id, v)}
                  onFocus={() => onFocus(q.id)}
                  variant="exam"
                  layout="exam-form"
                />
              ))}
            </FormSection>

            <FormSection title="Course details">
              {questions.slice(4, 7).map((q) => (
                <LabelInlineBlank
                  key={q.id}
                  questionNumber={q.question_number}
                  label={q.prompt}
                  value={answers[q.id] ?? ""}
                  isActive={currentQuestionId === q.id}
                  onChange={(v) => onAnswer(q.id, v)}
                  onFocus={() => onFocus(q.id)}
                  variant="exam"
                  layout="exam-form"
                />
              ))}
            </FormSection>

            <FormSection title="Payment & additional information">
              {questions.slice(7).map((q) => (
                <LabelInlineBlank
                  key={q.id}
                  questionNumber={q.question_number}
                  label={q.prompt}
                  value={answers[q.id] ?? ""}
                  isActive={currentQuestionId === q.id}
                  onChange={(v) => onAnswer(q.id, v)}
                  onFocus={() => onFocus(q.id)}
                  variant="exam"
                  layout="exam-form"
                  prefix={q.question_number === 8 ? "£" : undefined}
                />
              ))}
            </FormSection>
          </div>
        </article>
      </section>
    );
  }

  const answeredCount = questions.filter(
    (q) => (answers[q.id] ?? "").trim().length > 0,
  ).length;

  return (
    <section
      id={`part-${part.part}`}
      className="rounded-2xl border border-border bg-surface p-4 sm:p-5"
    >
      <header className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h3 className="text-h3 text-navy">{part.title}</h3>
          <p className="mt-1 max-w-2xl text-meta text-ink/70">{part.context}</p>
          <p className="mt-2 text-[12px] font-semibold uppercase tracking-wider text-teal">
            Questions {qStart}–{qEnd}: Form Completion
          </p>
        </div>
        <span className="rounded-full border border-border bg-white px-3 py-1 text-[12px] font-semibold text-navy">
          {answeredCount}/{questions.length} answered
        </span>
      </header>

      <p className="mt-4 text-body text-ink/80">{instructions}</p>

      <div className="mt-4">
        <QuestionAudio
          audioUrl={audioUrl}
          played={partPlayed}
          onCompleted={() => onPartPlayed(part.part)}
        />
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border-2 border-ink/20 bg-white p-4 shadow-sm sm:p-6">
        <p className="text-center text-[11px] font-bold uppercase tracking-widest text-navy">
          Greenfield College – Course Registration Form
        </p>
        <div className="mt-4 space-y-4 border-t border-border pt-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-navy/70">
            Personal details
          </p>
          {questions.slice(0, 4).map((q) => (
            <LabelInlineBlank
              key={q.id}
              questionNumber={q.question_number}
              label={q.prompt}
              value={answers[q.id] ?? ""}
              isActive={currentQuestionId === q.id}
              onChange={(v) => onAnswer(q.id, v)}
              onFocus={() => onFocus(q.id)}
              variant="default"
              layout="legacy"
            />
          ))}
          <p className="pt-2 text-[11px] font-bold uppercase tracking-wider text-navy/70">
            Course details
          </p>
          {questions.slice(4, 7).map((q) => (
            <LabelInlineBlank
              key={q.id}
              questionNumber={q.question_number}
              label={q.prompt}
              value={answers[q.id] ?? ""}
              isActive={currentQuestionId === q.id}
              onChange={(v) => onAnswer(q.id, v)}
              onFocus={() => onFocus(q.id)}
              variant="default"
              layout="legacy"
            />
          ))}
          <p className="pt-2 text-[11px] font-bold uppercase tracking-wider text-navy/70">
            Payment &amp; additional information
          </p>
          {questions.slice(7).map((q) => (
            <LabelInlineBlank
              key={q.id}
              questionNumber={q.question_number}
              label={q.prompt}
              value={answers[q.id] ?? ""}
              isActive={currentQuestionId === q.id}
              onChange={(v) => onAnswer(q.id, v)}
              onFocus={() => onFocus(q.id)}
              variant="default"
              layout="legacy"
              prefix={q.question_number === 8 ? "£" : undefined}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function FormSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div>
      <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#71717a]">
        {title}
      </h3>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

export const FormCompletionPart = memo(FormCompletionPartBase);
