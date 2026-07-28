"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

const DISMISS_KEY = "bf-pwa-install-dismissed";

type InstallPromptContextValue = {
  canInstall: boolean;
  isInstalled: boolean;
  isIos: boolean;
  isModalOpen: boolean;
  promptInstall: () => Promise<void>;
  dismissModal: () => void;
  openModal: () => void;
};

const InstallPromptContext = createContext<InstallPromptContextValue | null>(
  null,
);

function isStandaloneDisplay(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in navigator &&
      (navigator as Navigator & { standalone?: boolean }).standalone === true)
  );
}

function isIosDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

const BLOCKED_PREFIXES = [
  "/test",
  "/mock",
  "/diagnostic",
] as const;

function isBlockedRoute(pathname: string): boolean {
  return BLOCKED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function InstallPromptProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    setIsInstalled(isStandaloneDisplay());
    setIsIos(isIosDevice());

    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };

    const onAppInstalled = () => {
      setDeferredPrompt(null);
      setIsInstalled(true);
      setIsModalOpen(false);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onAppInstalled);
    };
  }, []);

  const canInstall = Boolean(deferredPrompt) && !isInstalled;

  // Auto install popup disabled for now — use InstallPromptButton on /mobile only.
  useEffect(() => {
    if (isInstalled || isBlockedRoute(pathname)) {
      setIsModalOpen(false);
    }
  }, [isInstalled, pathname]);

  const dismissModal = useCallback(() => {
    sessionStorage.setItem(DISMISS_KEY, "1");
    setIsModalOpen(false);
  }, []);

  const openModal = useCallback(() => {
    if (isInstalled) return;
    setIsModalOpen(true);
  }, [isInstalled]);

  const promptInstall = useCallback(async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setIsModalOpen(false);
    if (choice.outcome === "dismissed") {
      sessionStorage.setItem(DISMISS_KEY, "1");
    }
  }, [deferredPrompt]);

  const value = useMemo<InstallPromptContextValue>(
    () => ({
      canInstall,
      isInstalled,
      isIos,
      isModalOpen,
      promptInstall,
      dismissModal,
      openModal,
    }),
    [
      canInstall,
      isInstalled,
      isIos,
      isModalOpen,
      promptInstall,
      dismissModal,
      openModal,
    ],
  );

  return (
    <InstallPromptContext.Provider value={value}>
      {children}
    </InstallPromptContext.Provider>
  );
}

export function useInstallPrompt(): InstallPromptContextValue {
  const context = useContext(InstallPromptContext);
  if (!context) {
    throw new Error("useInstallPrompt must be used within InstallPromptProvider");
  }
  return context;
}
