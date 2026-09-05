"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, Star } from "lucide-react";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { DiagnosticSplitShell } from "@/components/diagnostic/diagnostic-split-shell";
import { DIAGNOSTIC_EXAM_STEPS } from "@/components/diagnostic/diagnostic-exam-steps";
import { DiagnosticStagePanel } from "@/components/diagnostic/ui/diagnostic-stage-panel";
import { DiagnosticWaitState } from "@/components/diagnostic/ui/diagnostic-processing-loader";
import { TextType } from "@/components/ui/text-type";
import { useCountdown } from "@/hooks/use-countdown";
import { ensureSession, getMe, loginPathWithNext } from "@/lib/auth";
import { diagnosticPaths } from "@/lib/diagnostic-catalog";
import { isFullAccountUser } from "@/lib/diagnostic-lead-sync";
import {
  DIAGNOSTIC_TRANSITIONS,
  type DiagnosticTransitionSlug,
} from "@/lib/diagnostic-transitions";
import { hasInProgressDiagnostic } from "@/lib/diagnostic-storage";
import { planTimedTextType } from "@/lib/timed-text-type";
import { cn } from "@/lib/utils";

const SLUG_TO_STEP: Record<DiagnosticTransitionSlug, number> = {
  "listening-reading": 1,
  "reading-writing": 2,
  "writing-speaking": 3,
};

const BREATH =
  "Take a breath — you’re making steady progress through your diagnostic.";

const AUTH_GATE_COPY = "Sign in to continue & save your results";

type Props = {
  slug: DiagnosticTransitionSlug;
};

type AuthGateState = "loading" | "full" | "guest";

