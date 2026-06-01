"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

/** Re-fetch dashboard server data when profile is saved elsewhere in the app. */
export function DashboardProfileSync() {
  const { refresh } = useRouter();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onUpdated = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        refresh();
      }, 300);
    };
    window.addEventListener("bf-profile-updated", onUpdated);
    return () => {
      window.removeEventListener("bf-profile-updated", onUpdated);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [refresh]);

  return null;
}
