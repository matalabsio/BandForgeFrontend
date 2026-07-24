import { BfHeroStartCta } from "@/components/bandforge/bf-hero-start-cta";

const startClassName =
  "pointer-events-auto flex w-full items-center justify-center gap-2 rounded-full bg-cyan px-6 py-[17px] text-[1.0625rem] font-semibold text-white no-underline shadow-[0_8px_20px_rgb(0_151_167/0.26)] transition-colors hover:bg-brand-sky-hover sm:w-auto lg:inline-flex lg:px-[30px] lg:py-[18px] lg:shadow-[0_10px_26px_rgb(0_151_167/0.26)]";

/** Hero CTA — single Start free button → dashboard (auth). */
export function BfHeroActions() {
  return (
    <div className="mt-[30px] flex justify-center lg:mt-9">
      <BfHeroStartCta className={startClassName} />
    </div>
  );
}
