"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/lib/stores/auth-store";
import { setAuthToken } from "@/lib/api/client";

/**
 * Syncs token from zustand persist to localStorage so API client can read it after refresh.
 */
export function AuthSync({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.token);

  useEffect(() => {
    if (token) {
      setAuthToken(token);
    }
  }, [token]);

  return <>{children}</>;
}
