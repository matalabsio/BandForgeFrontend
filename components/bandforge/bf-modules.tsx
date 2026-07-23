import { BfModuleCard, BfSectionEyebrow, BfSectionHeading } from "@/components/bandforge/ui";
import { BRAND_MODULES } from "@/lib/brand-mock-data";

export function BandForgeModules() {
  return (
    <section
      id="modules"
      className="bf-ambient scroll-mt-20 border-t border-border-soft bg-surface-alt bf-section"
    >
      <div className="bf-container">
        <div className="bf-section-head mb-6 lg:mb-[54px]">
          <BfSectionEyebrow className="mb-3">Four modules</BfSectionEyebrow>
          <BfSectionHeading>Every section, measured</BfSectionHeading>
        </div>
        <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          {BRAND_MODULES.map((mod) => (
            <BfModuleCard
              key={mod.key}
              title={mod.title}
              description={mod.description}
              Icon={mod.Icon}
              band={mod.band}
              className="h-full text-left sm:text-center lg:text-left"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
