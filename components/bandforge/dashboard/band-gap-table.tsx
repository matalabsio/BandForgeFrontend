"use client";

import { useState, useMemo, type ComponentType, type SVGProps } from "react";
import {
  BookOpen,
  ChevronDown,
  Headphones,
  Mic,
  PenLine,
  Sparkles,
  Target,
  TrendingUp,
  TriangleAlert,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  SkillProgressStepper,
  type SkillStepperStep,
} from "@/components/bandforge/dashboard/skill-progress-stepper";
import {
  skillLabel,
  skillStatuses,
  type SkillBands,
  type SkillKey,
  type SkillStatus,
} from "@/lib/diagnostic-performance";
import { cn } from "@/lib/utils";

const SKILL_ORDER: SkillKey[] = ["listening", "reading", "writing", "speaking"];

const SKILL_ICONS: Record<
  SkillKey,
  ComponentType<SVGProps<SVGSVGElement>>
> = {
  listening: Headphones,
  reading: BookOpen,
  writing: PenLine,
  speaking: Mic,
};

type Tone = {
  score: string;
  iconWrap: string;
  badge: string;
  border: string;
};

const TONES: Record<SkillStatus, Tone> = {
  on_track: {
    score: "text-teal",
    iconWrap: "bg-cyan-soft text-teal",
    badge: "bg-cyan-soft text-teal ring-cyan/25",
    border: "border-cyan/25",
  },
  strongest: {
    score: "text-teal",
    iconWrap: "bg-teal text-white",
    badge: "bg-teal/10 text-teal ring-teal/20",
    border: "border-cyan/25",
  },
  focus_area: {
    score: "text-amber-800",
    iconWrap: "bg-amber-50 text-amber-700",
    badge: "bg-amber-50 text-amber-900 ring-amber-200/70",
    border: "border-amber-200/60",
  },
  priority: {
    score: "text-red-700",
    iconWrap: "bg-red-50 text-red-600",
    badge: "bg-red-50 text-red-700 ring-red-200/70",
    border: "border-red-200/60",
  },
};

function GrowthIcon({
  status,
  scored,
  className,
}: {
  status: SkillStatus;
  scored: boolean;
  className?: string;
}) {
  if (!scored) {
    return <Target className={className} strokeWidth={2.25} aria-hidden />;
  }
  if (status === "strongest" || status === "on_track") {
    return <Sparkles className={className} strokeWidth={2.25} aria-hidden />;
  }
  if (status === "focus_area") {
    return <TrendingUp className={className} strokeWidth={2.25} aria-hidden />;
  }
  return <TriangleAlert className={className} strokeWidth={2.25} aria-hidden />;
}

function growthLabel(status: SkillStatus, scored: boolean, gap: number): string {
  if (!scored) return "Awaiting score";
  if (gap <= 0) return "On target";
  if (status === "strongest") return "Strongest skill";
  if (status === "on_track") return "Closing in";
  if (status === "focus_area") return "Room to grow";
  return "Priority lift";
}

function bandMilestoneValues(score: number, target: number): number[] {
  const start = Number(score.toFixed(1));
  const end = Number(target.toFixed(1));
  if (end <= start) return [start];

  const mids: number[] = [];
  for (let b = Math.floor(start) + 1; b < end; b += 1) {
    mids.push(b);
  }

  let values = [start, ...mids, end];
  values = values.filter(
    (v, i, arr) => i === 0 || Math.abs(v - arr[i - 1]) > 0.05,
  );

  if (values.length <= 4) return values;

  return [
    values[0],
    values[Math.floor((values.length - 1) / 3)],
    values[Math.floor((2 * (values.length - 1)) / 3)],
    values[values.length - 1],
  ].map((v) => Number(v.toFixed(1)));
}

function buildBandStepperSteps(
  skillKey: SkillKey,
  band: number,
  targetBand: number,
): SkillStepperStep[] {
  const SkillIcon = SKILL_ICONS[skillKey];
  const values = bandMilestoneValues(band, targetBand);
  const midIcons = [TrendingUp, Sparkles] as const;
  let currentSet = false;

  return values.map((value, index) => {
    const isFirst = index === 0;
    const isLast = index === values.length - 1;
    const reached = band + 0.001 >= value;
    let state: SkillStepperStep["state"] = "upcoming";
    if (reached) {
      state = "done";
    } else if (!currentSet) {
      state = "current";
      currentSet = true;
    }
    if (isFirst) state = "done";

    const icon = isFirst
      ? SkillIcon
      : isLast
        ? Target
        : midIcons[(index - 1) % midIcons.length];

    return {
      id: `${skillKey}-${value}`,
      label: isFirst
        ? "Now"
        : isLast
          ? "Target"
          : index === 1
            ? "Grow"
            : "Close",
      detail: value.toFixed(1),
      icon,
      state,
    };
  });
}

function badgeCopy(scored: boolean, skillGap: number, score: number): string {
  if (!scored) return "Pending";
  if (score > 0 && score < 1) return "Early score";
  if (skillGap > 0) return `+${skillGap.toFixed(1)}`;
  return "On target";
}

