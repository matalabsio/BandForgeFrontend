import { BfHeroStartCta } from "@/components/bandforge/bf-hero-start-cta";

const startClassName =
  "group pointer-events-auto relative flex w-full min-w-[14.5rem] items-center justify-center gap-2.5 overflow-hidden rounded-full border border-transparent bg-[linear-gradient(90deg,#0EA5E9_0%,#38BDF8_35%,#7DD3FC_55%,#22D3EE_100%)] bg-[length:200%_100%] bg-left px-9 py-[17px] text-[1.0625rem] font-semibold text-white no-underline shadow-[0_8px_22px_rgb(14_165_233/0.28)] transition-[background-position,box-shadow,border-color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-right hover:border-white/40 hover:shadow-[0_16px_36px_rgb(14_165_233/0.38)] active:shadow-[0_8px_22px_rgb(14_165_233/0.28)] sm:w-auto sm:min-w-[16rem] lg:inline-flex lg:min-w-[17.5rem] lg:px-11 lg:py-[18px]";

/** Hero CTA — Free diagnostic button → diagnostic landing. */
export function BfHeroActions() {
  return (
    <div className="mt-0 flex justify-center">
      <BfHeroStartCta className={startClassName} />
    </div>
  );
}
