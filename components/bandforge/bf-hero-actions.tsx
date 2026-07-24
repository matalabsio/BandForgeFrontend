import { BfHeroStartCta } from "@/components/bandforge/bf-hero-start-cta";

const startClassName =
  "group pointer-events-auto relative flex w-full min-w-[14.5rem] items-center justify-center gap-2.5 overflow-hidden rounded-full border border-cyan/25 bg-[#e0f7fa] px-9 py-[17px] text-[1.0625rem] font-semibold text-cyan no-underline shadow-[0_6px_18px_rgb(0_151_167/0.12)] transition-[transform,box-shadow,border-color,color] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] before:pointer-events-none before:absolute before:inset-0 before:origin-left before:scale-x-0 before:rounded-full before:bg-[linear-gradient(90deg,#00bcd4_0%,#00a8bf_50%,#0097a7_100%)] before:transition-transform before:duration-700 before:ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:border-transparent hover:text-white hover:shadow-[0_14px_32px_rgb(0_151_167/0.38)] hover:before:scale-x-100 active:translate-y-0 active:shadow-[0_6px_18px_rgb(0_151_167/0.12)] sm:w-auto sm:min-w-[16rem] lg:inline-flex lg:min-w-[17.5rem] lg:px-11 lg:py-[18px]";

/** Hero CTA — Free diagnostic button → diagnostic landing. */
export function BfHeroActions() {
  return (
    <div className="mt-0 flex justify-center lg:mt-9">
      <BfHeroStartCta className={startClassName} />
    </div>
  );
}
