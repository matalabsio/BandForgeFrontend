import { BfModuleCard, BfSectionEyebrow, BfSectionHeading } from "@/components/bandforge/ui";
import { BRAND_MODULES } from "@/lib/brand-mock-data";

export function BandForgeModules() {
  return (
    <section
      id="modules"
      className="scroll-mt-20 border-t border-border-soft bg-surface-alt bf-section"
    >
      <div className="bf-container">
        <div className="mb-6 lg:mx-auto lg:mb-[54px] lg:max-w-3xl lg:text-center">
          <BfSectionEyebrow className="mb-3">Four modules</BfSectionEyebrow>
          <BfSectionHeading>Every section, measured</BfSectionHeading>
        </div>
        <div className="flex flex-col gap-3.5 lg:grid lg:grid-cols-4 lg:gap-5">
          {BRAND_MODULES.map((mod) => (
            <BfModuleCard
              key={mod.key}
              title={mod.title}
              description={mod.description}
              Icon={mod.Icon}
              band={mod.band}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
