"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  AuthSessionProvider,
  useAuthSession,
} from "@/components/auth/auth-session-provider";
import { StartMockAuthProvider } from "@/components/bandforge/auth/start-mock-auth-context";
import { StartEmailModal } from "@/components/bandforge/auth/start-email-modal";
import { StartMockModal } from "@/components/bandforge/auth/start-mock-modal";
import { useStartMockAuth } from "@/components/bandforge/auth/start-mock-auth-context";
import { isAuthEnabled, isPhoneOtpEnabled } from "@/lib/flags";

function OpenModalFromQuery() {
  const searchParams = useSearchParams();
  const { openStartMockModal } = useStartMockAuth();
  const { isAuthenticated, loading } = useAuthSession();

  useEffect(() => {
    const start = searchParams.get("start");
    const signin = searchParams.get("signin");
    if (start !== "1" && signin !== "1") return;

    if (!isAuthEnabled()) {
      window.location.href = "/dashboard";
      return;
    }

    if (loading || isAuthenticated) return;
    openStartMockModal();
  }, [searchParams, openStartMockModal, isAuthenticated, loading]);

  return null;
}

function AuthModal() {
  if (!isAuthEnabled()) return null;
  if (isPhoneOtpEnabled()) {
    return <StartMockModal />;
  }
  return <StartEmailModal />;
}

export function BfConversionShell({ children }: { children: React.ReactNode }) {
  return (
    <AuthSessionProvider>
    <StartMockAuthProvider>
      {children}
      <Suspense fallback={null}>
        <OpenModalFromQuery />
      </Suspense>
      <AuthModal />
    </StartMockAuthProvider>
    </AuthSessionProvider>
  );
}
