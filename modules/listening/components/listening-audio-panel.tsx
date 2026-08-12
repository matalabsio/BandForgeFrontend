"use client";

import { memo } from "react";
import { bfPrimaryCtaExamFooterClass } from "@/components/bandforge/bf-primary-cta-styles";
import { cn } from "@/lib/utils";
import type { ListeningPart } from "@/modules/listening/types";
import { QuestionAudio } from "@/modules/listening/components/question-audio";
import { ListeningPreviewBanner } from "@/modules/listening/components/listening-preview-banner";
import {
  formatQuestionTypeLabel,
  sanitizeInstructionText,
} from "@/modules/listening/lib/part-instructions";
import {
  LISTENING_PART_STANDARD_BULLETS,
  type ListeningPartAudioPhase,
} from "@/modules/listening/lib/listening-part-intro";

type Props = {
  part: ListeningPart;
  played: Record<string, true>;
  playedParts: Record<number, true>;
  onPlayed: (questionId: string) => void;
  onPartPlayed: (partNumber: number) => void;
  instruction?: string | null;
  phase: ListeningPartAudioPhase;
  onBeginSection: () => void;
  previewRemaining?: number;
  previewProgressPct?: number;
};

function qDisplay(q: ListeningPart["questions"][number]): number {
  return q.display_number ?? q.question_number;
}

function sortedQuestions(questions: ListeningPart["questions"]) {
  return questions.toSorted((a, b) => qDisplay(a) - qDisplay(b));
}

/** IELTS Part 1 style: one MP3 covers every question in the section. */
function partLevelAudioUrl(part: ListeningPart): string | null {
  const ordered = sortedQuestions(part.questions);
  const first = ordered.find((q) => q.audio_url?.trim())?.audio_url ?? null;
  if (!first) return null;
  const urls = ordered
    .map((q) => q.audio_url?.trim())
    .filter((u): u is string => Boolean(u));
  if (urls.length === 0) return null;
  const unique = new Set(urls);
  if (unique.size > 1) {
    return first;
  }
  return first;
}

function ListeningAudioPanelBase({
  part,
  played,
  playedParts,
  onPlayed,
  onPartPlayed,
  instruction,
  phase,
  onBeginSection,
  previewRemaining = 0,
  previewProgressPct = 0,
}: Props) {
  const ordered = sortedQuestions(part.questions);
  const qStart = ordered[0] ? qDisplay(ordered[0]) : 1;
  const qEnd = ordered.length > 0 ? qDisplay(ordered[ordered.length - 1]) : 10;
  const partPlayed = Boolean(playedParts[part.part]);
  const sharedUrl = partLevelAudioUrl(part);
  const awaitingStart = phase === "awaiting_start";
  const inPreview = phase === "preview";
  const showPlayer = phase === "playing" || phase === "complete" || partPlayed;

  const handlePartAudioDone = () => {
    onPartPlayed(part.part);
    for (const q of part.questions) {
      onPlayed(q.id);
    }
  };

  const cleanInstruction = sanitizeInstructionText(instruction);

  return (
    <div className="flex h-full flex-col bg-[var(--exam-paper)] lg:max-h-[calc(100dvh-3rem)]">
      <div className="shrink-0 border-b border-[var(--exam-border)] bg-white px-4 py-4 sm:px-6 sm:py-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--exam-accent)]">
          Section {part.part}
        </p>
        <p className="mt-2 text-[13px] text-[var(--exam-ink-muted)]">
          Questions {qStart}–{qEnd}
          {part.common_question_type
            ? ` · ${formatQuestionTypeLabel(part.common_question_type)}`
            : ""}
        </p>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6 sm:py-6">
        <div className="mx-auto max-w-lg">
          <div className="mb-5 rounded-lg border border-[var(--exam-border)] bg-white p-4 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--exam-ink-muted)]">
              Instructions
            </p>
            {cleanInstruction ? (
              <div className="mt-2 space-y-1.5 text-[13px] leading-relaxed text-[var(--exam-ink)]">
                {cleanInstruction.split("\n").map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
            ) : null}
            <ol
              className={`${cleanInstruction ? "mt-4" : "mt-2"} list-decimal space-y-1.5 pl-5 text-[13px] leading-relaxed text-[var(--exam-ink)]`}
            >
              {LISTENING_PART_STANDARD_BULLETS.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ol>
          </div>

          {awaitingStart ? (
            <button
              type="button"
              disabled={!sharedUrl}
              onClick={onBeginSection}
              className={cn(bfPrimaryCtaExamFooterClass, "w-full sm:w-full")}
            >
              Begin Test
            </button>
          ) : null}

          {inPreview ? (
            <ListeningPreviewBanner
              remainingSeconds={previewRemaining}
              progressPct={previewProgressPct}
              variant="exam"
            />
          ) : null}

          {showPlayer ? (
            <div className={inPreview ? "" : "mt-5"}>
              <QuestionAudio
                key={sharedUrl ?? "no-audio"}
                audioUrl={sharedUrl}
                played={partPlayed}
                variant="exam"
                autoplay={phase === "playing" && !partPlayed}
                allowManualStartAfterBegin={phase === "playing"}
                onCompleted={handlePartAudioDone}
                sectionNote="One recording for all questions. It plays once. You can answer while you listen. Pausing and replay are disabled."
              />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export const ListeningAudioPanel = memo(ListeningAudioPanelBase);
