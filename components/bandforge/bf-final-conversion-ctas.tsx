"use client";

import Link from "next/link";
import { IconArrowRight } from "@/components/icons";
import { useAuthSession } from "@/components/auth/auth-session-provider";
import { useStartMockAuth } from "@/components/bandforge/auth/start-mock-auth-context";
import { isAuthEnabled } from "@/lib/flags";

export function BfFinalConversionCtas() {
  const { openStartMockModal } = useStartMockAuth();
  const { isAuthenticated, loading } = useAuthSession();
  const authOn = isAuthEnabled();

  const primaryClass =
    "group inline-flex min-h-[var(--spacing-touch)] w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-navy px-8 py-3.5 text-body font-semibold text-white shadow-[0_20px_60px_-28px_rgb(13_31_60_/_0.85)] transition-colors duration-200 hover:bg-navy/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2 sm:w-auto sm:min-w-[200px]";

  const showDashboard =
    !authOn || (!loading && isAuthenticated);

  return (
    <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:flex-wrap">
      {showDashboard ? (
        <Link href="/dashboard" className={primaryClass}>
          {authOn && isAuthenticated ? "Go to dashboard" : "Start free mock"}
          <IconArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none" />
        </Link>
      ) : (
        <button type="button" onClick={openStartMockModal} className={primaryClass}>
          Start free mock
          <IconArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none" />
        </button>
      )}
      <Link
        href="/contact?topic=beta"
        className="inline-flex min-h-[var(--spacing-touch)] w-full cursor-pointer items-center justify-center rounded-lg border border-transparent px-6 py-3.5 text-body font-semibold text-teal underline-offset-2 transition-colors duration-200 hover:text-teal-light sm:w-auto"
      >
        Join beta
      </Link>
    </div>
  );
}
