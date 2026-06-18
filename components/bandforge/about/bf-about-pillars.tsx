import { BfSectionEyebrow } from "@/components/bandforge/ui";
import { BRAND_ABOUT_PILLARS } from "@/lib/brand-mock-data";

export function BfAboutPillars() {
  return (
    <section className="bg-surface-alt lg:border-t lg:border-border-soft">
      <div className="bf-container px-7 py-11 lg:px-10 lg:py-[5.25rem]">
        <div className="mb-[22px] lg:mx-auto lg:mb-[50px] lg:text-center">
          <BfSectionEyebrow className="mb-[22px] lg:mb-3.5">
            Why BandForge exists
          </BfSectionEyebrow>
          <h2 className="font-display hidden text-4xl leading-[1.08] font-bold tracking-[-0.03em] text-navy lg:block">
            Three convictions, built into the product
          </h2>
        </div>
        <div className="flex flex-col gap-3.5 lg:grid lg:grid-cols-3 lg:gap-[22px]">
          {BRAND_ABOUT_PILLARS.map((pillar) => (
            <article
              key={pillar.title}
              className="rounded-r-xl border-l-[3px] border-l-cyan bg-white p-[22px] shadow-[0_6px_20px_rgb(13_31_60/0.05)] lg:rounded-r-[0.875rem] lg:p-[30px] lg:shadow-[0_6px_22px_rgb(13_31_60/0.05)]"
            >
              <h3 className="font-display mb-2 text-lg leading-snug font-bold tracking-[-0.01em] text-navy lg:mb-3 lg:text-xl lg:leading-[1.15]">
                {pillar.title}
              </h3>
              <p className="text-[0.90625rem] leading-[1.55] text-muted lg:text-[0.96875rem] lg:leading-relaxed">
                {pillar.body}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
