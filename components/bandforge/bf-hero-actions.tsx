import { BfHeroStartCta } from "@/components/bandforge/bf-hero-start-cta";

const startClassName =
  "group pointer-events-auto relative flex w-full min-w-[14.5rem] items-center justify-center gap-2.5 overflow-hidden rounded-full bg-[linear-gradient(135deg,#00bcd4_0%,#00a8bf_55%,#0097a7_100%)] bg-[length:160%_160%] bg-[position:0%_50%] px-9 py-[17px] text-[1.0625rem] font-semibold text-white no-underline shadow-[0_8px_22px_rgb(0_151_167/0.28)] transition-[transform,box-shadow,background-position] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] before:pointer-events-none before:absolute before:inset-y-0 before:left-0 before:w-[45%] before:-translate-x-[140%] before:skew-x-[-20deg] before:bg-[linear-gradient(90deg,transparent,rgb(255_255_255/0.28),transparent)] before:transition-transform before:duration-700 before:ease-out hover:-translate-y-0.5 hover:bg-[position:100%_50%] hover:shadow-[0_14px_32px_rgb(0_151_167/0.42)] hover:before:translate-x-[280%] active:translate-y-0 active:shadow-[0_8px_20px_rgb(0_151_167/0.28)] sm:w-auto sm:min-w-[16rem] lg:inline-flex lg:min-w-[17.5rem] lg:px-11 lg:py-[18px] lg:shadow-[0_10px_26px_rgb(0_151_167/0.28)] lg:hover:shadow-[0_16px_36px_rgb(0_151_167/0.45)]";

/** Hero CTA — Free diagnostic button → diagnostic landing. */
export function BfHeroActions() {
  return (
    <div className="mt-0 flex justify-center lg:mt-9">
      <BfHeroStartCta className={startClassName} />
    </div>
  );
}
