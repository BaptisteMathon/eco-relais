"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/lib/stores/auth-store";
import { setAuthToken } from "@/lib/api/client";

const HYDRATE_FALLBACK_MS = 150;

/**
 * Syncs token from zustand persist to localStorage so API client can read it after refresh.
 * Also sets _hasHydrated after a short delay if persist hasn't fired yet (avoids stuck "Chargement...").
 */
export function AuthSync({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.token);

  useEffect(() => {
    if (token) {
      setAuthToken(token);
    }
  }, [token]);

  useEffect(() => {
    const id = setTimeout(() => {
      if (!useAuthStore.getState()._hasHydrated) {
        useAuthStore.setState({ _hasHydrated: true });
      }
    }, HYDRATE_FALLBACK_MS);
    return () => clearTimeout(id);
  }, []);

  return <>{children}</>;
}
