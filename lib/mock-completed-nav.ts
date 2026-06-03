"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export const MOCK_COMPLETED_EXIT = "/dashboard";

export function redirectIfMockCompleted(
  status: string | undefined,
  replace: (url: string) => void,
): boolean {
  if (status !== "completed") return false;
  replace(MOCK_COMPLETED_EXIT);
  return true;
}

/** Browser Back from a terminal page (e.g. mock results) → dashboard. */
export function useRedirectBrowserBack(fallbackPath = MOCK_COMPLETED_EXIT): void {
  const { replace } = useRouter();

  useEffect(() => {
    window.history.pushState({ mockCompletedExit: true }, "");

    const onPop = () => {
      replace(fallbackPath);
    };

    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [fallbackPath, replace]);
}
