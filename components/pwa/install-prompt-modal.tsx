"use client";

import { Smartphone } from "lucide-react";
import { bfPrimaryCtaNavClass } from "@/components/bandforge/bf-primary-cta-styles";
import { useInstallPrompt } from "@/lib/pwa/install-prompt-context";
import { cn } from "@/lib/utils";

export function InstallPromptModal() {
  const {
    canInstall,
    isInstalled,
    isIos,
    isModalOpen,
    promptInstall,
    dismissModal,
  } = useInstallPrompt();

  if (!isModalOpen || isInstalled) {
    return null;
  }

  if (!canInstall && !isIos) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-navy/45 px-4 pb-6 backdrop-blur-sm sm:items-center sm:pb-0"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pwa-install-title"
    >
      <div className="w-full max-w-md rounded-2xl bg-white px-6 py-6 shadow-[var(--shadow-elevated)]">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-teal/15 text-teal">
            <Smartphone className="h-6 w-6" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="bf-eyebrow text-teal">Instant access</p>
            <h2
              id="pwa-install-title"
              className="font-display mt-1 text-xl font-bold text-navy"
            >
              Save BandForge for quicker access
            </h2>
            {isIos ? (
              <p className="mt-2 text-sm leading-relaxed text-ink/70">
                Tap the Share button in Safari, then choose{" "}
                <span className="font-semibold text-navy">
                  Add to Home Screen
                </span>{" "}
                so you can jump into practice in one tap.
              </p>
            ) : (
              <p className="mt-2 text-sm leading-relaxed text-ink/70">
                Add it to your home screen so you can jump into practice in one
                tap — no App Store needed.
              </p>
            )}
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
          {!isIos && canInstall ? (
            <button
              type="button"
              onClick={() => void promptInstall()}
              className={cn(bfPrimaryCtaNavClass, "flex-1")}
            >
              Save app
            </button>
          ) : null}
          <button
            type="button"
            onClick={dismissModal}
            className="inline-flex min-h-10 flex-1 cursor-pointer items-center justify-center rounded-full border border-navy/20 bg-white px-[22px] py-2.5 text-[0.9375rem] font-semibold text-navy transition-colors duration-200 hover:border-teal hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/30 focus-visible:ring-offset-2"
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}