export function DiagnosticInterstitialExperience({ slug }: Props) {
  const router = useRouter();
  const config = DIAGNOSTIC_TRANSITIONS[slug];
  const needsAuthGate = slug === "reading-writing";
  const [authState, setAuthState] = useState<AuthGateState>(
    needsAuthGate ? "loading" : "full",
  );
  const countdownActive = !needsAuthGate || authState === "full";
  const remaining = useCountdown(
    countdownActive ? config.countdownSec : 0,
    countdownActive,
  );
  const canContinue = remaining === 0;
  const title = `${config.nextLabel} is next`;
  const quoteText = `“${config.quote}”`;

  const typePlan = useMemo(
    () =>
      planTimedTextType(
        [{ text: title }, { text: BREATH }, { text: quoteText }],
        config.countdownSec,
      ),
    [title, quoteText, config.countdownSec],
  );

  useEffect(() => {
    if (!hasInProgressDiagnostic()) {
      router.replace("/diagnostic");
    }
  }, [router]);

  useEffect(() => {
    if (!needsAuthGate) {
      setAuthState("full");
      return;
    }

    let cancelled = false;
    void (async () => {
      const session = await ensureSession({
        logoutOnUnauthorized: false,
      }).catch(() => null);
      const user = session ? await getMe().catch(() => null) : null;
      if (cancelled) return;
      setAuthState(
        session && isFullAccountUser(user?.role) ? "full" : "guest",
      );
    })();

    return () => {
      cancelled = true;
    };
  }, [needsAuthGate]);

  useEffect(() => {
    if (authState !== "full") return;
    if (remaining !== 0) return;
    router.replace(config.nextPath);
  }, [authState, remaining, router, config.nextPath]);

  if (needsAuthGate && authState === "loading") {
    return (
      <div className="flex min-h-dvh flex-col">
        <DiagnosticWaitState label="Checking sign-in" />
      </div>
    );
  }

  if (needsAuthGate && authState === "guest") {
    const writingLoginHref = loginPathWithNext(diagnosticPaths.writing);
    return (
      <DiagnosticSplitShell
        steps={DIAGNOSTIC_EXAM_STEPS}
        currentStep={SLUG_TO_STEP[slug]}
        heading="Reading complete"
        subtitle="Sign in to unlock Writing, Speaking, full results, and your plan."
        footerNote="Listening and Reading stay on this device until you sign in."
        fillViewport
      >
        <div
          className={cn(
            "relative flex min-h-0 flex-1 flex-col overflow-y-auto",
            "bg-[radial-gradient(120%_80%_at_50%_0%,#E6F7FA_0%,#FFFFFF_55%,#F7FBFC_100%)]",
          )}
        >
          <div className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
            <div className="rounded-2xl border border-[#D7E8EE] bg-white/90 p-5 shadow-[0_18px_40px_rgba(8,27,51,0.06)] backdrop-blur-sm sm:rounded-[20px] sm:p-8">
              <p className="font-mono text-[11px] font-semibold tracking-[0.16em] text-[#0097A7] uppercase">
                Almost there
              </p>
              <h2 className="mt-2.5 font-display text-[1.5rem] leading-[1.15] font-bold tracking-[-0.03em] text-[#0B1B33] sm:text-[1.85rem]">
                {AUTH_GATE_COPY}
              </h2>
              <p className="mt-3 text-[14px] leading-relaxed text-[#5A6B82] sm:text-[15px]">
                Create a free account to continue Writing and Speaking, see your
                full band results, and unlock your personalized plan.
              </p>

              <ul className="mt-5 flex flex-col gap-2" aria-label="What you unlock">
                <li className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#0E6E78]">
                  <Check className="size-3.5 shrink-0" strokeWidth={3} aria-hidden />
                  Writing and Speaking modules
                </li>
                <li className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#0E6E78]">
                  <Check className="size-3.5 shrink-0" strokeWidth={3} aria-hidden />
                  Full band results after the diagnostic
                </li>
                <li className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#0E6E78]">
                  <Check className="size-3.5 shrink-0" strokeWidth={3} aria-hidden />
                  Personalized study plan
                </li>
              </ul>

              <ul className="mt-5 flex flex-wrap gap-2" aria-label="Progress">
                <li className="inline-flex items-center gap-1.5 rounded-full bg-[#E6F7FA] px-2.5 py-1 text-[12px] font-semibold text-[#0E6E78]">
                  <Check className="size-3.5 shrink-0" strokeWidth={3} aria-hidden />
                  Listening
                </li>
                <li className="inline-flex items-center gap-1.5 rounded-full bg-[#E6F7FA] px-2.5 py-1 text-[12px] font-semibold text-[#0E6E78]">
                  <Check className="size-3.5 shrink-0" strokeWidth={3} aria-hidden />
                  Reading
                </li>
                <li className="inline-flex items-center gap-1.5 rounded-full border border-[#B6E9F0] bg-white px-2.5 py-1 text-[12px] font-semibold text-[#0B1B33]">
                  Writing next
                </li>
              </ul>

              <div className="mt-7 sm:mt-8">
                <GoogleSignInButton
                  next={diagnosticPaths.writing}
                  label="Continue with Google"
                />
              </div>
              <a
                href={writingLoginHref}
                className="mt-4 inline-flex cursor-pointer text-sm font-medium text-[#0B1B33]/70 underline-offset-4 transition-colors hover:text-[#0097A7] hover:underline"
              >
                Other sign-in options
              </a>
            </div>
          </div>
        </div>
      </DiagnosticSplitShell>
    );
  }

  return (
    <DiagnosticSplitShell
      steps={DIAGNOSTIC_EXAM_STEPS}
      currentStep={SLUG_TO_STEP[slug]}
      heading={config.completedLabel}
      subtitle={`${config.nextLabel} is next.`}
      footerNote={`${config.nextLabel} begins in ${remaining}s`}
      fillViewport
    >
      <DiagnosticStagePanel
        title={title}
        description={BREATH}
        remaining={remaining}
        totalSec={config.countdownSec}
        countdownLabel={`${config.nextLabel} begins in`}
        typeBudgetExtraTexts={[quoteText]}
        alwaysShowCta
        ctaLabel={
          canContinue ? (
            <>
              {config.ctaLabel}
              <ArrowRight className="size-4 shrink-0" aria-hidden />
            </>
          ) : (
            `Ready in ${remaining}s`
          )
        }
        ctaDisabled={!canContinue}
        onCta={() => router.replace(config.nextPath)}
      >
        <div className="rounded-[18px] border border-[#E8EEF4] bg-[#F8FBFC] p-5">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="rgba(0,188,212,0.2)"
            className="mb-3"
            aria-hidden
          >
            <path d="M7 7h4v4c0 2.2-1.4 3.7-3.5 4.2l-.5-1.4c1.1-.3 1.7-.9 1.8-1.8H7zm8 0h4v4c0 2.2-1.4 3.7-3.5 4.2l-.5-1.4c1.1-.3 1.7-.9 1.8-1.8H15z" />
          </svg>
          <TextType
            as="blockquote"
            text={quoteText}
            loop={false}
            typingSpeed={typePlan.typingSpeed}
            variableSpeed={typePlan.variableSpeed}
            initialDelay={typePlan.delays[2] ?? 0}
            showCursor
            cursorCharacter="|"
            cursorBlinkDuration={0.55}
            className="font-display text-[17px] leading-snug font-medium tracking-tight text-pretty text-navy sm:text-xl"
          />
          <div className="mt-4 flex items-center gap-2.5">
            <div
              className="flex size-10 items-center justify-center rounded-full font-display text-[14px] font-bold text-white"
              style={{
                background:
                  "linear-gradient(135deg, #4DD0E1 0%, #00BCD4 45%, #00838F 100%)",
              }}
            >
              {config.quoteInitials}
            </div>
            <div>
              <p className="text-sm font-semibold text-navy">
                {config.quoteAttribution}
              </p>
              <p className="font-mono text-[11.5px] text-[#6E83A0]">
                {config.quoteLocation}
              </p>
            </div>
          </div>
          <div className="mt-3.5 flex gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="size-4 fill-cyan text-cyan" aria-hidden />
            ))}
          </div>
        </div>
      </DiagnosticStagePanel>
    </DiagnosticSplitShell>
  );
}