function SkillAccordionRow({
  skillKey,
  band,
  targetBand,
  status,
  index,
  animate,
  reduceMotion,
  open,
  onToggle,
  embedded,
}: {
  skillKey: SkillKey;
  band: number | null;
  targetBand: number;
  status: SkillStatus;
  index: number;
  animate: boolean;
  reduceMotion: boolean | null;
  open: boolean;
  onToggle: () => void;
  embedded?: boolean;
}) {
  const Icon = SKILL_ICONS[skillKey];
  const scored = band != null && band > 0;
  const score = scored ? band : 0;
  const skillGap = scored ? Math.max(0, targetBand - score) : 0;
  const tone = scored ? TONES[status] : null;
  const early = scored && score < 1;

  const steps = useMemo(
    () => (scored ? buildBandStepperSteps(skillKey, band!, targetBand) : []),
    [scored, skillKey, band, targetBand],
  );

  const row = (
    <div
      data-skill-gap-card=""
      className={cn(
        "overflow-hidden",
        embedded
          ? "border-b border-ink/[0.06] last:border-b-0"
          : cn(
              "rounded-2xl border border-ink/8 bg-white",
              scored && tone?.border,
              !scored && "bg-surface/40",
              open && "shadow-[0_1px_0_rgba(255,255,255,0.85)_inset]",
            ),
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className={cn(
          "flex w-full cursor-pointer items-center gap-3 text-left transition-colors hover:bg-cyan-soft/25",
          embedded ? "px-1 py-3 sm:py-3.5" : "px-3.5 py-3 sm:px-4 sm:py-3.5",
        )}
      >
        <span
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-xl",
            scored ? tone!.iconWrap : "bg-ink/[0.05] text-muted",
          )}
        >
          <Icon className="size-4" strokeWidth={2.1} aria-hidden />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <p className="text-[13px] font-bold text-ink">
              {skillLabel(skillKey)}
            </p>
            <span
              className={cn(
                "inline-flex items-center rounded-full px-2 py-0.5 text-[10.5px] font-semibold ring-1",
                scored
                  ? early
                    ? "bg-amber-50 text-amber-900 ring-amber-200/70"
                    : tone!.badge
                  : "bg-ink/[0.04] text-muted ring-ink/8",
              )}
            >
              {badgeCopy(scored, skillGap, score)}
            </span>
          </div>
          {scored ? (
            <p className="mt-0.5 text-[12px] text-muted">
              {growthLabel(status, scored, skillGap)}
            </p>
          ) : null}
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <p
            className={cn(
              "font-mono text-base font-semibold tabular-nums sm:text-lg",
              scored ? tone!.score : "text-muted-light",
            )}
          >
            {scored ? score.toFixed(1) : "—"}
          </p>
          <ChevronDown
            className={cn(
              "size-4 text-muted-light transition-transform duration-200",
              open && "rotate-180",
            )}
            aria-hidden
          />
        </div>
      </button>

      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            key="panel"
            initial={reduceMotion ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={reduceMotion ? undefined : { height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div
              className={cn(
                "pb-3.5 pt-0.5",
                embedded
                  ? "px-1 pb-4"
                  : "border-t border-ink/[0.05] px-3.5 pb-4 pt-3 sm:px-4",
              )}
            >
              {scored ? (
                <>
                  <SkillProgressStepper steps={steps} compact animate />
                  <p
                    className={cn(
                      "mt-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11.5px] font-semibold ring-1",
                      early
                        ? "bg-amber-50 text-amber-900 ring-amber-200/70"
                        : tone!.badge,
                    )}
                  >
                    <GrowthIcon status={status} scored className="size-3" />
                    {early
                      ? "Early score · keep practicing"
                      : skillGap > 0
                        ? `+${skillGap.toFixed(1)} band to close`
                        : "Target met"}
                  </p>
                </>
              ) : (
                <p className="text-[13px] leading-relaxed text-muted">
                  Finish a practice or diagnostic to unlock this growth path.
                </p>
              )}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );

  if (!animate) return row;

  return (
    <motion.div
      className="w-full"
      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{
        duration: 0.35,
        delay: 0.03 + index * 0.05,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {row}
    </motion.div>
  );
}

type Props = {
  bands: SkillBands;
  targetBand: number;
  statuses?: Record<SkillKey, SkillStatus>;
  animate?: boolean;
  /** Divider list without the Skill queue chrome — dashboard pair layout. */
  embedded?: boolean;
};

export function BandGapTable({
  bands,
  targetBand,
  statuses,
  animate = false,
  embedded = false,
}: Props) {
  const reduceMotion = useReducedMotion();
  const resolvedStatuses = statuses ?? skillStatuses(bands, targetBand);
  const [openKey, setOpenKey] = useState<SkillKey | null>(null);

  return (
    <div className="min-w-0 flex-1">
      {embedded ? null : (
        <div className="mb-3.5 flex flex-wrap items-baseline justify-between gap-2 sm:gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-light">
              Skill queue
            </p>
            <p className="mt-0.5 text-[12px] text-muted">
              Tap a skill to expand the growth path
            </p>
          </div>
          <p className="inline-flex items-center gap-1.5 text-[11px] font-medium text-muted">
            <Target className="size-3 text-teal" aria-hidden />
            Band {targetBand.toFixed(1)} target
          </p>
        </div>
      )}

      <div className={cn(embedded ? "flex flex-col" : "flex flex-col gap-2")}>
        {SKILL_ORDER.map((key, index) => (
          <SkillAccordionRow
            key={key}
            skillKey={key}
            band={bands[key]}
            targetBand={targetBand}
            status={resolvedStatuses[key]}
            index={index}
            animate={animate}
            reduceMotion={reduceMotion}
            embedded={embedded}
            open={openKey === key}
            onToggle={() =>
              setOpenKey((prev) => (prev === key ? null : key))
            }
          />
        ))}
      </div>
    </div>
  );
}
