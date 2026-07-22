"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { SerwistProvider } from "@serwist/turbopack/react";
import { DevServiceWorkerReset } from "@/components/pwa/dev-service-worker-reset";
import { InstallPromptModal } from "@/components/pwa/install-prompt-modal";
import { InstallPromptProvider } from "@/lib/pwa/install-prompt-context";

const disableServiceWorker = process.env.NODE_ENV === "development";

const DEFER_SW_PREFIXES = [
  "/dashboard",
  "/scores",
  "/profile",
  "/mock",
  "/test",
  "/diagnostic",
  "/admin",
  "/auth",
  "/login",
  "/signup",
  "/verify-phone",
  "/verify-email",
  "/forgot-password",
  "/reset-password",
  "/check-email",
  "/pricing",
  "/checkout",
] as const;

function shouldDeferServiceWorker(pathname: string): boolean {
  return !DEFER_SW_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

function PwaShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <DevServiceWorkerReset />
      <InstallPromptProvider>
        {children}
        <InstallPromptModal />
      </InstallPromptProvider>
    </>
  );
}

export function PwaRoot({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const deferSw = shouldDeferServiceWorker(pathname);
  const [enableSw, setEnableSw] = useState(!deferSw);

  useEffect(() => {
    if (!deferSw) {
      setEnableSw(true);
      return;
    }

    setEnableSw(false);
    const enable = () => setEnableSw(true);

    if (document.readyState === "complete") {
      enable();
      return;
    }

    window.addEventListener("load", enable, { once: true });
    return () => window.removeEventListener("load", enable);
  }, [deferSw]);

  if (!enableSw || disableServiceWorker) {
    return <PwaShell>{children}</PwaShell>;
  }

  return (
    <SerwistProvider swUrl="/serwist/sw.js" disable={disableServiceWorker}>
      <PwaShell>{children}</PwaShell>
    </SerwistProvider>
  );
}
