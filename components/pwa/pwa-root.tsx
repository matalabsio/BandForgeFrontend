"use client";

import { SerwistProvider } from "@serwist/turbopack/react";
import { DevServiceWorkerReset } from "@/components/pwa/dev-service-worker-reset";
import { InstallPromptModal } from "@/components/pwa/install-prompt-modal";
import { InstallPromptProvider } from "@/lib/pwa/install-prompt-context";

const disableServiceWorker = process.env.NODE_ENV === "development";

export function PwaRoot({ children }: { children: React.ReactNode }) {
  return (
    <SerwistProvider swUrl="/serwist/sw.js" disable={disableServiceWorker}>
      <DevServiceWorkerReset />
      <InstallPromptProvider>
        {children}
        <InstallPromptModal />
      </InstallPromptProvider>
    </SerwistProvider>
  );
}
