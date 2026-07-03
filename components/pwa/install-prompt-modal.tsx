"use client";

import { Smartphone } from "lucide-react";
import { useInstallPrompt } from "@/lib/pwa/install-prompt-context";

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
            <p className="bf-eyebrow text-teal">Install app</p>
            <h2
              id="pwa-install-title"
              className="font-display mt-1 text-xl font-bold text-navy"
            >
              Add BandForge to your home screen
            </h2>
            {isIos ? (
              <p className="mt-2 text-sm leading-relaxed text-ink/70">
                Tap the Share button in Safari, then choose{" "}
                <span className="font-semibold text-navy">
                  Add to Home Screen
                </span>{" "}
                for quick launch like a native app.
              </p>
            ) : (
              <p className="mt-2 text-sm leading-relaxed text-ink/70">
                Install BandForge for faster access, full-screen practice, and a
                home-screen shortcut — no app store needed.
              </p>
            )}
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
          {!isIos && canInstall ? (
            <button
              type="button"
              onClick={() => void promptInstall()}
              className="inline-flex h-11 flex-1 cursor-pointer items-center justify-center rounded-xl bg-navy px-4 font-display text-sm font-semibold text-white transition-colors hover:bg-navy-deep"
            >
              Add to Home Screen
            </button>
          ) : null}
          <button
            type="button"
            onClick={dismissModal}
            className="inline-flex h-11 flex-1 cursor-pointer items-center justify-center rounded-xl border border-border-soft bg-white px-4 font-display text-sm font-semibold text-navy transition-colors hover:bg-surface-alt"
          >
            {isIos && !canInstall ? "Got it" : "Not now"}
          </button>
        </div>
      </div>
    </div>
  );
}
