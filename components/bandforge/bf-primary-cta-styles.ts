import { cn } from "@/lib/utils";

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

/** Diagnostic exam / form full-width primary CTA — flat (no shadow / border chrome). */
export const bfPrimaryCtaDiagClass = cn(
  "group relative inline-flex w-full min-h-[var(--spacing-touch,48px)] cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-full border-0 font-display px-6 py-3.5 text-base font-semibold text-white no-underline shadow-none transition-[background-position] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-right focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan/40 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60",
  BF_PRIMARY_CTA_GRADIENT,
);
