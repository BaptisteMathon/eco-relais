import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/lib/types";
import { setAuthToken, clearAuth as clearApiAuth } from "@/lib/api/client";

const IDLE_TIMEOUT_MS = 3 * 60 * 60 * 1000; // 3 hours

interface AuthState {
  user: User | null;
  token: string | null;
  lastActivityAt: number | null;
  setAuth: (user: User, token: string) => void;
  setUser: (user: User) => void;
  touchActivity: () => void;
  logout: () => void;
  isAuthenticated: () => boolean;
  isIdleExpired: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      lastActivityAt: null,
      setAuth: (user, token) => {
        setAuthToken(token);
        set({ user, token, lastActivityAt: Date.now() });
      },
      setUser: (user) => set({ user }),
      touchActivity: () => set({ lastActivityAt: Date.now() }),
      logout: () => {
        clearApiAuth();
        set({ user: null, token: null, lastActivityAt: null });
      },
      isAuthenticated: () => Boolean(get().token && get().user),
      isIdleExpired: () => {
        const at = get().lastActivityAt;
        if (at == null) return false;
        return Date.now() - at >= IDLE_TIMEOUT_MS;
      },
    }),
    {
      name: "eco_relais_auth",
      partialize: (s) => ({ user: s.user, token: s.token, lastActivityAt: s.lastActivityAt }),
    }
  )
);

export const getIdleTimeoutMs = () => IDLE_TIMEOUT_MS;
