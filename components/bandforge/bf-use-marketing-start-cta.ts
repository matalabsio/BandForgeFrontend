"use client";

import { useEffect, useState } from "react";
import { marketingSignInHref } from "@/components/bandforge/bf-marketing-auth-links";
import { hasSessionHintCookie } from "@/lib/session";

export type MarketingStartCta = {
  href: string;
  label: string;
  ariaLabel: string;
};

/** Client CTA: Dashboard when session hint exists, otherwise login → dashboard. */
export function useMarketingStartCta(
  next = "/dashboard",
): MarketingStartCta {
  const [signedIn, setSignedIn] = useState(() =>
    typeof document !== "undefined" ? hasSessionHintCookie() : false,
  );

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
