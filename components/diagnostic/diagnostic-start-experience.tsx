"use client";

import { ArrowLeft, ArrowRight, Check, Shield, GraduationCap, ClipboardCheck, Headphones } from "lucide-react";
import { gsap } from "gsap";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { DiagnosticSplitShell, type SplitShellStep } from "@/components/diagnostic/diagnostic-split-shell";
import { ExamDatePicker } from "@/components/diagnostic/ui/exam-date-picker";
import { diagnosticPaths } from "@/lib/diagnostic-catalog";
import {
  isValidIndiaPhone,
  normalizeIndiaPhone,
  minExamDateIso,
  isLeadComplete,
  isValidFutureExamDate,
  readDiagnosticLead,
  saveDiagnosticLead,
  fallbackExamDate,
  purposeToGoal,
  DIAGNOSTIC_PURPOSE_OPTIONS,
  NATIVE_LANGUAGE_OPTIONS,
  type DiagnosticLead,
  type DiagnosticPurposeId,
  type DiagnosticTestDateOption,
  type DiagnosticNativeLanguage,
} from "@/lib/diagnostic-lead";
import {
  clearDiagnosticAttempt,
  createDiagnosticAttempt,
  hasInProgressDiagnostic,
  isListeningPrepComplete,
  readDiagnosticProgress,
} from "@/lib/diagnostic-storage";
import { getSubscription } from "@/lib/payments";
import { hasFullSkillProgram } from "@/lib/entitlement";
import { cn } from "@/lib/utils";

const ONBOARDING_STEPS: SplitShellStep[] = [
  { id: "name", label: "Your details" },
  { id: "band", label: "Target band" },
  { id: "purpose", label: "Purpose" },
  { id: "date", label: "Test date" },
  { id: "language", label: "Native language" },
];

const BAND_OPTIONS = [5.0, 5.5, 6.0, 6.5, 7.0, 7.5, 8.0, 8.5];

const PURPOSE_ICONS: Record<DiagnosticPurposeId, typeof Shield> = {
  immigration: Shield,
  university: GraduationCap,
  professional: ClipboardCheck,
  general: Headphones,
};

function WhatsAppIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="#25D366" aria-hidden>
      <path d="M12 2a10 10 0 0 0-8.6 15l-1.3 4.8 4.9-1.3A10 10 0 1 0 12 2zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .1-1.7-.1-.4-.1-1-.3-1.6-.6-2.9-1.2-4.7-4.1-4.9-4.3-.1-.2-1.1-1.5-1.1-2.8s.7-2 .9-2.2c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 1.9c.1.2.1.3 0 .5l-.4.6c-.2.2-.3.4-.1.6.1.3.7 1.1 1.5 1.7 1 .9 1.8 1.1 2 1.2.2.1.4.1.5-.1l.6-.8c.2-.2.4-.2.6-.1l1.8.9c.2.1.4.2.4.3.1.1.1.5-.1 1z" />
    </svg>
  );
}

