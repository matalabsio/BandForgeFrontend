"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { StartMockAuthProvider } from "@/components/bandforge/auth/start-mock-auth-context";
import { StartEmailModal } from "@/components/bandforge/auth/start-email-modal";
import { StartMockModal } from "@/components/bandforge/auth/start-mock-modal";
import { useStartMockAuth } from "@/components/bandforge/auth/start-mock-auth-context";
import { isPhoneOtpEnabled } from "@/lib/flags";

function OpenModalFromQuery() {
  const searchParams = useSearchParams();
  const { openStartMockModal } = useStartMockAuth();

  useEffect(() => {
    const start = searchParams.get("start");
    const signin = searchParams.get("signin");
    if (start === "1" || signin === "1") {
      openStartMockModal();
    }
  }, [searchParams, openStartMockModal]);

  return null;
}

function AuthModal() {
  if (isPhoneOtpEnabled()) {
    return <StartMockModal />;
  }
  return <StartEmailModal />;
}

export function BfConversionShell({ children }: { children: React.ReactNode }) {
  return (
    <StartMockAuthProvider>
      {children}
      <Suspense fallback={null}>
        <OpenModalFromQuery />
      </Suspense>
      <AuthModal />
    </StartMockAuthProvider>
  );
}
