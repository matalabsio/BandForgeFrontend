"use client";

import { AuthSessionProvider } from "@/components/auth/auth-session-provider";

/** Login/signup pages need session context without the marketing conversion shell. */
export function BfAuthSessionRoot({ children }: { children: React.ReactNode }) {
  return <AuthSessionProvider>{children}</AuthSessionProvider>;
}
