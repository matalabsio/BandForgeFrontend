import Image from "next/image";
import heroBg from "@/app/herobg.png";
import { HeroCtaButton } from "@/components/landing/hero-cta-button";

/** Fills remaining viewport below header — no extra outer padding */
export function LandingHero() {
  return (
    <section
      className="relative flex min-h-0 flex-1 flex-col justify-center overflow-hidden"
      aria-labelledby="hero-heading"
    >
      <Image
        src={heroBg}
        alt=""
        fill
        priority
        quality={85}
        sizes="100vw"
        className="object-cover object-center"
        fetchPriority="high"
      />

      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/50 via-white/20 to-white/40"
        aria-hidden
      />

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 py-6 sm:px-6">
        <div className="w-full max-w-3xl rounded-2xl bg-white/80 px-5 py-8 text-center shadow-[var(--shadow-soft)] backdrop-blur-[2px] sm:px-8 sm:py-10">
          <h1
            id="hero-heading"
            className="text-[1.625rem] font-bold leading-[1.2] tracking-tight text-navy sm:text-4xl md:text-[2.75rem]"
          >
            The world&apos;s{" "}
            <span className="text-teal">most trusted</span> IELTS practice
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-body leading-relaxed text-ink/80">
            Full-length mocks with a calm, exam-faithful interface — built by
            MATA Labs for candidates who need the real test experience.
          </p>

          <div className="mx-auto mt-8 flex w-full max-w-lg flex-col gap-3 sm:flex-row sm:justify-center">
            <HeroCtaButton href="/dashboard" variant="primary">
              BandForge for test takers
            </HeroCtaButton>
            <HeroCtaButton href="/test/reading" variant="secondary">
              Preview test interface
            </HeroCtaButton>
          </div>
        </div>
      </div>
    </section>
  );
}
