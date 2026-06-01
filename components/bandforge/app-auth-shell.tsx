"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { AuthSessionProvider } from "@/components/auth/auth-session-provider";
import { ensureSession } from "@/lib/auth";
import { isAuthEnabled } from "@/lib/flags";

type Props = {
  children: React.ReactNode;
  /** Server layout already validated the user — skip client refresh waterfall. */
  serverAuthenticated?: boolean;
};

/** Sync localStorage JWT → httpOnly cookies when needed. */
function AppSessionSync({ serverAuthenticated = false }: { serverAuthenticated?: boolean }) {
  const { refresh } = useRouter();
  const ran = useRef(false);

  useEffect(() => {
    if (!isAuthEnabled() || ran.current || serverAuthenticated) return;
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
