import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/lib/types";
import { setAuthToken, clearAuth as clearApiAuth } from "@/lib/api/client";

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  setUser: (user: User) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      setAuth: (user, token) => {
        setAuthToken(token);
        set({ user, token });
      },
      setUser: (user) => set({ user }),
      logout: () => {
        clearApiAuth();
        set({ user: null, token: null });
      },
      isAuthenticated: () => Boolean(get().token && get().user),
    }),
    {
      name: "eco_relais_auth",
      partialize: (s) => ({ user: s.user, token: s.token }),
    }
  )
);
