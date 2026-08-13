import { cn } from "@/lib/utils";

/** Same fill as primary CTAs — for chips / day pills / filled icons (no hover slide). */
export const BF_PRIMARY_FILL =
  "bg-[linear-gradient(90deg,#0097a7_0%,#00bcd4_50%,#0097a7_100%)] text-white";

/** Logo teal + cyan only — shared across marketing CTAs. */
export const BF_PRIMARY_CTA_GRADIENT =
  "bg-[linear-gradient(90deg,#0097a7_0%,#00bcd4_50%,#0097a7_100%)] bg-[length:200%_100%] bg-left";

/** Same hover for every primary CTA: gradient shift, deeper shadow, light border — no scale. */
export const BF_PRIMARY_CTA_HOVER =
  "transition-[background-position,box-shadow,border-color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-right hover:border-white/40 hover:shadow-[0_14px_32px_rgb(0_151_167/0.38)] active:shadow-[0_8px_22px_rgb(0_151_167/0.28)]";

const BF_PRIMARY_CTA_BASE =
  "group relative inline-flex cursor-pointer items-center justify-center overflow-hidden rounded-full border border-transparent font-semibold text-white no-underline shadow-[0_8px_22px_rgb(0_151_167/0.28)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan/40 focus-visible:ring-offset-2";

/** Nav / compact primary CTA */
export const bfPrimaryCtaNavClass = cn(
  BF_PRIMARY_CTA_BASE,
  BF_PRIMARY_CTA_GRADIENT,
  BF_PRIMARY_CTA_HOVER,
  "min-h-10 px-[22px] py-2.5 text-[0.9375rem]",
);

/** Hero / large primary CTA */
export const bfPrimaryCtaHeroClass = cn(
  BF_PRIMARY_CTA_BASE,
  BF_PRIMARY_CTA_GRADIENT,
  BF_PRIMARY_CTA_HOVER,
  "pointer-events-auto w-full min-w-[14.5rem] gap-2.5 px-9 py-[17px] text-[1.0625rem] sm:w-auto sm:min-w-[16rem] lg:inline-flex lg:min-w-[17.5rem] lg:px-11 lg:py-[18px]",
);

/** Exam / form full-width primary CTA — flat (no shadow / border chrome). */
export const bfPrimaryCtaDiagClass = cn(
  "group relative inline-flex h-[54px] w-full cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-full border-0 font-display px-6 text-[16px] font-semibold text-white no-underline shadow-none transition-[background-position] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-right focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan/40 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60 flex-nowrap",
  BF_PRIMARY_CTA_GRADIENT,
);

/**
 * Label + arrow row inside diagnostic CTAs.
 * Tailwind preflight sets `svg { display: block }`, so text + icon stack
 * unless this wrapper is flex.
 */
export const bfPrimaryCtaDiagInnerClass =
  "relative z-[1] inline-flex items-center justify-center gap-2 whitespace-nowrap";

/** In-exam sticky footer Continue / Submit — same gradient + hover as hero. */
export const bfPrimaryCtaExamFooterClass = cn(
  BF_PRIMARY_CTA_BASE,
  BF_PRIMARY_CTA_GRADIENT,
  BF_PRIMARY_CTA_HOVER,
  "min-h-[44px] w-full px-6 text-[14px] font-bold disabled:pointer-events-none disabled:opacity-60 sm:w-auto sm:min-w-[10rem]",
);

/** In-exam compact actions (toolbar submit, section continue). */
export const bfPrimaryCtaExamCompactClass = cn(
  BF_PRIMARY_CTA_BASE,
  BF_PRIMARY_CTA_GRADIENT,
  BF_PRIMARY_CTA_HOVER,
  "min-h-9 shrink-0 px-3.5 py-1.5 text-[11px] font-bold disabled:pointer-events-none disabled:opacity-60 sm:px-4 sm:text-[12px]",
);

/** Shared base for exam answer-sheet question browse chips (L/R). */
export const BF_EXAM_Q_BROWSE_BASE =
  "inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full border text-[12px] font-bold tabular-nums transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan/40 focus-visible:ring-offset-1";

/** Current question in the browse strip — same teal fill language as CTA. */
export const bfExamQBrowseCurrentClass = cn(
  BF_EXAM_Q_BROWSE_BASE,
  "border-transparent",
  BF_PRIMARY_FILL,
);

/** Answered (not current) browse chip. */
export const bfExamQBrowseAnsweredClass = cn(
  BF_EXAM_Q_BROWSE_BASE,
  "border-[var(--exam-accent)]/45 bg-[var(--exam-accent-soft)] text-[var(--exam-accent)]",
);

/** Unanswered browse chip. */
export const bfExamQBrowseIdleClass = cn(
  BF_EXAM_Q_BROWSE_BASE,
  "border-[var(--exam-border)] bg-white text-[var(--exam-ink-muted)] hover:border-[var(--exam-ink-muted)]",
);

/**
 * Dashboard Start now / Begin Practice — same fill + hover as hero Diagnostic
 * (`BF_PRIMARY_CTA_GRADIENT` + `BF_PRIMARY_CTA_HOVER`). Size only differs.
 * No overflow-hidden so the floating glow isn’t clipped on navy.
 */
export const bfPrimaryButtonOnNavyClass = cn(
  "group relative inline-flex w-auto max-w-full min-h-12 shrink-0 cursor-pointer items-center justify-center gap-2.5 self-start rounded-full border border-transparent px-8 py-3.5 text-[15px] font-semibold text-white no-underline shadow-[0_8px_22px_rgb(0_151_167/0.28)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan/40 focus-visible:ring-offset-2 focus-visible:ring-offset-navy sm:min-h-[3.25rem] sm:min-w-[14.5rem] sm:px-9 sm:py-[17px] sm:text-[1.0625rem]",
  BF_PRIMARY_CTA_GRADIENT,
  BF_PRIMARY_CTA_HOVER,
);
