"use client";

import {
  evaluatorBody,
  evaluatorCard,
  evaluatorCardPad,
  evaluatorMeta,
  evaluatorTitle,
} from "@/components/admin/evaluator/evaluator-ui";
import { cn } from "@/lib/utils";

type Props = {
  activePart: number;
};

const PARTS = [1, 2, 3];

export function EvaluatorPartTabs({ activePart }: Props) {
  return (
    <div
      className="flex border-b border-[#EAEEF3]"
      role="tablist"
      aria-label="Speaking parts"
    >
      {PARTS.map((part) => {
        const active = part === activePart;
        const disabled = part !== activePart;
        return (
          <button
            key={part}
            type="button"
            role="tab"
            aria-selected={active}
            disabled={disabled}
            className={cn(
              "cursor-pointer px-4 py-2.5 text-sm font-medium transition-colors sm:px-[18px]",
              active
                ? "border-b-[2.5px] border-cyan font-bold text-navy"
                : "text-[#94A3B8] hover:text-[#5A6B82]",
              disabled && !active && "cursor-not-allowed",
            )}
          >
            Part {part}
          </button>
        );
      })}
    </div>
  );
}

function parseCueBullets(cueCard: string): string[] {
  const lines = cueCard
    .split(/\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  return lines
    .map((l) => l.replace(/^[-•*]\s*/, ""))
    .filter((l) => l.length > 0);
}

export function EvaluatorCueCard({
  title,
  cueCard,
  transcript,
}: {
  title?: string | null;
  cueCard?: string | null;
  transcript?: string | null;
}) {
  const body = cueCard?.trim() || transcript?.trim();
  if (!title && !body) return null;

  const bullets = cueCard ? parseCueBullets(cueCard) : [];
  const hasBullets = bullets.length > 0;

  return (
    <section className={cn(evaluatorCard, evaluatorCardPad)}>
      <p className={evaluatorMeta}>Cue card shown to student</p>
      {title ? (
        <h3 className={cn(evaluatorTitle, "mt-2 text-lg leading-snug")}>
          {title}
        </h3>
      ) : null}
      {hasBullets ? (
        <>
          <p className={cn(evaluatorBody, "mt-3")}>You should say:</p>
          <ul className="mt-2 flex flex-col gap-1 pl-[18px]">
            {bullets.map((item) => (
              <li key={item} className={evaluatorBody}>
                {item}
              </li>
            ))}
          </ul>
        </>
      ) : body ? (
        <pre className="mt-3 whitespace-pre-wrap font-sans text-sm font-light leading-relaxed text-[#5A6B82]">
          {body}
        </pre>
      ) : null}
    </section>
  );
}
