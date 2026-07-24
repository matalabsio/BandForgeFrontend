"use client";

import { useEffect, useState } from "react";
import { marketingSignInHref } from "@/components/bandforge/bf-marketing-auth-links";
import { hasSessionHintCookie } from "@/lib/session";

export type MarketingStartCta = {
  href: string;
  label: string;
  ariaLabel: string;
};

/**
 * Client CTA: Dashboard when session hint exists, otherwise login → dashboard.
 * Always starts as guest on SSR + first paint to avoid hydration mismatch.
 */
export function useMarketingStartCta(
  next = "/dashboard",
): MarketingStartCta {
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    setSignedIn(hasSessionHintCookie());
  }, []);

  if (signedIn) {
    return {
      href: next,
      label: "Dashboard",
      ariaLabel: "Open your dashboard",
    };
  }

  return {
    href: marketingSignInHref(next),
    label: "Start free",
    ariaLabel: "Start free — sign in to open your dashboard",
  };
}
