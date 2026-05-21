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
import { ensureSession, getMe } from "@/lib/auth";
import { ApiError } from "@/lib/api";
import { isAuthEnabled } from "@/lib/flags";
import type { AuthUser } from "@/lib/session";

type AuthSessionContextValue = {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  refreshUser: () => Promise<void>;
};

const AuthSessionContext = createContext<AuthSessionContextValue | null>(null);

export function AuthSessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    if (!isAuthEnabled()) {
      setUser(null);
      return;
    }
    try {
      const me = await getMe();
      setUser(me);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        try {
          await ensureSession();
          setUser(await getMe());
          return;
        } catch {
          /* fall through */
        }
      }
      setUser(null);
    }
  }, []);

  useEffect(() => {
    if (!isAuthEnabled()) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function init() {
      try {
        const me = await getMe();
        if (!cancelled) setUser(me);
      } catch (err) {
        if (
          !cancelled &&
          err instanceof ApiError &&
          err.status === 401
        ) {
          try {
            await ensureSession();
            const me = await getMe();
            if (!cancelled) setUser(me);
            return;
          } catch {
            /* fall through */
          }
        }
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void init();
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: user !== null,
      refreshUser,
    }),
    [user, loading, refreshUser],
  );

  return (
    <AuthSessionContext.Provider value={value}>
      {children}
    </AuthSessionContext.Provider>
  );
}

export function useAuthSession(): AuthSessionContextValue {
  const ctx = useContext(AuthSessionContext);
  if (!ctx) {
    throw new Error("useAuthSession must be used within AuthSessionProvider");
  }
  return ctx;
}
