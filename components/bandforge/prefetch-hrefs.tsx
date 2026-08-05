"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Prefetch plan/hub hrefs so Practice/Submit navigations feel instant. */
export function PrefetchHrefs({ hrefs }: { hrefs: string[] }) {
  const router = useRouter();
  useEffect(() => {
    const unique = [...new Set(hrefs.filter(Boolean))];
    for (const href of unique.slice(0, 8)) {
      try {
        router.prefetch(href);
      } catch {
        /* ignore */
      }
    }
  }, [hrefs, router]);
  return null;
}
