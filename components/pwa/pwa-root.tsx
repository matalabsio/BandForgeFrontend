"use client";

import { useEffect, useState } from "react";
import { SerwistProvider } from "@serwist/turbopack/react";
import { DevServiceWorkerReset } from "@/components/pwa/dev-service-worker-reset";
import { InstallPromptModal } from "@/components/pwa/install-prompt-modal";
import { InstallPromptProvider } from "@/lib/pwa/install-prompt-context";

const disableServiceWorker = process.env.NODE_ENV === "development";

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

/** Register Serwist only after window load so marketing LCP is not competing with SW. */
export function PwaRoot({ children }: { children: React.ReactNode }) {
  const [enableSw, setEnableSw] = useState(false);

  useEffect(() => {
    if (disableServiceWorker) return;

    const enable = () => setEnableSw(true);
    if (document.readyState === "complete") {
      enable();
      return;
    }
    window.addEventListener("load", enable, { once: true });
    return () => window.removeEventListener("load", enable);
  }, []);

  if (!enableSw || disableServiceWorker) {
    return <PwaShell>{children}</PwaShell>;
  }

  return (
    <SerwistProvider swUrl="/serwist/sw.js" disable={disableServiceWorker}>
      <PwaShell>{children}</PwaShell>
    </SerwistProvider>
  );
}
