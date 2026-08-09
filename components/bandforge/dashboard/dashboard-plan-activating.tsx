"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DashboardPlanPaywall } from "@/components/bandforge/dashboard/dashboard-plan-paywall";
import { hasFullSkillProgram } from "@/lib/entitlement";
import {
  clearCheckoutReceiptContext,
  getSubscription,
  readCheckoutReceiptContext,
} from "@/lib/payments";

const POLL_ATTEMPTS = 10;
const POLL_MS = 2000;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

type Props = {
  hasDiagnostic: boolean;
  subscriptionUnknown: boolean;
};

/**
 * After checkout, do not flash the Unlock paywall while entitlement catches up.
 * Polls subscription then refreshes RSC. True unpaid (no receipt / not activating)
 * still sees the normal paywall.
 */
export function DashboardUnlockGate({
  hasDiagnostic,
  subscriptionUnknown,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activatingParam = searchParams.get("activating") === "1";
  const [shouldActivate, setShouldActivate] = useState(
    hasDiagnostic && (subscriptionUnknown || activatingParam),
  );
  const [timedOut, setTimedOut] = useState(false);
  const startedRef = useRef(false);

  useEffect(() => {
    const hasReceipt = Boolean(readCheckoutReceiptContext());
    setShouldActivate(
      hasDiagnostic && (subscriptionUnknown || activatingParam || hasReceipt),
    );
  }, [hasDiagnostic, subscriptionUnknown, activatingParam]);

  const pollUntilUnlocked = useCallback(async (): Promise<boolean> => {
    for (let i = 0; i < POLL_ATTEMPTS; i++) {
      try {
        const sub = await getSubscription();
        if (hasFullSkillProgram(sub)) {
          clearCheckoutReceiptContext();
          router.refresh();
          return true;
        }
      } catch {
        /* keep polling */
      }
      await sleep(POLL_MS);
    }
    return false;
  }, [router]);

  useEffect(() => {
    if (!shouldActivate || startedRef.current) return;
    startedRef.current = true;
    void (async () => {
      const ok = await pollUntilUnlocked();
      if (!ok) setTimedOut(true);
    })();
  }, [shouldActivate, pollUntilUnlocked]);

  const handleRetry = () => {
    setTimedOut(false);
    startedRef.current = true;
    void (async () => {
      const ok = await pollUntilUnlocked();
      if (!ok) setTimedOut(true);
    })();
  };

  if (!hasDiagnostic) {
    return <DashboardPlanPaywall hasDiagnostic={false} />;
  }

  if (!shouldActivate) {
    return <DashboardPlanPaywall hasDiagnostic />;
  }

  return (
    <section className="relative overflow-hidden rounded-[22px] border border-[#E2EAF2] bg-[linear-gradient(165deg,#F7FBFD_0%,#FFFFFF_42%,#EEF9FB_100%)] px-5 py-10 sm:px-10 sm:py-12">
      <div
        className="pointer-events-none absolute -top-24 right-[-10%] size-[280px] rounded-full bg-[radial-gradient(circle,rgba(0,169,192,0.18)_0%,transparent_70%)]"
        aria-hidden
      />
      <div className="relative mx-auto flex max-w-xl flex-col items-center text-center">
        <p className="text-[11px] font-semibold tracking-[0.14em] text-cyan uppercase">
          Activating
        </p>
        <h2 className="mt-3 font-display text-[1.75rem] leading-[1.12] font-bold tracking-[-0.03em] text-[#0D1F3C] sm:text-[2.125rem]">
          Activating your Full Skill Program
        </h2>
        <p className="mt-3 max-w-[36ch] text-[15px] leading-relaxed text-[#5A6B82] sm:text-base">
          Payment received. Unlocking your personalised dashboard…
        </p>
        {timedOut ? (
          <button
            type="button"
            onClick={handleRetry}
            className="mt-8 inline-flex h-12 cursor-pointer items-center justify-center rounded-full bg-cyan px-7 text-[0.9375rem] font-semibold text-white shadow-[0_10px_24px_rgb(0_151_167/0.28)] transition-[background-color,transform] duration-200 hover:-translate-y-px hover:bg-brand-sky-hover"
          >
            Retry
          </button>
        ) : (
          <p className="mt-8 text-[13px] text-[#5A6B82]" aria-live="polite">
            This usually takes a few seconds.
          </p>
        )}
      </div>
    </section>
  );
}
