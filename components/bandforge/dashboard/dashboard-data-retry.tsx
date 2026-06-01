"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

/**
 * If the server rendered with empty dashboard API data (race after login or slow
 * backend), trigger one router.refresh() so the next RSC pass loads real data.
 */
export function DashboardDataRetry({
  needsRetry,
  children,
}: {
  needsRetry: boolean;
  children: React.ReactNode;
}) {
  const { refresh } = useRouter();
  const retried = useRef(false);

  useEffect(() => {
    if (!needsRetry || retried.current) return;
    retried.current = true;
    refresh();
  }, [needsRetry, refresh]);

  return <>{children}</>;
}
