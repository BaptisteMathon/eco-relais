"use client";

import { useEffect, useRef, useCallback } from "react";
import { useAuthStore } from "@/lib/stores/auth-store";
import { registerActivityTouch } from "@/lib/session-idle";

const CHECK_INTERVAL_MS = 60 * 1000; // check every minute
const ACTIVITY_THROTTLE_MS = 30_000; // throttle user events to every 30s

/**
 * Registers store's touchActivity with session-idle (so API client can call it)
 * and runs idle check: if user has been idle for 3h, logout and redirect to login.
 * Also touches activity on user events (mousemove, keydown) throttled.
 */
export function SessionIdleProvider({ children }: { children: React.ReactNode }) {
  const logout = useAuthStore((s) => s.logout);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isIdleExpired = useAuthStore((s) => s.isIdleExpired);
  const touchActivity = useAuthStore((s) => s.touchActivity);
  const lastTouchRef = useRef(0);

  const checkAndLogout = useCallback(() => {
    if (typeof window === "undefined") return;
    if (!isAuthenticated()) return;
    if (isIdleExpired()) {
      logout();
      window.location.href = "/login";
    }
  }, [logout, isAuthenticated, isIdleExpired]);

  // Register touch so API client can update lastActivityAt
  useEffect(() => {
    registerActivityTouch(touchActivity);
  }, [touchActivity]);

  // On mount and periodically: check idle and logout if expired
  useEffect(() => {
    checkAndLogout();
    const interval = setInterval(checkAndLogout, CHECK_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [checkAndLogout]);

  // On window focus (user returns to tab): check idle
  useEffect(() => {
    if (typeof window === "undefined") return;
    const onFocus = () => checkAndLogout();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [checkAndLogout]);

  // User activity (mousemove, keydown): throttle and touch
  useEffect(() => {
    if (typeof window === "undefined") return;
    const onActivity = () => {
      const now = Date.now();
      if (now - lastTouchRef.current < ACTIVITY_THROTTLE_MS) return;
      lastTouchRef.current = now;
      touchActivity();
    };
    window.addEventListener("mousemove", onActivity, { passive: true });
    window.addEventListener("keydown", onActivity);
    return () => {
      window.removeEventListener("mousemove", onActivity);
      window.removeEventListener("keydown", onActivity);
    };
  }, [touchActivity]);

  return <>{children}</>;
}
