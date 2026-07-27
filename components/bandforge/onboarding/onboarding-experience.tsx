"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  Check,
  Globe,
  GraduationCap,
  TrendingUp,
} from "lucide-react";
import { BfBrandBars } from "@/components/bandforge/bf-brand-bars";
import { BfStepIndicator } from "@/components/bandforge/ui";
import {
  BRAND_ONBOARDING_LANGUAGES,
  BRAND_ONBOARDING_STEPS,
} from "@/lib/brand-mock-data";
import { readDiagnosticResults } from "@/lib/diagnostic-session";
import { cn } from "@/lib/utils";

const BAND_OPTIONS = [5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5] as const;

const PURPOSE_OPTIONS = [
  {
    title: "Immigration / PR",
    sub: "Australia, Canada, UK, NZ",
    Icon: Globe,
  },
  {
    title: "University Admission",
    sub: "Undergraduate or postgraduate",
    Icon: GraduationCap,
  },
  {
    title: "Professional Registration",
    sub: "Nursing, teaching, engineering",
    Icon: Briefcase,
  },
  {
    title: "General Improvement",
    sub: "Overall English proficiency",
    Icon: TrendingUp,
  },
] as const;

const DATE_OPTIONS = [
  "I have a test date booked",
  "I'm planning to test in 1–3 months",
  "I haven't decided yet",
] as const;

const SIDEBAR_COPY: Record<number, { title: string; body: string }> = {
  1: {
    title: "Let's set up your study plan.",
    body: "Four quick questions, then your personalised dashboard.",
  },
  2: {
    title: "Let's set up your study plan.",
    body: "Four quick questions, then your personalised dashboard.",
  },
  3: {
    title: "Let's set up your study plan.",
    body: "Four quick questions, then your personalised dashboard.",
  },
  4: {
    title: "Almost there.",
    body: "One last question — then your dashboard awaits.",
  },
};

function MobileStepDots({ step }: { step: number }) {
  return (
    <div className="mb-8 flex items-center justify-center gap-2 lg:hidden">
      {[1, 2, 3, 4].map((n) => (
        <span
          key={n}
          className={cn(
            "h-2 rounded-full transition-all",
            n === step ? "w-6 bg-cyan" : "w-2 bg-border-muted",
          )}
          aria-hidden
        />
      ))}
    </div>
  );
}

