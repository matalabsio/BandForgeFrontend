"use client";

import { useLayoutEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { DiagnosticWaitState } from "@/components/diagnostic/ui/diagnostic-processing-loader";
import { ensureSession, getMe, loginPathWithNext } from "@/lib/auth";
import { decideDiagnosticProductiveAccess } from "@/lib/diagnostic-productive-access";

type Props = {
  /** Post-login destination (Writing or Speaking path). */
  nextPath: string;
  children: ReactNode;
};

/**
 * Blocks guests from productive diagnostic modules (Writing / Speaking).
 * Full-account users continue; others go to `/login?next=…`.
 *
 * Stays on "Checking sign-in" until session + role are resolved — never mounts
 * children from cookie/localStorage hints alone.
 */
export function DiagnosticProductiveAccessGuard({ nextPath, children }: Props) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useLayoutEffect(() => {
    let cancelled = false;

    void (async () => {
      const session = await ensureSession({
        logoutOnUnauthorized: false,
      }).catch(() => null);
      const user = session ? await getMe().catch(() => null) : null;
      if (cancelled) return;

      const decision = decideDiagnosticProductiveAccess({
        roleResolved: true,
        hasSession: Boolean(session),
        role: user?.role,
      });

      if (decision.kind !== "allow") {
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
