"use client";

import { cn } from "@/lib/utils";
import { useInstallPrompt } from "@/lib/pwa/install-prompt-context";

type InstallPromptButtonProps = {
  variant?: "primary" | "compact";
  className?: string;
};

export function InstallPromptButton({
  variant = "primary",
  className,
}: InstallPromptButtonProps) {
  const { canInstall, isInstalled, isIos, openModal } = useInstallPrompt();

  if (isInstalled) {
    return null;
  }

  if (!canInstall && !(isIos && variant === "primary")) {
    return null;
  }

  const baseClass =
    variant === "compact"
      ? "inline-flex items-center justify-center rounded-full border border-navy/15 bg-white px-4 py-2 font-display text-sm font-semibold text-navy transition-colors hover:bg-surface"
      : "inline-flex items-center justify-center rounded-full bg-navy px-6 py-3 font-display text-sm font-semibold text-white shadow-[var(--shadow-elevated)] transition-colors hover:bg-navy-deep";

  return (
    <button
      type="button"
      onClick={openModal}
      className={cn(baseClass, className)}
    >
      Install BandForge
    </button>
  );
}