export function OnboardingExperience() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [targetBand, setTargetBand] = useState<number>(7);
  const [purpose, setPurpose] = useState<string>(PURPOSE_OPTIONS[0].title);
  const [testDate, setTestDate] = useState<string>(DATE_OPTIONS[0]);
  const [testDay, setTestDay] = useState("15");
  const [testMonth, setTestMonth] = useState("Aug");
  const [testYear, setTestYear] = useState("2026");
  const [language, setLanguage] = useState<string>(BRAND_ONBOARDING_LANGUAGES[0]);

  const sidebar = SIDEBAR_COPY[step] ?? SIDEBAR_COPY[1];

  const goNext = () => {
    if (step >= 4) {
      // Diagnostic-first: finish onboarding → diagnostic unless guest already has results
      const hasLocalResults = Boolean(readDiagnosticResults());
      router.push(hasLocalResults ? "/diagnostic/results#plan-unlock" : "/diagnostic");
      return;
    }
    setStep((s) => s + 1);
  };

  const goBack = () => setStep((s) => Math.max(1, s - 1));

  return (
    <div className="flex min-h-dvh flex-col bg-[#11151c] lg:flex-row">
      <aside className="hidden flex-col bg-navy bg-[radial-gradient(420px_280px_at_20%_100%,rgb(0_151_167/0.26),transparent_70%)] px-8 py-10 lg:flex lg:w-[420px] lg:shrink-0 lg:px-11 lg:py-12">
        <div className="mb-12 flex items-center gap-2.5">
          <BfBrandBars size="lg" />
          <span className="font-display text-[1.375rem] font-bold tracking-tight">
            <span className="text-white">Band</span>
            <span className="text-cyan">Forge</span>
          </span>
        </div>
        <h1 className="font-display text-[1.875rem] leading-[1.16] font-bold tracking-tight text-white">
          {sidebar.title}
        </h1>
        <p className="mt-3.5 text-[0.9375rem] leading-relaxed text-slate">
          {sidebar.body}
        </p>
        <div className="mt-10">
          <BfStepIndicator
            layout="vertical"
            activeStep={step}
            steps={BRAND_ONBOARDING_STEPS.map((s) => ({
              n: s.id,
              title: s.label,
            }))}
          />
        </div>
        <p className="mt-auto pt-10 font-mono text-xs text-[#54647c]">
          Step {step} of 4
        </p>
      </aside>

      <main className="flex flex-1 flex-col bg-white px-6 py-10 sm:px-12 lg:px-[4.5rem] lg:py-16">
        <div className="mb-6 flex items-center gap-2.5 lg:hidden">
          <BfBrandBars size="sm" />
          <span className="font-display text-lg font-bold tracking-tight text-navy">
            Band<span className="text-cyan">Forge</span>
          </span>
        </div>
        <MobileStepDots step={step} />

        {step === 1 ? (
          <>
            <p className="font-mono text-xs tracking-[0.14em] text-cyan uppercase">
              Question 1
            </p>
            <h2 className="font-display mt-4 max-w-[18ch] text-3xl leading-[1.06] font-bold tracking-[-0.03em] text-navy sm:text-[2.625rem]">
              What band score are you aiming for?
            </h2>
            <p className="mt-3.5 max-w-[48ch] text-[1.0625rem] leading-relaxed text-muted">
              We&apos;ll build your study plan around this target.
            </p>
            <div className="mt-8 grid max-w-xl grid-cols-4 gap-3">
              {BAND_OPTIONS.map((band) => (
                <button
                  key={band}
                  type="button"
                  onClick={() => setTargetBand(band)}
                  className={cn(
                    "rounded-[0.875rem] py-6 font-mono text-[1.625rem] transition-colors",
                    targetBand === band
                      ? "bg-cyan text-white shadow-[0_10px_24px_rgb(0_151_167/0.28)]"
                      : "border border-border-muted text-navy hover:border-cyan/50",
                  )}
                >
                  {band.toFixed(1)}
                </button>
              ))}
            </div>
            <p className="mt-6 max-w-xl rounded-xl bg-[#f4f8f9] px-5 py-4 text-sm leading-relaxed text-muted">
              Most BandForge students target Band 6.5 or 7.0 for immigration or
              university admission.
            </p>
          </>
        ) : null}

        {step === 2 ? (
          <>
            <p className="font-mono text-xs tracking-[0.14em] text-cyan uppercase">
              Question 2
            </p>
            <h2 className="font-display mt-4 max-w-[16ch] text-3xl leading-[1.06] font-bold tracking-[-0.03em] text-navy sm:text-[2.625rem]">
              Why are you taking the IELTS?
            </h2>
            <p className="mt-3.5 max-w-[48ch] text-[1.0625rem] leading-relaxed text-muted">
              This helps us prioritise what matters most in your preparation.
            </p>
            <div className="mt-8 grid max-w-2xl gap-3 sm:grid-cols-2">
              {PURPOSE_OPTIONS.map((opt) => {
                const selected = purpose === opt.title;
                return (
                  <button
                    key={opt.title}
                    type="button"
                    onClick={() => setPurpose(opt.title)}
                    className={cn(
                      "relative rounded-[0.875rem] border p-5 text-left transition-colors",
                      selected
                        ? "border-cyan border-l-4 bg-cyan-soft"
                        : "border-border-muted hover:border-cyan/40",
                    )}
                  >
                    {selected ? (
                      <span className="absolute top-4 right-4 flex size-5 items-center justify-center rounded-full bg-cyan text-white">
                        <Check className="size-3" strokeWidth={3} />
                      </span>
                    ) : null}
                    <opt.Icon className="mb-3 size-5 text-cyan" strokeWidth={2} />
                    <p className="font-semibold text-navy">{opt.title}</p>
                    <p className="mt-0.5 text-[0.8125rem] text-muted">{opt.sub}</p>
                  </button>
                );
              })}
            </div>
          </>
        ) : null}

        {step === 3 ? (
          <>
            <p className="font-mono text-xs tracking-[0.14em] text-cyan uppercase">
              Question 3
            </p>
            <h2 className="font-display mt-4 max-w-[16ch] text-3xl leading-[1.06] font-bold tracking-[-0.03em] text-navy sm:text-[2.625rem]">
              When is your IELTS test?
            </h2>
            <p className="mt-3.5 max-w-[48ch] text-[1.0625rem] leading-relaxed text-muted">
              We&apos;ll build a day-by-day study plan that fits your timeline.
            </p>
            <div className="mt-8 flex max-w-xl flex-col gap-3">
              {DATE_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setTestDate(opt)}
                  className={cn(
                    "rounded-[0.875rem] border px-5 py-5 text-left font-semibold text-navy transition-colors",
                    testDate === opt
                      ? "border-cyan bg-cyan-soft"
                      : "border-border-muted hover:border-cyan/40",
                  )}
                >
                  {opt}
                </button>
              ))}
            </div>
            {testDate === DATE_OPTIONS[0] ? (
              <div className="mt-5 flex max-w-xl flex-wrap gap-3">
                <select
                  value={testDay}
                  onChange={(e) => setTestDay(e.target.value)}
                  className="rounded-lg border border-border-muted px-4 py-2.5 text-sm text-navy"
                  aria-label="Test day"
                >
                  {Array.from({ length: 31 }, (_, i) => String(i + 1)).map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
                <select
                  value={testMonth}
                  onChange={(e) => setTestMonth(e.target.value)}
                  className="rounded-lg border border-border-muted px-4 py-2.5 text-sm text-navy"
                  aria-label="Test month"
                >
                  {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
                <select
                  value={testYear}
                  onChange={(e) => setTestYear(e.target.value)}
                  className="rounded-lg border border-border-muted px-4 py-2.5 text-sm text-navy"
                  aria-label="Test year"
                >
                  {["2026", "2027"].map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}
            <p className="mt-6 max-w-xl rounded-xl border border-cyan/20 bg-cyan-soft/50 px-5 py-4 text-sm leading-relaxed text-muted">
              Tip: Students with 8+ weeks before their test see the biggest band
              gains with BandForge&apos;s structured plan.
            </p>
          </>
        ) : null}

        {step === 4 ? (
          <>
            <p className="font-mono text-xs tracking-[0.14em] text-cyan uppercase">
              Question 4
            </p>
            <h2 className="font-display mt-4 max-w-[16ch] text-3xl leading-[1.06] font-bold tracking-[-0.03em] text-navy sm:text-[2.625rem]">
              What is your native language?
            </h2>
            <p className="mt-3.5 max-w-[48ch] text-[1.0625rem] leading-relaxed text-muted">
              We&apos;ll tailor explanations and examples to your background.
            </p>
            <div className="mt-8 grid max-w-xl grid-cols-2 gap-3 sm:grid-cols-3">
              {BRAND_ONBOARDING_LANGUAGES.map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => setLanguage(lang)}
                  className={cn(
                    "rounded-[0.875rem] border py-4 font-medium transition-colors",
                    language === lang
                      ? "border-cyan bg-cyan text-white"
                      : "border-border-muted text-navy hover:border-cyan/40",
                  )}
                >
                  {lang}
                </button>
              ))}
            </div>
            <p className="mt-6 max-w-xl text-sm leading-relaxed text-muted-light">
              BandForge is optimised for South Asian English speakers. Platform
              language for instructions remains English.
            </p>
          </>
        ) : null}

        <div className="mt-auto flex items-center justify-between pt-10">
          {step > 1 ? (
            <button
              type="button"
              onClick={goBack}
              className="text-[0.9375rem] text-muted-light hover:text-muted"
            >
              ← Back
            </button>
          ) : (
            <span />
          )}
          <button
            type="button"
            onClick={goNext}
            className="inline-flex items-center gap-2.5 rounded-full bg-cyan px-10 py-4 font-display text-[1.0625rem] font-semibold text-white shadow-[0_12px_28px_rgb(0_151_167/0.26)] transition-colors hover:bg-brand-sky-hover"
          >
            {step === 4 ? "Go to My Dashboard" : "Continue"}
            <span aria-hidden>→</span>
          </button>
        </div>
      </main>
    </div>
  );
}
