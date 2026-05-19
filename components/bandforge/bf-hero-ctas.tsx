"use client";

import { IconArrowRight } from "@/components/icons";
import { useStartMockAuth } from "@/components/bandforge/auth/start-mock-auth-context";

export function BfHeroCtas() {
  const { openStartMockModal } = useStartMockAuth();

  return (
    <div className="bf-fade-up bf-delay-3 mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
      <button
        type="button"
        onClick={openStartMockModal}
        className="group inline-flex min-h-[var(--spacing-touch)] w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-navy px-7 py-3.5 text-body font-semibold text-white shadow-[0_20px_60px_-28px_rgb(13_31_60_/_0.85)] transition-colors duration-200 hover:bg-navy/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2 sm:w-auto"
      >
        Start free mock
        <IconArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none" />
      </button>
    </div>
  );
}
