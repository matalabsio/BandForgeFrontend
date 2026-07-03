"use client";

import { SerwistProvider } from "@serwist/turbopack/react";
import { InstallPromptModal } from "@/components/pwa/install-prompt-modal";
import { InstallPromptProvider } from "@/lib/pwa/install-prompt-context";

export function PwaRoot({ children }: { children: React.ReactNode }) {
  return (
    <SerwistProvider swUrl="/serwist/sw.js">
      <InstallPromptProvider>
        {children}
        <InstallPromptModal />
      </InstallPromptProvider>
    </SerwistProvider>
  );
}
