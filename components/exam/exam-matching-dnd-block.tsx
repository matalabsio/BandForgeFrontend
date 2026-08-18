"use client";

import { memo, useCallback, useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import {
  planExclusiveAssign,
  planExclusiveClear,
} from "@/modules/shared/lib/exclusive-matching-assign";
import { cn } from "@/lib/utils";
import { RichText, richTextToPlain } from "@/components/rich-text";

export type MatchingQuestion = {
  id: string;
  question_number: number;
  display_number?: number | null;
  prompt: string;
};

export type MatchingOption = {
  label: string;
  text: string;
};

type LabelFormat = "roman" | "letter";
type Variant = "reading" | "exam";

type Props = {
  questions: MatchingQuestion[];
  options: MatchingOption[];
  answers: Record<string, string>;
  onAnswer: (questionId: string, value: string) => void;
  onFocus?: (questionId: string) => void;
  currentQuestionId?: string | null;
  labelFormat: LabelFormat;
  variant: Variant;
  normalize: (raw: string) => string;
  poolTitle: string;
  slotPlaceholder: string;
  pendingHint?: string;
  /** Sticky heading pool — disable inside nested scroll areas (e.g. diagnostic). */
  poolSticky?: boolean;
};

function qDisplay(q: MatchingQuestion): number {
  return q.display_number ?? q.question_number;
}

function formatLabel(label: string, format: LabelFormat): string {
  if (format === "roman") return `${label.toLowerCase()}.`;
  return label.toUpperCase();
}

const ASSIGNED_SEP = "__";

function parseDragSource(
  id: string,
): { kind: "pool"; label: string } | { kind: "assigned"; questionId: string; label: string } | null {
  if (id.startsWith("pool-")) {
    const rest = id.slice(5);
    const sep = rest.lastIndexOf(ASSIGNED_SEP);
    const encoded = sep === -1 ? rest : rest.slice(0, sep);
    try {
      return { kind: "pool", label: decodeURIComponent(encoded) };
    } catch {
      return { kind: "pool", label: encoded };
    }
  }
  if (id.startsWith("assigned-")) {
    const rest = id.slice(9);
    const sep = rest.indexOf(ASSIGNED_SEP);
    if (sep === -1) return null;
    return {
      kind: "assigned",
      questionId: rest.slice(0, sep),
      label: rest.slice(sep + ASSIGNED_SEP.length),
    };
  }
  return null;
}

function parseDropTarget(id: string): string | null {
  if (id.startsWith("slot-")) return id.slice(5);
  return null;
}

function poolDragId(label: string, index: number): string {
  return `pool-${encodeURIComponent(label)}${ASSIGNED_SEP}${index}`;
}

function assignedDragId(questionId: string, label: string): string {
  return `assigned-${questionId}${ASSIGNED_SEP}${label}`;
}

function slotDropId(questionId: string): string {
  return `slot-${questionId}`;
}

function useMatchingTheme(variant: Variant) {
  return variant === "reading"
    ? {
        border: "border-[var(--reading-border)]",
        surface: "bg-[var(--reading-surface)]",
        paper: "bg-white",
        ink: "text-[var(--reading-ink)]",
        muted: "text-[var(--reading-ink-muted)]",
        accent: "border-[var(--reading-accent)]",
        accentSoft: "bg-[var(--reading-accent-soft)]",
        accentRing: "ring-[var(--reading-accent)]/25",
        font: "font-serif",
        labelFont: "font-bold lowercase",
      }
    : {
        border: "border-[var(--exam-border)]",
        surface: "bg-[var(--exam-surface)]",
        paper: "bg-[var(--exam-paper)]",
        ink: "text-[var(--exam-ink)]",
        muted: "text-[var(--exam-ink-muted)]",
        accent: "border-[var(--exam-accent)]",
        accentSoft: "bg-[var(--exam-accent-soft)]",
        accentRing: "ring-[var(--exam-accent)]/30",
        font: "",
        labelFont: "font-bold uppercase",
      };
}

function PoolOption({
  dragId,
  option,
  labelFormat,
  isUsed,
  isPending,
  theme,
  onTap,
}: {
  dragId: string;
  option: MatchingOption;
  labelFormat: LabelFormat;
  isUsed: boolean;
  isPending: boolean;
  theme: ReturnType<typeof useMatchingTheme>;
  onTap: () => void;
}) {
  const label = option.label;
  const draggable = !isUsed;
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: dragId,
    disabled: !draggable,
    data: { kind: "pool", label },
  });

  const style = transform
    ? { transform: CSS.Translate.toString(transform) }
    : undefined;

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={cn(
        "py-2 text-[13px] leading-snug first:pt-0 last:pb-0",
        theme.ink,
        theme.font,
        isUsed && theme.muted,
        isDragging && "opacity-40",
        isPending && cn(theme.accentSoft, "rounded-md px-1 -mx-1"),
        draggable && "cursor-grab touch-manipulation active:cursor-grabbing",
      )}
    >
      <button
        type="button"
        disabled={isUsed}
        onClick={onTap}
        {...(draggable ? { ...listeners, ...attributes } : {})}
        className={cn(
          "w-full text-left",
          draggable ? "cursor-grab" : "cursor-not-allowed opacity-70",
        )}
        aria-pressed={isPending}
      >
        <span className={theme.labelFont}>{formatLabel(label, labelFormat)}</span>{" "}
        {option.text}
      </button>
    </li>
  );
}

