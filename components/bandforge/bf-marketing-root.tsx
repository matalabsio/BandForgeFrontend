"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BfConversionLoading } from "@/components/bandforge/bf-conversion-loading";
import { marketingSignInHref } from "@/components/bandforge/bf-marketing-auth-links";

function MarketingAuthGate({ children }: { children: React.ReactNode }) {
  const { replace } = useRouter();
  const searchParams = useSearchParams();
  const start = searchParams.get("start") === "1";
  const signin = searchParams.get("signin") === "1";
  const next = searchParams.get("next");

  useEffect(() => {
    if (!start && !signin) return;
    const dest = marketingSignInHref(
      next && next.startsWith("/") && !next.startsWith("//")
        ? next
        : "/dashboard",
    );
    // Legacy marketing query params: client redirect to login with return URL.
    replace(dest);
  }, [start, signin, next, replace]);

  if (start || signin) {
    return (
      <>
        {children}
        <BfConversionLoading />
      </>
    );
  }

  return <>{children}</>;
}

/** Marketing pages: no auth providers; legacy ?start=1 redirects to /login. */
export function BfMarketingRoot({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<>{children}</>}>
      <MarketingAuthGate>{children}</MarketingAuthGate>
    </Suspense>
  );
}
