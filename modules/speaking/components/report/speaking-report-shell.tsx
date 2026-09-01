"use client";

import { useRef, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { useUnlockPageScroll } from "@/lib/use-unlock-page-scroll";
import { BandForgeLogoMark } from "@/components/bandforge/bandforge-logo-link";
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
  const scrollRef = useRef<HTMLElement>(null);
  const canGoBack = Boolean(onBack || backHref || fallbackHref);

  useUnlockPageScroll(scrollRef, [children, footer, metaLabel]);

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
    <div className="speaking-report fixed inset-0 z-0 flex min-h-0 flex-col overflow-hidden bg-[#F4F7FB] text-ink">
      <header className="shrink-0 border-b border-border-soft bg-white">
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
            <Link href={backHref || fallbackHref || "/scores"} className="inline-flex items-center" aria-label="BandForge">
              <BandForgeLogoMark size="sm" />
            </Link>
          </div>
          <p className="font-mono text-[10px] tracking-[0.1em] text-muted uppercase sm:text-xs">
            {metaLabel}
          </p>
        </div>
      </header>

      <div className="shrink-0">
        <SpeakingReportActions />
      </div>

      <main
        ref={scrollRef}
        className="speaking-report-scroll min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain [-webkit-overflow-scrolling:touch]"
      >
        {children}
      </main>

      {footer ? (
        <div
          className="speaking-report-footer shrink-0 border-t border-border-soft bg-white/95 shadow-[0_-4px_24px_rgba(15,23,42,0.08)] backdrop-blur supports-[backdrop-filter]:bg-white/90"
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