function AssignedChip({
  questionId,
  label,
  optionText,
  labelFormat,
  theme,
}: {
  questionId: string;
  label: string;
  optionText: string;
  labelFormat: LabelFormat;
  theme: ReturnType<typeof useMatchingTheme>;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: assignedDragId(questionId, label),
    data: { kind: "assigned", questionId, label },
  });

  const style = transform
    ? { transform: CSS.Translate.toString(transform) }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={cn(
        "flex min-h-[44px] min-w-0 w-full max-w-full cursor-grab items-start gap-2 rounded-md border px-3 py-2 text-[13px] leading-snug active:cursor-grabbing",
        theme.border,
        theme.paper,
        theme.ink,
        isDragging && "opacity-40",
      )}
    >
      <span className={cn("shrink-0 pt-0.5", theme.labelFont)}>
        {formatLabel(label, labelFormat)}
      </span>
      <span className={cn("min-w-0 flex-1 break-words", theme.muted)}>
        {optionText}
      </span>
    </div>
  );
}

function SlotChevron({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function QuestionSlot({
  q,
  value,
  optionText,
  labelFormat,
  theme,
  isActive,
  isPendingTarget,
  slotPlaceholder,
  onClear,
  onTapSlot,
  onFocus,
}: {
  q: MatchingQuestion;
  value: string;
  optionText: string | null;
  labelFormat: LabelFormat;
  theme: ReturnType<typeof useMatchingTheme>;
  isActive: boolean;
  isPendingTarget: boolean;
  slotPlaceholder: string;
  onClear: () => void;
  onTapSlot: () => void;
  onFocus?: () => void;
}) {
  const dropId = slotDropId(q.id);
  const isEmpty = !value;
  const { isOver, setNodeRef } = useDroppable({
    id: dropId,
    disabled: !isEmpty,
    data: { questionId: q.id },
  });

  const num = qDisplay(q);

  return (
    <li
      className={cn(
        "flex flex-col gap-2 border-b border-dashed py-3.5 last:border-b-0",
        theme.border,
        isActive && "rounded-[10px] border border-cyan/40 px-2 -mx-1",
      )}
    >
      <span
        className={cn(
          "text-[13px] leading-snug",
          theme.ink,
          theme.font,
        )}
      >
        <strong className="mr-1.5 tabular-nums">{num}</strong>
        <RichText text={q.prompt} />
      </span>
      <div className="flex w-full min-w-0 items-start gap-2">
        {isEmpty ? (
          <button
            type="button"
            ref={setNodeRef}
            onClick={() => {
              onFocus?.();
              onTapSlot();
            }}
            onFocus={onFocus}
            aria-label={`Question ${num}: ${richTextToPlain(q.prompt)}. ${slotPlaceholder}`}
            className={cn(
              "flex min-h-[44px] w-full items-center justify-between gap-2 rounded-lg border-2 border-dashed px-3 py-2.5 text-left transition-colors",
              theme.border,
              theme.paper,
              isOver && cn(theme.accent, theme.accentSoft),
              isPendingTarget &&
                cn(theme.accent, theme.accentSoft, "ring-2", theme.accentRing),
            )}
          >
            <span className={cn("text-[12px] font-medium", theme.muted)}>
              {isPendingTarget ? "Tap to assign" : slotPlaceholder}
            </span>
            <SlotChevron className={cn("size-4 shrink-0 opacity-70", theme.muted)} />
          </button>
        ) : (
          <>
            <AssignedChip
              questionId={q.id}
              label={value}
              optionText={optionText ?? value}
              labelFormat={labelFormat}
              theme={theme}
            />
            <button
              type="button"
              onClick={onClear}
              className={cn(
                "mt-0.5 flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-md border text-[14px] leading-none hover:opacity-80",
                theme.border,
                theme.muted,
              )}
              aria-label={`Clear answer for question ${num}`}
            >
              ×
            </button>
          </>
        )}
      </div>
    </li>
  );
}

function ExamMatchingDnDBlockBase({
  questions,
  options,
  answers,
  onAnswer,
  onFocus,
  currentQuestionId = null,
  labelFormat,
  variant,
  normalize,
  poolTitle,
  slotPlaceholder,
  pendingHint = "Tap an option, then tap an empty row to assign.",
  poolSticky = true,
}: Props) {
  const theme = useMatchingTheme(variant);
  const [pendingLabel, setPendingLabel] = useState<string | null>(null);
  const [activeDrag, setActiveDrag] = useState<{
    label: string;
    text: string;
  } | null>(null);
  const [liveMessage, setLiveMessage] = useState("");

  const sortedQuestions = useMemo(
    () => questions.toSorted((a, b) => qDisplay(a) - qDisplay(b)),
    [questions],
  );

  const optionByLabel = useMemo(() => {
    const map = new Map<string, MatchingOption>();
    for (const o of options) {
      map.set(normalize(o.label), o);
    }
    return map;
  }, [options, normalize]);

  const assignedLabels = useMemo(() => {
    const labels = new Set<string>();
    for (const q of sortedQuestions) {
      const value = normalize(answers[q.id] ?? "");
      if (value) labels.add(value);
    }
    return labels;
  }, [answers, sortedQuestions, normalize]);

  const applyChanges = useCallback(
    (changes: { id: string; value: string }[]) => {
      for (const change of changes) {
        onAnswer(change.id, change.value);
      }
    },
    [onAnswer],
  );

  const tryAssign = useCallback(
    (
      targetQuestionId: string,
      label: string,
      sourceQuestionId?: string | null,
    ): boolean => {
      const result = planExclusiveAssign({
        answers,
        questions: sortedQuestions,
        targetQuestionId,
        label,
        normalize,
        sourceQuestionId,
      });
      if (!result.ok) return false;
      applyChanges(result.changes);
      const opt = optionByLabel.get(normalize(label));
      setLiveMessage(
        `Assigned ${formatLabel(normalize(label), labelFormat)}${opt ? `: ${opt.text}` : ""} to question ${qDisplay(sortedQuestions.find((q) => q.id === targetQuestionId)!)}`,
      );
      return true;
    },
    [answers, sortedQuestions, normalize, applyChanges, optionByLabel, labelFormat],
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 220, tolerance: 8 } }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    const source = parseDragSource(String(event.active.id));
    if (!source) return;
    const label = source.kind === "pool" ? source.label : source.label;
    const opt = optionByLabel.get(normalize(label));
    setActiveDrag({ label, text: opt?.text ?? label });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDrag(null);
    const source = parseDragSource(String(event.active.id));
    const targetId = event.over ? parseDropTarget(String(event.over.id)) : null;
    if (!source || !targetId) return;

    const label = source.label;
    const sourceQuestionId = source.kind === "assigned" ? source.questionId : null;
    tryAssign(targetId, label, sourceQuestionId);
  };

  const handlePoolTap = (label: string) => {
    if (assignedLabels.has(label)) return;
    setPendingLabel((prev) => (prev === label ? null : label));
  };

  const handleSlotTap = (questionId: string) => {
    if (!pendingLabel) return;
    const empty = !normalize(answers[questionId] ?? "");
    if (!empty) return;
    if (tryAssign(questionId, pendingLabel)) {
      setPendingLabel(null);
    }
  };

  const handleClear = (questionId: string) => {
    const { changes } = planExclusiveClear(answers, questionId);
    applyChanges(changes);
    setPendingLabel(null);
    setLiveMessage(`Cleared question ${qDisplay(sortedQuestions.find((q) => q.id === questionId)!)}`);
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      accessibility={{
        announcements: {
          onDragStart({ active }) {
            const source = parseDragSource(String(active.id));
            if (!source) return "";
            const opt = optionByLabel.get(normalize(source.label));
            return `Picked up ${formatLabel(normalize(source.label), labelFormat)}${opt ? ` ${opt.text}` : ""}`;
          },
          onDragOver({ over }) {
            if (!over) return "";
            const targetId = parseDropTarget(String(over.id));
            if (!targetId) return "";
            const q = sortedQuestions.find((item) => item.id === targetId);
            return q ? `Over question ${qDisplay(q)}` : "";
          },
          onDragEnd({ over }) {
            if (!over) return "Dropped";
            const targetId = parseDropTarget(String(over.id));
            if (!targetId) return "Dropped";
            const q = sortedQuestions.find((item) => item.id === targetId);
            return q ? `Dropped on question ${qDisplay(q)}` : "Dropped";
          },
          onDragCancel() {
            return "Drag cancelled";
          },
        },
      }}
    >
      <div className="space-y-4">
        {pendingLabel ? (
          <p className={cn("text-[12px]", theme.muted)} role="status">
            {pendingHint} Selected:{" "}
            <strong className={theme.ink}>
              {formatLabel(pendingLabel, labelFormat)}
            </strong>
          </p>
        ) : null}

        <div
          className={cn(
            "rounded-lg border px-4 py-3",
            // Sticky only when not nested in a scrolling panel (covers slots).
            poolSticky && "sticky top-0 z-10 shadow-sm",
            theme.border,
            variant === "reading" ? theme.surface : theme.paper,
          )}
        >
          <p
            className={cn(
              "text-[10px] font-bold uppercase tracking-[0.12em]",
              theme.muted,
            )}
          >
            {poolTitle}
          </p>
          <ul
            className={cn(
              "mt-2 max-h-[min(36vh,240px)] divide-y overflow-y-auto overscroll-contain",
              theme.border,
            )}
          >
            {options.map((o, index) => {
              const label = normalize(o.label);
              return (
                <PoolOption
                  key={`${label}-${index}`}
                  dragId={poolDragId(label, index)}
                  option={{ ...o, label }}
                  labelFormat={labelFormat}
                  isUsed={assignedLabels.has(label)}
                  isPending={pendingLabel === label}
                  theme={theme}
                  onTap={() => handlePoolTap(label)}
                />
              );
            })}
          </ul>
        </div>

        <ul className={cn("rounded-lg border px-3 py-1 sm:px-4", theme.border, theme.paper)}>
          {sortedQuestions.map((q) => {
            const value = normalize(answers[q.id] ?? "");
            const opt = value ? optionByLabel.get(value) : null;
            return (
              <QuestionSlot
                key={q.id}
                q={q}
                value={value}
                optionText={opt?.text ?? null}
                labelFormat={labelFormat}
                theme={theme}
                isActive={currentQuestionId === q.id}
                isPendingTarget={Boolean(pendingLabel && !value)}
                slotPlaceholder={slotPlaceholder}
                onClear={() => handleClear(q.id)}
                onTapSlot={() => handleSlotTap(q.id)}
                onFocus={onFocus ? () => onFocus(q.id) : undefined}
              />
            );
          })}
        </ul>

        <p className="sr-only" aria-live="polite" aria-atomic="true">
          {liveMessage}
        </p>
      </div>

      <DragOverlay dropAnimation={null} zIndex={60}>
        {activeDrag ? (
          <div
            className={cn(
              "max-w-[min(90vw,20rem)] rounded-md border px-3 py-2 text-[13px] leading-snug shadow-lg",
              theme.border,
              theme.paper,
              theme.ink,
            )}
          >
            <span className={theme.labelFont}>
              {formatLabel(activeDrag.label, labelFormat)}
            </span>{" "}
            {activeDrag.text}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

export const ExamMatchingDnDBlock = memo(ExamMatchingDnDBlockBase);
