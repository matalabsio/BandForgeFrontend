import { BfHeroStartCta } from "@/components/bandforge/bf-hero-start-cta";

const startClassName =
  "group pointer-events-auto relative flex w-full min-w-[14.5rem] items-center justify-center gap-2.5 overflow-hidden rounded-full border-2 border-cyan bg-[linear-gradient(90deg,#00bcd4_0%,#00a8bf_50%,#0097a7_100%)] px-9 py-[17px] text-[1.0625rem] font-semibold text-white no-underline shadow-[0_8px_22px_rgb(0_151_167/0.28)] transition-[transform,box-shadow,border-color,filter] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:border-white/70 hover:shadow-[0_14px_32px_rgb(0_151_167/0.4)] hover:brightness-[1.06] active:translate-y-0 active:shadow-[0_8px_22px_rgb(0_151_167/0.28)] sm:w-auto sm:min-w-[16rem] lg:inline-flex lg:min-w-[17.5rem] lg:px-11 lg:py-[18px]";

/** Hero CTA — Free diagnostic button → diagnostic landing. */
export function BfHeroActions() {
  return (
    <div className="mt-0 flex justify-center">
      <BfHeroStartCta className={startClassName} />
    </div>
  );
}
