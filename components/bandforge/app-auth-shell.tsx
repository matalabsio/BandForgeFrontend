"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { AuthSessionProvider } from "@/components/auth/auth-session-provider";
import { ensureSession } from "@/lib/auth";
import { isAuthEnabled } from "@/lib/flags";

/** Sync localStorage JWT → httpOnly cookies, then refresh RSC data. */
function AppSessionSync() {
  const { refresh } = useRouter();
  const ran = useRef(false);

  useEffect(() => {
    if (!isAuthEnabled() || ran.current) return;
    ran.current = true;

    void ensureSession().then((session) => {
      if (session) refresh();
    });
  }, [refresh]);

  return null;
}

/** Dashboard / scores / profile — client session + cookie hydration. */
export function AppAuthShell({ children }: { children: React.ReactNode }) {
  return (
    <AuthSessionProvider>
      <AppSessionSync />
      {children}
    </AuthSessionProvider>
  );
}
