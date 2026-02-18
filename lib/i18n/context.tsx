"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import fr from "@/messages/fr.json";
import en from "@/messages/en.json";

export type Locale = "fr" | "en";

const STORAGE_KEY = "eco_relais_locale";
const COOKIE_KEY = "eco_relais_locale";
const DEFAULT_LOCALE: Locale = "fr";

function setLocaleCookie(locale: Locale) {
  if (typeof document === "undefined") return;
  document.cookie = `${COOKIE_KEY}=${locale};path=/;max-age=31536000;SameSite=Lax`;
}

const messages: Record<Locale, Record<string, unknown>> = { fr: fr as Record<string, unknown>, en: en as Record<string, unknown> };

function getNested(obj: Record<string, unknown>, path: string): string | undefined {
  const parts = path.split(".");
  let current: unknown = obj;
  for (const part of parts) {
    if (current == null || typeof current !== "object") return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  return typeof current === "string" ? current : undefined;
}

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as Locale | null;
      if (stored === "fr" || stored === "en") {
        setLocaleState(stored);
        setLocaleCookie(stored);
      }
    } catch {
      // ignore
    }
    setMounted(true);
  }, []);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
      setLocaleCookie(next);
    } catch {
      // ignore
    }
  }, []);

  const t = useCallback(
    (key: string): string => {
      if (!mounted) return key;
      const value = getNested(messages[locale] as Record<string, unknown>, key);
      return value ?? key;
    },
    [locale, mounted]
  );

  const value = useMemo<I18nContextValue>(() => ({ locale, setLocale, t }), [locale, setLocale, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useTranslation() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    // Fallback when used outside provider (e.g. SSR or missing wrapper)
    const fallbackT = (key: string) => key;
    return { locale: DEFAULT_LOCALE as Locale, setLocale: () => {}, t: fallbackT };
  }
  return ctx;
}