function InfoTip({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-[11px] rounded-[12px] bg-[#F4F8F9] p-4">
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#00BCD4"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="mt-0.5 shrink-0"
        aria-hidden
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 16v-4M12 8h.01" />
      </svg>
      <p className="text-[14px] leading-[1.45] text-[#5A6B82]">{children}</p>
    </div>
  );
}

export function DiagnosticStartExperience() {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const contentRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [canContinue, setCanContinue] = useState(false);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [targetBand, setTargetBand] = useState<number | null>(null);
  const [purpose, setPurpose] = useState<DiagnosticPurposeId | null>(null);
  const [testDateOption, setTestDateOption] = useState<DiagnosticTestDateOption | null>(null);
  const [examDate, setExamDate] = useState("");
  const [nativeLanguage, setNativeLanguage] = useState<DiagnosticNativeLanguage | null>(null);

  useEffect(() => {
    const lead = readDiagnosticLead();
    if (lead) {
      setFullName(lead.fullName);
      setPhone(lead.phone);
      setTargetBand(lead.targetBand);
      if (lead.purpose) setPurpose(lead.purpose);
      if (lead.testDateOption) setTestDateOption(lead.testDateOption);
      if (lead.examDate) setExamDate(lead.examDate);
      if (lead.nativeLanguage) setNativeLanguage(lead.nativeLanguage);
    }
    setCanContinue(hasInProgressDiagnostic());
  }, []);

  useEffect(() => {
    let cancelled = false;
    const check = async () => {
      try {
        const sub = await getSubscription();
        if (!cancelled && hasFullSkillProgram(sub)) router.replace("/dashboard");
      } catch { /* guest or offline */ }
    };
    if (typeof requestAnimationFrame === "function") {
      const frame = requestAnimationFrame(() => void check());
      return () => { cancelled = true; cancelAnimationFrame(frame); };
    }
    void check();
    return () => { cancelled = true; };
  }, [router]);

  const stepValid = (): boolean => {
    switch (step) {
      case 0: return Boolean(fullName.trim()) && isValidIndiaPhone(phone);
      case 1: return targetBand != null;
      case 2: return purpose != null;
      case 3:
        if (testDateOption == null) return false;
        if (testDateOption === "booked") return isValidFutureExamDate(examDate);
        return true;
      case 4: return nativeLanguage != null;
      default: return false;
    }
  };

  const buildLead = (): DiagnosticLead => {
    const goalInfo = purpose ? purposeToGoal(purpose) : { goal: "other" as const, goalLabel: "Other" };
    const finalExamDate = testDateOption === "booked" ? examDate : fallbackExamDate(testDateOption ?? "undecided");
    return {
      fullName: fullName.trim(),
      phone,
      goal: goalInfo.goal,
      goalLabel: goalInfo.goalLabel,
      targetBand: targetBand ?? 7.0,
      examDate: finalExamDate,
      purpose: purpose ?? undefined,
      testDateOption: testDateOption ?? undefined,
      nativeLanguage: nativeLanguage ?? undefined,
    };
  };

  const goToCurrentModule = () => {
    const progress = readDiagnosticProgress();
    const currentModule = progress?.currentModule ?? "listening";
    if (currentModule === "listening" && !isListeningPrepComplete(progress)) {
      router.replace(diagnosticPaths.listeningPrep);
      return;
    }
    router.replace(diagnosticPaths[currentModule]);
  };

  const persistAndStart = () => {
    const lead = buildLead();
    if (!isLeadComplete(lead)) return;
    saveDiagnosticLead(lead);
    clearDiagnosticAttempt();
    createDiagnosticAttempt();
    router.replace(diagnosticPaths.listeningPrep);
  };

  const handleNext = () => {
    if (!stepValid()) return;
    if (step < 4) {
      setStep(step + 1);
    } else {
      setBusy(true);
      persistAndStart();
    }
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleContinueDiagnostic = () => {
    setBusy(true);
    const lead = buildLead();
    if (isLeadComplete(lead)) saveDiagnosticLead(lead);
    goToCurrentModule();
  };

  const handleStartOver = () => {
    setBusy(true);
    persistAndStart();
  };

  const heading = step === 4 ? "Almost there." : "Let\u2019s set up your study plan.";
  const subtitle =
    step === 4
      ? "One last question, then your free diagnostic test is ready."
      : "Five quick questions, then your free diagnostic test.";

  useEffect(() => {
    const root = contentRef.current;
    if (!root || step !== 4) return;

    const bits = root.querySelectorAll<HTMLElement>("[data-last-reveal]");
    if (!bits.length) return;

    const ctx = gsap.context(() => {
      if (reduceMotion) {
        gsap.set(bits, { clearProps: "opacity,transform,filter" });
        return;
      }
      gsap.set(bits, { opacity: 0, y: 22, filter: "blur(10px)" });
      gsap.to(bits, {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        duration: 0.65,
        stagger: 0.09,
        ease: "power3.out",
        delay: 0.08,
      });
    }, root);

    return () => ctx.revert();
  }, [step, reduceMotion, canContinue]);

  return (
    <DiagnosticSplitShell
      steps={ONBOARDING_STEPS}
      currentStep={step}
      heading={heading}
      subtitle={subtitle}
      variant="onboarding"
    >
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        <div className="flex min-h-full flex-1 flex-col px-5 py-8 sm:px-10 sm:py-10 lg:px-[64px] lg:py-14">
          {/* Eyebrow */}
          <p className="font-mono text-[12px] tracking-[0.14em] text-cyan uppercase">
            Question {step + 1}
          </p>

          {/* Step content */}
          <div ref={contentRef} className="mt-[18px] flex flex-1 flex-col">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={step}
                initial={
                  reduceMotion || step === 4
                    ? false
                    : { opacity: 0, y: 16, filter: "blur(6px)" }
                }
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={
                  reduceMotion
                    ? undefined
                    : { opacity: 0, y: -12, filter: "blur(6px)" }
                }
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-1 flex-col"
              >
                {step === 0 && (
                  <StepNamePhone
                    fullName={fullName}
                    phone={phone}
                    onNameChange={setFullName}
                    onPhoneChange={(v) => setPhone(normalizeIndiaPhone(v))}
                  />
                )}
                {step === 1 && (
                  <StepTargetBand value={targetBand} onChange={setTargetBand} />
                )}
                {step === 2 && (
                  <StepPurpose value={purpose} onChange={setPurpose} />
                )}
                {step === 3 && (
                  <StepTestDate
                    option={testDateOption}
                    examDate={examDate}
                    onOptionChange={setTestDateOption}
                    onExamDateChange={setExamDate}
                  />
                )}
                {step === 4 && (
                  <StepNativeLanguage
                    value={nativeLanguage}
                    onChange={setNativeLanguage}
                    canContinue={canContinue}
                    onContinueDiagnostic={handleContinueDiagnostic}
                    onStartOver={handleStartOver}
                    busy={busy}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer nav */}
          <div className="mt-auto flex items-center justify-between pt-8">
            {step > 0 ? (
              <button
                type="button"
                onClick={handleBack}
                className="cursor-pointer text-[15px] text-[#8A99AC] transition-colors hover:text-navy"
              >
                <ArrowLeft className="mr-1 inline size-4" aria-hidden />
                Back
              </button>
            ) : (
              <div />
            )}
            <button
              type="button"
              disabled={!stepValid() || busy}
              onClick={handleNext}
              className="inline-flex cursor-pointer items-center gap-[10px] rounded-full px-10 py-4 font-display text-[17px] font-semibold text-white shadow-[0_14px_32px_rgba(0,151,167,0.32)] transition-[filter,transform] hover:brightness-105 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
              style={{
                background: "linear-gradient(135deg, #4DD0E1 0%, #00BCD4 42%, #00838F 100%)",
              }}
            >
              {step === 4
                ? busy
                  ? "Starting\u2026"
                  : "Begin Diagnostic"
                : "Continue"}
              <ArrowRight className="size-[17px]" aria-hidden />
            </button>
          </div>
        </div>
      </div>
    </DiagnosticSplitShell>
  );
}

/* ─── Step 1: Name + Phone ─── */

function StepNamePhone({
  fullName,
  phone,
  onNameChange,
  onPhoneChange,
}: {
  fullName: string;
  phone: string;
  onNameChange: (v: string) => void;
  onPhoneChange: (v: string) => void;
}) {
  return (
    <>
      <h2 className="font-display text-[32px] leading-[1.06] font-bold tracking-[-0.03em] text-[#0D1F3C] sm:text-[42px]">
        What&apos;s your name and number?
      </h2>
      <p className="mt-[14px] max-w-[48ch] text-[17px] leading-[1.55] text-[#5A6B82]">
        We&apos;ll send your diagnostic results via WhatsApp.
      </p>
      <div className="mt-10 flex max-w-[560px] flex-col gap-5">
        <div>
          <label htmlFor="onb-name" className="mb-2 block text-[14px] font-medium text-[#0D1F3C]">
            Full name
          </label>
          <input
            id="onb-name"
            type="text"
            value={fullName}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="Your full name"
            className="h-[50px] w-full rounded-[14px] border-[1.5px] border-[#D5DCE6] bg-white px-4 text-[16px] text-[#0D1F3C] outline-none transition-colors placeholder:text-[#9AA7B8] focus:border-cyan focus:ring-2 focus:ring-cyan/20"
          />
        </div>
        <div>
          <label htmlFor="onb-phone" className="mb-2 block text-[14px] font-medium text-[#0D1F3C]">
            WhatsApp number
          </label>
          <div className="flex h-[50px] items-center gap-3 rounded-[14px] border-[1.5px] border-[#D5DCE6] bg-white px-4">
            <span className="inline-flex items-center gap-2 border-r border-[#E6EBF1] pr-3 text-[15px] font-medium text-[#0D1F3C]">
              <WhatsAppIcon />
              +91
            </span>
            <input
              id="onb-phone"
              type="tel"
              inputMode="numeric"
              value={phone}
              onChange={(e) => onPhoneChange(e.target.value)}
              placeholder="98765 43210"
              maxLength={10}
              className="min-w-0 flex-1 bg-transparent text-[16px] text-[#0D1F3C] outline-none placeholder:text-[#9AA7B8]"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <WhatsAppIcon />
          <span className="text-[13px] text-[#5A6B82]">
            We&apos;ll send your results to this WhatsApp number.
          </span>
        </div>
      </div>
    </>
  );
}

/* ─── Step 2: Target Band ─── */

function StepTargetBand({
  value,
  onChange,
}: {
  value: number | null;
  onChange: (v: number) => void;
}) {
  return (
    <>
      <h2 className="max-w-[18ch] font-display text-[32px] leading-[1.06] font-bold tracking-[-0.03em] text-[#0D1F3C] sm:text-[42px]">
        What band score are you aiming for?
      </h2>
      <p className="mt-[14px] max-w-[48ch] text-[17px] leading-[1.55] text-[#5A6B82]">
        We&apos;ll build your diagnostic and study plan around this target.
      </p>
      <div className="mt-10 grid max-w-[560px] grid-cols-4 gap-[14px]">
        {BAND_OPTIONS.map((band) => {
          const selected = value === band;
          return (
            <button
              key={band}
              type="button"
              onClick={() => onChange(band)}
              className={cn(
                "cursor-pointer rounded-[14px] py-6 text-center font-mono text-[26px] transition-all",
                selected
                  ? "border-transparent text-white shadow-[0_12px_28px_rgba(0,151,167,0.32)]"
                  : "border-[1.5px] border-[#D5DCE6] text-[#0D1F3C] hover:border-cyan/40",
              )}
              style={
                selected
                  ? {
                      background:
                        "linear-gradient(145deg, #26C6DA 0%, #00ACC1 48%, #00838F 100%)",
                    }
                  : undefined
              }
            >
              {band.toFixed(1)}
            </button>
          );
        })}
      </div>
      <div className="mt-[26px] max-w-[560px]">
        <InfoTip>
          Most BandForge students target Band 6.5 or 7.0 for immigration or university admission.
        </InfoTip>
      </div>
    </>
  );
}

/* ─── Step 3: Purpose ─── */

function StepPurpose({
  value,
  onChange,
}: {
  value: DiagnosticPurposeId | null;
  onChange: (v: DiagnosticPurposeId) => void;
}) {
  return (
    <>
      <h2 className="max-w-[16ch] font-display text-[32px] leading-[1.06] font-bold tracking-[-0.03em] text-[#0D1F3C] sm:text-[42px]">
        Why are you taking the IELTS?
      </h2>
      <p className="mt-[14px] max-w-[48ch] text-[17px] leading-[1.55] text-[#5A6B82]">
        This helps us prioritise what matters most in your preparation.
      </p>
      <div className="mt-9 grid max-w-[680px] grid-cols-1 gap-[14px] sm:grid-cols-2">
        {DIAGNOSTIC_PURPOSE_OPTIONS.map((opt) => {
          const selected = value === opt.id;
          const Icon = PURPOSE_ICONS[opt.id];
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onChange(opt.id)}
              className={cn(
                "flex cursor-pointer items-center gap-[14px] rounded-[14px] p-5 text-left transition-all",
                selected
                  ? "border-[1.5px] border-cyan border-l-4 bg-[#F0FAFB]"
                  : "border-[1.5px] border-[#D5DCE6] hover:border-cyan/40",
              )}
            >
              <div
                className={cn(
                  "flex size-11 shrink-0 items-center justify-center rounded-[11px]",
                  selected ? "bg-[#D9F2F5]" : "bg-[#F1F5F9]",
                )}
              >
                <Icon className="size-6 text-cyan" strokeWidth={2} aria-hidden />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[16px] font-semibold text-[#0D1F3C]">{opt.label}</p>
                <p className="mt-0.5 text-[13px] text-[#5A6B82]">{opt.subtitle}</p>
              </div>
              {selected ? (
                <div className="flex size-[22px] shrink-0 items-center justify-center rounded-full bg-cyan">
                  <Check className="size-[13px] text-white" strokeWidth={3} aria-hidden />
                </div>
              ) : null}
            </button>
          );
        })}
      </div>
    </>
  );
}

/* ─── Step 4: Test Date ─── */

function StepTestDate({
  option,
  examDate,
  onOptionChange,
  onExamDateChange,
}: {
  option: DiagnosticTestDateOption | null;
  examDate: string;
  onOptionChange: (v: DiagnosticTestDateOption) => void;
  onExamDateChange: (v: string) => void;
}) {
  const options: { id: DiagnosticTestDateOption; label: string }[] = [
    { id: "booked", label: "I have a test date booked" },
    { id: "1-3_months", label: "I\u2019m planning to test in 1\u20133 months" },
    { id: "undecided", label: "I haven\u2019t decided yet" },
  ];

  return (
    <>
      <h2 className="max-w-[16ch] font-display text-[32px] leading-[1.06] font-bold tracking-[-0.03em] text-[#0D1F3C] sm:text-[42px]">
        When is your IELTS test?
      </h2>
      <p className="mt-[14px] max-w-[48ch] text-[17px] leading-[1.55] text-[#5A6B82]">
        We&apos;ll build a day-by-day study plan that fits your timeline.
      </p>
      <div className="mt-9 flex max-w-[620px] flex-col gap-[14px]">
        {options.map((opt) => {
          const selected = option === opt.id;
          return (
            <div
              key={opt.id}
              className={cn(
                "rounded-[14px] transition-all",
                selected
                  ? "border-[1.5px] border-cyan bg-[#F0FAFB]"
                  : "border-[1.5px] border-[#D5DCE6] hover:border-cyan/40",
              )}
            >
              <button
                type="button"
                onClick={() => onOptionChange(opt.id)}
                className="flex w-full cursor-pointer items-center gap-[14px] p-5 text-left"
              >
                <div
                  className={cn(
                    "size-5 shrink-0 rounded-full",
                    selected
                      ? "border-[6px] border-cyan"
                      : "border-[1.5px] border-[#C3CDDA]",
                  )}
                />
                <span className="text-[17px] font-semibold text-[#0D1F3C]">
                  {opt.label}
                </span>
              </button>
              {selected && opt.id === "booked" ? (
                <div className="flex justify-end px-5 pb-5">
                  <ExamDatePicker
                    value={examDate}
                    min={minExamDateIso()}
                    onChange={onExamDateChange}
                  />
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
      <div className="mt-6 max-w-[620px]">
        <InfoTip>
          Students with 8+ weeks of preparation time see the strongest band improvements.
        </InfoTip>
      </div>
    </>
  );
}

/* ─── Step 5: Native Language ─── */

function StepNativeLanguage({
  value,
  onChange,
  canContinue,
  onContinueDiagnostic,
  onStartOver,
  busy,
}: {
  value: DiagnosticNativeLanguage | null;
  onChange: (v: DiagnosticNativeLanguage) => void;
  canContinue: boolean;
  onContinueDiagnostic: () => void;
  onStartOver: () => void;
  busy: boolean;
}) {
  return (
    <>
      <h2
        data-last-reveal
        className="max-w-[16ch] font-display text-[32px] leading-[1.06] font-bold tracking-[-0.03em] text-[#0D1F3C] will-change-[transform,opacity,filter] sm:text-[42px]"
      >
        What is your native language?
      </h2>
      <p
        data-last-reveal
        className="mt-[14px] max-w-[50ch] text-[17px] leading-[1.55] text-[#5A6B82] will-change-[transform,opacity,filter]"
      >
        We use this to personalise tips, explanations, and study guidance for you.
      </p>
      <div
        data-last-reveal
        className="mt-10 grid max-w-[680px] grid-cols-2 gap-[13px] will-change-[transform,opacity,filter] sm:grid-cols-4"
      >
        {NATIVE_LANGUAGE_OPTIONS.map((lang) => {
          const selected = value === lang;
          const label = lang.charAt(0).toUpperCase() + lang.slice(1);
          return (
            <button
              key={lang}
              type="button"
              onClick={() => onChange(lang)}
              className={cn(
                "cursor-pointer rounded-[13px] py-[18px] text-center text-[16px] font-semibold transition-all",
                selected
                  ? "border-transparent text-white shadow-[0_10px_24px_rgba(0,151,167,0.3)]"
                  : "border-[1.5px] border-[#D5DCE6] text-[#0D1F3C] hover:border-cyan/40",
              )}
              style={
                selected
                  ? {
                      background:
                        "linear-gradient(145deg, #26C6DA 0%, #00ACC1 48%, #00838F 100%)",
                    }
                  : undefined
              }
            >
              {label}
            </button>
          );
        })}
      </div>
      <p
        data-last-reveal
        className="mt-5 max-w-[600px] text-[14px] leading-[1.45] text-[#8A99AC] will-change-[transform,opacity,filter]"
      >
        Platform interface is in English. Native language support is used for tips and explanations only.
      </p>

      {canContinue ? (
        <div
          data-last-reveal
          className="mt-8 flex max-w-[560px] flex-col gap-3 will-change-[transform,opacity,filter]"
        >
          <button
            type="button"
            disabled={busy}
            onClick={onContinueDiagnostic}
            className="flex h-[50px] w-full cursor-pointer items-center justify-center gap-2 rounded-[14px] font-display text-[15px] font-semibold text-white shadow-[0_10px_24px_rgba(0,151,167,0.28)] transition-[filter] hover:brightness-105 disabled:opacity-50"
            style={{
              background: "linear-gradient(135deg, #4DD0E1 0%, #00BCD4 45%, #00838F 100%)",
            }}
          >
            Continue diagnostic
            <ArrowRight className="size-4" aria-hidden />
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={onStartOver}
            className="flex h-[44px] w-full cursor-pointer items-center justify-center rounded-[14px] border-[1.5px] border-[#D5DCE6] text-[14px] font-semibold text-[#0D1F3C] transition-colors hover:bg-[#F4F7FA] disabled:opacity-50"
          >
            Start over
          </button>
        </div>
      ) : null}
    </>
  );
}
