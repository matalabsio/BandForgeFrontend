import Link from "next/link";
import { Check, Lock, Mic, Pencil, Sparkles } from "lucide-react";

import {
  DUAL_BUNDLE_SLUG,
  isDualPackUnlocked,
  isSpeakingPackUnlocked,
  isWritingPackUnlocked,
  SPEAKING_PRACTICE_PATH,
  SPEAKING_SKILL_SLUG,
  WRITING_PRACTICE_PATH,
  WRITING_SKILL_SLUG,
} from "@/lib/entitlement";
import type { Subscription } from "@/lib/payments";
import { cn } from "@/lib/utils";

type Props = {
  subscription: Subscription;
};

type PackCard = {
  id: "writing" | "speaking" | "dual";
  name: string;
  subtitle: string;
  blurb: string;
  unlockLabel: string;
  pricingSlug: string;
  unlocked: boolean;
  Icon: typeof Pencil;
};

/**
 * Non-FSP `/practice` index: Writing, Speaking, Dual — locked per plan.
 */
export function PracticeSkillPackCards({ subscription }: Props) {
  const cards: PackCard[] = [
    {
      id: "writing",
      name: "Writing Skill",
      subtitle: "Task 1 + Task 2 · Academic or GT",
      blurb: "12 sequential hubs and 1 Writing mock after the course.",
      unlockLabel: "Unlock Writing",
      pricingSlug: WRITING_SKILL_SLUG,
      unlocked: isWritingPackUnlocked(subscription),
      Icon: Pencil,
    },
    {
      id: "speaking",
      name: "Speaking Skill",
      subtitle: "Part 1 · Part 2 · Part 3",
      blurb: "Record, AI feedback, and 1 Speaking mock after the course.",
      unlockLabel: "Unlock Speaking",
      pricingSlug: SPEAKING_SKILL_SLUG,
      unlocked: isSpeakingPackUnlocked(subscription),
      Icon: Mic,
    },
    {
      id: "dual",
      name: "Writing + Speaking",
      subtitle: "Dual Bundle",
      blurb: "Both production skills in one purchase — two skill mocks.",
      unlockLabel: "Unlock Dual Bundle",
      pricingSlug: DUAL_BUNDLE_SLUG,
      unlocked: isDualPackUnlocked(subscription),
      Icon: Sparkles,
    },
  ];

  return (
    <div className="space-y-6 pb-2">
      <header>
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-teal">
          Your skill packs
        </p>
        <h1 className="mt-1.5 font-display text-2xl font-bold tracking-tight text-ink sm:text-[1.75rem]">
          Practice
        </h1>
        <p className="mt-1.5 max-w-xl text-[14px] leading-relaxed text-muted">
          Unlock Writing, Speaking, or both. Each pack opens its own practice
          path when your plan includes it.
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-3">
        {cards.map((card) => (
          <SkillPackCard key={card.id} card={card} />
        ))}
      </div>
    </div>
  );
}

function SkillPackCard({ card }: { card: PackCard }) {
  const Icon = card.Icon;

  return (
    <article
      className={cn(
        "flex flex-col rounded-2xl border bg-white px-4 py-5 sm:px-5",
        "transition-[border-color,box-shadow,transform] duration-200 ease-out",
        "motion-reduce:transition-none motion-reduce:hover:transform-none",
        card.unlocked
          ? "border-cyan/30 shadow-[0_1px_0_rgba(255,255,255,0.8)_inset] hover:-translate-y-0.5 hover:border-cyan/50 hover:shadow-[0_12px_28px_rgba(15,23,42,0.06)]"
          : "border-ink/8 opacity-[0.92]",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className={cn(
            "flex size-11 shrink-0 items-center justify-center rounded-2xl",
            card.unlocked
              ? "bg-cyan-soft text-teal"
              : "bg-[#EEF2F6] text-[#8FA3B8]",
          )}
        >
          <Icon className="size-5" strokeWidth={2.1} aria-hidden />
        </span>
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold",
            card.unlocked
              ? "bg-cyan-soft text-teal"
              : "bg-[#F1F4F8] text-[#5A6B82]",
          )}
        >
          {card.unlocked ? (
            <>
              <Check className="size-3" strokeWidth={2.5} aria-hidden />
              Included
            </>
          ) : (
            <>
              <Lock className="size-3" strokeWidth={2.5} aria-hidden />
              Locked
            </>
          )}
        </span>
      </div>

      <h2 className="mt-4 font-display text-[15px] font-bold text-ink">
        {card.name}
      </h2>
      <p className="mt-0.5 text-[12px] font-medium text-teal">{card.subtitle}</p>
      <p className="mt-2 flex-1 text-[13px] leading-relaxed text-muted">
        {card.blurb}
      </p>

      <div className="mt-5 flex flex-col gap-2">
        {card.unlocked ? (
          card.id === "dual" ? (
            <>
              <Link
                href={WRITING_PRACTICE_PATH}
                className="inline-flex h-10 cursor-pointer items-center justify-center rounded-full bg-cyan px-4 text-[13px] font-semibold text-white transition-[background-color,transform] duration-200 hover:-translate-y-px hover:bg-brand-sky-hover motion-reduce:hover:transform-none"
              >
                Open Writing
              </Link>
              <Link
                href={SPEAKING_PRACTICE_PATH}
                className="inline-flex h-10 cursor-pointer items-center justify-center rounded-full border border-ink/10 bg-white px-4 text-[13px] font-semibold text-ink transition-[border-color,background-color] duration-200 hover:border-cyan/35 hover:bg-[#F7FBFD]"
              >
                Open Speaking
              </Link>
            </>
          ) : (
            <Link
              href={
                card.id === "writing"
                  ? WRITING_PRACTICE_PATH
                  : SPEAKING_PRACTICE_PATH
              }
              className="inline-flex h-10 cursor-pointer items-center justify-center rounded-full bg-cyan px-4 text-[13px] font-semibold text-white transition-[background-color,transform] duration-200 hover:-translate-y-px hover:bg-brand-sky-hover motion-reduce:hover:transform-none"
            >
              Open {card.id === "writing" ? "Writing" : "Speaking"}
            </Link>
          )
        ) : (
          <Link
            href={`/pricing#plan-${card.pricingSlug}`}
            className="inline-flex h-10 cursor-pointer items-center justify-center gap-1.5 rounded-full border border-ink/10 bg-[#F7F8FA] px-4 text-[13px] font-semibold text-ink transition-[border-color,background-color] duration-200 hover:border-cyan/35 hover:bg-white"
          >
            <Lock className="size-3.5" strokeWidth={2.2} aria-hidden />
            {card.unlockLabel}
          </Link>
        )}
      </div>
    </article>
  );
}
