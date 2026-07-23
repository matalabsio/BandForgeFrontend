"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { AuthSessionProvider } from "@/components/auth/auth-session-provider";
import { ensureSession } from "@/lib/auth";
import { isAuthEnabled } from "@/lib/flags";
import { hasSessionHintCookie } from "@/lib/session";

type Props = {
  children: React.ReactNode;
  /** Server layout already validated the user — skip client refresh when session hint is warm. */
  serverAuthenticated?: boolean;
};

/** Sync localStorage access JWT ↔ httpOnly cookies when needed. */
function AppSessionSync({ serverAuthenticated = false }: { serverAuthenticated?: boolean }) {
  const { refresh } = useRouter();
  const ran = useRef(false);

  useEffect(() => {
    if (!isAuthEnabled() || ran.current) return;
    // Cookie session already present — skip waterfall when RSC authenticated.
    if (serverAuthenticated && hasSessionHintCookie()) return;
    ran.current = true;

    void ensureSession().then((session) => {
      if (session) refresh();
    });
  }, [refresh, serverAuthenticated]);

  return null;
}

/** Dashboard / scores / profile — client session + cookie hydration. */
export function AppAuthShell({
  children,
  serverAuthenticated = false,
}: Props) {
  return (
    <AuthSessionProvider serverAuthenticated={serverAuthenticated}>
      <AppSessionSync serverAuthenticated={serverAuthenticated} />
      {children}
    </AuthSessionProvider>
  );
}
