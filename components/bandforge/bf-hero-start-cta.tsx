"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ensureSession, getMe } from "@/lib/auth";
import { isAuthEnabled } from "@/lib/flags";
import { marketingSignInHref } from "@/components/bandforge/bf-marketing-auth-links";
import { mockTestNumberPath } from "@/lib/mock-catalog";

type Props = {
  /** From server cookies on first paint. */
  initialAuthenticated: boolean;
  className: string;
};

const diagnosticPath = mockTestNumberPath(1);

/** Hero primary CTA — free diagnostic mock test. */
export function BfHeroStartCta({ initialAuthenticated, className }: Props) {
  const [authed, setAuthed] = useState(
    () => !isAuthEnabled() || initialAuthenticated,
  );

  useEffect(() => {
    if (!isAuthEnabled()) {
      setAuthed(true);
      return;
    }
    if (initialAuthenticated) return;

    let cancelled = false;
    void (async () => {
      try {
        await ensureSession();
        await getMe();
        if (!cancelled) setAuthed(true);
      } catch {
        if (!cancelled) setAuthed(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [initialAuthenticated]);

  const href = authed ? diagnosticPath : marketingSignInHref(diagnosticPath);

  return (
    <Link href={href} prefetch className={className}>
      Take the Free Diagnostic Test
    </Link>
  );
}
