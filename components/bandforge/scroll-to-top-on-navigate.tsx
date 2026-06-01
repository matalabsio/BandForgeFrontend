"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/** Scroll to top on route change so every page opens from the top. */
export function ScrollToTopOnNavigate() {
  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);

  return null;
}
