import { BfHeroActions } from "@/components/bandforge/bf-hero-actions";

export function BandForgeHero() {
  return (
    <section
      className="relative flex min-h-[100dvh] flex-col overflow-hidden"
      aria-labelledby="bf-hero-heading"
    >
      <video
        className="absolute inset-0 h-full w-full object-cover object-center max-sm:h-[115%] max-sm:w-full max-sm:-translate-y-[10%] max-sm:object-[center_28%] sm:translate-y-0 sm:object-center"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden
      >
        <source
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_091828_e240eb17-6edc-4129-ad9d-98678e3fd238.mp4"
          type="video/mp4"
        />
      </video>

      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(245,247,250,0.85)_0%,rgba(245,247,250,0.65)_40%,rgba(245,247,250,0.82)_100%)]" />

      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute top-24 left-8 hidden rounded-2xl border border-white/70 bg-white/55 px-4 py-3 text-left shadow-[0_20px_50px_-28px_rgba(22,26,34,0.5)] backdrop-blur-md lg:block">
          <p className="text-[0.62rem] font-semibold tracking-[0.18em] text-[#9CA3AF] uppercase">
            Current Goal
          </p>
          <p className="mt-1 text-sm font-semibold text-[#111827]">Band 7.5 Journey</p>
        </div>

        <div className="absolute top-40 right-10 hidden rounded-2xl border border-white/70 bg-white/55 px-4 py-3 text-left shadow-[0_20px_50px_-28px_rgba(22,26,34,0.5)] backdrop-blur-md lg:block">
          <p className="text-[0.62rem] font-semibold tracking-[0.18em] text-[#9CA3AF] uppercase">
            Next Session
          </p>
          <p className="mt-1 text-sm font-semibold text-[#111827]">Listening Mock · 30 min</p>
        </div>

        <div className="absolute bottom-28 left-1/2 hidden -translate-x-[160%] rounded-full border border-white/80 bg-white/60 px-3 py-1.5 text-[0.68rem] font-semibold tracking-wide text-[#111827] shadow-[0_12px_35px_-22px_rgba(22,26,34,0.55)] backdrop-blur md:block">
          AI Feedback Ready
        </div>

        <div className="absolute bottom-36 left-1/2 hidden translate-x-[78%] rounded-full border border-white/80 bg-white/60 px-3 py-1.5 text-[0.68rem] font-semibold tracking-wide text-[#111827] shadow-[0_12px_35px_-22px_rgba(22,26,34,0.55)] backdrop-blur md:block">
          Real Exam Timing
        </div>
      </div>

      <div className="relative z-10 flex min-h-full items-center justify-center px-4 pb-12 pt-20 sm:px-6 sm:pb-16 sm:pt-24 md:px-8">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-y-7 text-center sm:gap-y-6">
          <p className="font-roboto-condensed text-sm font-bold tracking-[0.22em] text-[#6B7280] uppercase sm:text-base md:text-lg">
            AI-FIRST IELTS PREPARATION
          </p>
          <h1
            id="bf-hero-heading"
            className="w-full space-y-3 font-bitter text-5xl leading-[1.02] font-extrabold tracking-[-0.04em] sm:space-y-1.5 sm:text-6xl sm:leading-[0.96] md:text-7xl lg:text-8xl xl:text-[7.4rem]"
          >
            <span className="block text-[#B76E79]">Prepare Smarter</span>
            <span className="block text-[#1E1E2E]">for IELTS.</span>
          </h1>
          <p className="max-w-2xl font-lora text-base font-semibold leading-[1.7] text-[#6B7280] sm:max-w-3xl sm:text-lg sm:leading-relaxed md:text-xl">
            Practice listening, speaking, reading, and writing with realistic
            tests and instant AI feedback.
          </p>
          <BfHeroActions />
        </div>
      </div>
    </section>
  );
}
