"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type StartMockAuthContextValue = {
  openStartMockModal: () => void;
  closeStartMockModal: () => void;
  isOpen: boolean;
};

const StartMockAuthContext = createContext<StartMockAuthContextValue | null>(
  null,
);

export function StartMockAuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [isOpen, setOpen] = useState(false);

  const openStartMockModal = useCallback(() => setOpen(true), []);
  const closeStartMockModal = useCallback(() => setOpen(false), []);

  const value = useMemo(
    () => ({
      openStartMockModal,
      closeStartMockModal,
      isOpen,
    }),
    [openStartMockModal, closeStartMockModal, isOpen],
  );

  return (
    <StartMockAuthContext.Provider value={value}>
      {children}
    </StartMockAuthContext.Provider>
  );
}

export function useStartMockAuth() {
  const ctx = useContext(StartMockAuthContext);
  if (!ctx) {
    throw new Error("useStartMockAuth must be used within StartMockAuthProvider");
  }
  return ctx;
}
