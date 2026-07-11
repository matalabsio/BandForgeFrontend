"use client";

import { cn } from "@/lib/utils";
import { Download } from "lucide-react";
import { useInstallPrompt } from "@/lib/pwa/install-prompt-context";

type InstallPromptButtonProps = {
  variant?: "primary" | "compact" | "icon";
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

  if (
    !canInstall &&
    !(isIos && (variant === "primary" || variant === "icon"))
  ) {
    return null;
  }

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={openModal}
        aria-label="Install BandForge"
        title="Install BandForge"
        className={cn(
          "inline-flex cursor-pointer items-center justify-center rounded-full border border-border-soft bg-white p-2.5 text-navy transition-colors duration-200 hover:border-navy/15 hover:bg-surface-alt",
          className,
        )}
      >
        <Download className="size-4" strokeWidth={2} aria-hidden />
      </button>
    );
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
