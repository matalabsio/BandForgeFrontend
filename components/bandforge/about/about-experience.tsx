import { BandForgeHeaderMarketing } from "@/components/bandforge/bf-header-marketing";
import { BandForgeSiteFooter } from "@/components/bandforge/bf-site-footer";
import { BandForgeLogoMark } from "@/components/bandforge/bandforge-logo-link";
import { BfSectionEyebrow } from "@/components/bandforge/ui";
import { BfAboutCredentials } from "@/components/bandforge/about/bf-about-credentials";
import { BfAboutFinalCta } from "@/components/bandforge/about/bf-about-final-cta";
import { BfAboutFounderStatement } from "@/components/bandforge/about/bf-about-founder-statement";
import { BfAboutPillars } from "@/components/bandforge/about/bf-about-pillars";
import { BfAboutPlatformPromise } from "@/components/bandforge/about/bf-about-platform-promise";

export function AboutExperience() {
  return (
    <div className="min-h-dvh bg-white text-ink">
      <BandForgeHeaderMarketing activeHref="/about" />
      <main>
        <section className="bf-container px-7 py-12 lg:px-10 lg:py-[5.5rem]">
          <div className="grid items-center gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-[4.5rem]">
            <div>
              <BfSectionEyebrow className="mb-[22px] lg:mb-6">
                About the founder
              </BfSectionEyebrow>
              <h1 className="font-display mb-[22px] text-[2.375rem] leading-[1.08] font-bold tracking-[-0.035em] text-balance text-navy lg:mb-7 lg:text-[3.75rem] lg:tracking-[-0.038em]">
                Built by someone who has been on both sides of the exam.
              </h1>
              <p className="text-base leading-relaxed text-muted lg:max-w-[50ch] lg:text-[1.1875rem] lg:leading-[1.6]">
                <span className="font-semibold text-navy">Kiriti Mortha</span> —
                IELTS trainer, Band 9 scorer, Gold Medallist in Literature in
                English, and Master of Public Policy from the University of
                Sydney.
              </p>
            </div>
            <aside className="hidden rounded-[1.25rem] bg-navy bg-[radial-gradient(360px_220px_at_80%_0%,rgb(0_151_167/0.28),transparent_70%)] p-10 shadow-[0_30px_60px_rgb(13_31_60/0.16)] lg:block">
              <div className="mb-8 inline-flex rounded-md bg-white px-3 py-1.5">
                <BandForgeLogoMark size="md" />
              </div>
              <p className="font-display text-[1.75rem] leading-tight font-bold text-white">
                Kiriti Mortha
              </p>
              <p className="mt-1.5 text-[0.9375rem] text-slate">
                Founder &amp; Lead Trainer
              </p>
              <div className="mt-7 flex flex-wrap gap-2.5">
                {["Band 9", "10+ yrs", "MPP · Sydney"].map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-white/22 px-3.5 py-1.5 font-mono text-[0.8125rem] text-white"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </aside>
          </div>
        </section>

        <BfAboutCredentials />
        <BfAboutFounderStatement />
        <BfAboutPillars />
        <BfAboutPlatformPromise />
        <BfAboutFinalCta />
      </main>
      <BandForgeSiteFooter />
    </div>
  );
}
