"use client";

import { useLayoutEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { DiagnosticWaitState } from "@/components/diagnostic/ui/diagnostic-processing-loader";
import { ensureSession, getMe, loginPathWithNext } from "@/lib/auth";
import { isFullAccountUser } from "@/lib/diagnostic-lead-sync";
import { hasLikelyClientSession } from "@/lib/session";

type Props = {
  /** Post-login destination (Writing or Speaking path). */
  nextPath: string;
  children: ReactNode;
};

/**
 * Blocks guests from productive diagnostic modules (Writing / Speaking).
 * Full-account users continue; others go to `/login?next=…`.
 *
 * After Google mid-auth, cookies/hints are already set — paint Writing/Speaking
 * immediately and verify in the background instead of a second "Checking sign-in".
 */
export function DiagnosticProductiveAccessGuard({ nextPath, children }: Props) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useLayoutEffect(() => {
    let cancelled = false;

    // Post-OAuth / existing full session: don't block the module on refresh+/me.
    if (hasLikelyClientSession()) {
      setReady(true);
    }

    void (async () => {
      const session = await ensureSession({
        logoutOnUnauthorized: false,
      }).catch(() => null);
      const user = session ? await getMe().catch(() => null) : null;
      if (cancelled) return;

      if (!session || !isFullAccountUser(user?.role)) {
        setReady(false);
        router.replace(loginPathWithNext(nextPath));
        return;
      }
      setReady(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [nextPath, router]);

  if (!ready) {
    return (
      <div className="flex min-h-dvh flex-col">
        <DiagnosticWaitState label="Checking sign-in" />
      </div>
    );
  }

  return <>{children}</>;
}
