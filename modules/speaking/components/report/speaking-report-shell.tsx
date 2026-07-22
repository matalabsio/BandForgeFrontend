"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { SpeakingReportActions } from "@/modules/speaking/components/report/speaking-report-actions";

type Props = {
  metaLabel: string;
  children: ReactNode;
  footer?: ReactNode;
  backHref?: string | null;
  backLabel?: string;
  onBack?: () => void;
  /** Used when primary back navigation fails or is unavailable. */
  fallbackHref?: string | null;
};

export function SpeakingReportShell({
  metaLabel,
  children,
  footer,
  backHref,
  backLabel = "Back to scores",
  onBack,
  fallbackHref = "/scores",
}: Props) {
  const router = useRouter();
  const canGoBack = Boolean(onBack || backHref || fallbackHref);

  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }
    if (backHref) {
      router.push(backHref);
      return;
    }
    if (fallbackHref) {
      router.push(fallbackHref);
    }
  };

  return (
    <div className="speaking-report min-h-dvh overflow-x-hidden bg-[#F4F7FB] text-ink">
      <header className="border-b border-border-soft bg-white">
        <div className="mx-auto flex min-h-[70px] w-full max-w-[1240px] flex-col justify-center gap-2 px-4 py-3 sm:px-6 md:flex-row md:items-center md:justify-between md:px-8 lg:px-10">
          <div className="flex items-center gap-3">
            {canGoBack ? (
              <button
                type="button"
                onClick={handleBack}
                className="inline-flex size-11 cursor-pointer items-center justify-center rounded-full border border-border-soft bg-surface-alt text-navy transition-colors hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan"
                aria-label={backLabel}
              >
                <ChevronLeft className="size-5" aria-hidden />
              </button>
            ) : null}
            <Link href={backHref || fallbackHref || "/scores"} className="flex items-end gap-2" aria-label="BandForge">
              <span className="flex h-5 items-end gap-[3px]" aria-hidden>
                {[40, 60, 80, 100].map((height) => (
                  <span
                    key={height}
                    className="w-1 rounded-sm bg-cyan"
                    style={{ height: `${height}%` }}
                  />
                ))}
              </span>
              <span className="font-display text-lg font-extrabold tracking-tight text-navy">
                Band<span className="text-cyan">Forge</span>
              </span>
            </Link>
          </div>
          <p className="font-mono text-[10px] tracking-[0.1em] text-muted uppercase sm:text-xs">
            {metaLabel}
          </p>
        </div>
      </header>

      <SpeakingReportActions />

      <main>{children}</main>

      {footer ? (
        <div
          className="sticky bottom-0 border-t border-border-soft bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/90"
          style={{ paddingBottom: "max(0.875rem, env(safe-area-inset-bottom))" }}
        >
          <div className="mx-auto w-full max-w-[1240px] px-4 py-3.5 sm:px-6 lg:px-10">
            {footer}
          </div>
        </div>
      ) : null}
    </div>
  );
}
