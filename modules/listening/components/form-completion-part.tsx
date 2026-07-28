"use client";

import { memo } from "react";
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
  variant?: "default" | "exam" | "diagnostic";
  autoplayAudio?: boolean;
  /** When true, audio renders in the left panel (split exam layout). */
  deferAudio?: boolean;
};

function sortedQuestions(questions: ListeningQuestion[]): ListeningQuestion[] {
  return questions.toSorted(
    (a, b) =>
      (a.display_number ?? a.question_number) -
      (b.display_number ?? b.question_number),
  );
}

function qDisplay(q: ListeningQuestion): number {
  return q.display_number ?? q.question_number;
}

/** Currency prefix when the field label indicates a fee (e.g. Greenfield course fee). */
function fieldPrefix(prompt: string): string | undefined {
  return /\bfee\b/i.test(prompt) ? "£" : undefined;
}

function formTitleLines(title: string): { org: string | null; form: string } {
  const parts = title.split(/\s+[–—-]\s+/);
  if (parts.length >= 2) {
    return { org: parts[0]?.trim() || null, form: parts.slice(1).join(" – ").trim() };
  }
  return { org: null, form: title };
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
  const formTitle =
    part.form_title?.trim() ||
    "Registration Form";
  const { org, form } = formTitleLines(formTitle);
  const isExam = variant === "exam";
  const isDiagnostic = variant === "diagnostic";
  const qStart = questions[0] ? qDisplay(questions[0]) : 1;
  const qEnd = questions.length > 0 ? qDisplay(questions[questions.length - 1]) : 10;

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
                Complete the form below.
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
            {org ? (
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--exam-ink-muted)]">
                {org}
              </p>
            ) : null}
            <p
              className={
                org
                  ? "mt-1 text-[14px] font-semibold text-[var(--exam-ink)]"
                  : "text-[14px] font-semibold text-[var(--exam-ink)]"
              }
            >
              {form}
            </p>
          </div>

          <div className="space-y-4 px-5 py-6 sm:px-8">
            {questions.map((q) => (
              <LabelInlineBlank
                key={q.id}
                questionNumber={qDisplay(q)}
                label={q.prompt}
                value={answers[q.id] ?? ""}
                isActive={currentQuestionId === q.id}
                onChange={(v) => onAnswer(q.id, v)}
                onFocus={() => onFocus(q.id)}
                variant="exam"
                layout="exam-form"
                prefix={fieldPrefix(q.prompt)}
              />
            ))}
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
      className={
        isDiagnostic
          ? "rounded-2xl bg-[#F7FAFC] p-4 sm:p-5"
          : "rounded-2xl border border-border bg-surface p-4 sm:p-5"
      }
    >
      <header className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h3 className="text-h3 text-navy">{part.title}</h3>
          <p className="mt-1 max-w-2xl text-meta text-ink/70">{part.context}</p>
          <p className="mt-2 text-[12px] font-semibold uppercase tracking-wider text-teal">
            Questions {qStart}–{qEnd}: Form Completion
          </p>
        </div>
        <span
          className={
            isDiagnostic
              ? "rounded-full bg-white/80 px-3 py-1 text-[12px] font-semibold text-navy"
              : "rounded-full border border-border bg-white px-3 py-1 text-[12px] font-semibold text-navy"
          }
        >
          {answeredCount}/{questions.length} answered
        </span>
      </header>

      <p className="mt-4 text-body text-ink/80">{instructions}</p>

      {deferAudio ? null : (
        <div className="mt-4">
          <QuestionAudio
            audioUrl={audioUrl}
            played={partPlayed}
            onCompleted={() => onPartPlayed(part.part)}
          />
        </div>
      )}

      <div
        className={
          isDiagnostic
            ? "mt-6 overflow-x-auto rounded-xl bg-white p-4 sm:p-6"
            : "mt-6 overflow-x-auto rounded-xl border-2 border-ink/20 bg-white p-4 shadow-sm sm:p-6"
        }
      >
        <p className="text-center text-[11px] font-bold uppercase tracking-widest text-navy">
          {formTitle}
        </p>
        <div
          className={
            isDiagnostic
              ? "mt-4 space-y-4 border-t border-navy/[0.06] pt-4"
              : "mt-4 space-y-4 border-t border-border pt-4"
          }
        >
          {questions.map((q) => (
            <LabelInlineBlank
              key={q.id}
              questionNumber={qDisplay(q)}
              label={q.prompt}
              value={answers[q.id] ?? ""}
              isActive={currentQuestionId === q.id}
              onChange={(v) => onAnswer(q.id, v)}
              onFocus={() => onFocus(q.id)}
              variant="default"
              layout="legacy"
              prefix={fieldPrefix(q.prompt)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export const FormCompletionPart = memo(FormCompletionPartBase);
