"use client";

import React, { createContext, useContext, useCallback, ReactNode, useEffect, useState, useRef } from "react";

import en from "@/messages/en.json";
import fr from "@/messages/fr.json";
import es from "@/messages/es.json";

export type Locale = "en" | "fr" | "es";

export const locales: { code: Locale; label: string; flag: string }[] = [
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "es", label: "Español", flag: "🇪🇸" },
];

const translations: Record<Locale, typeof en> = { en, fr, es };

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  isLoading: boolean;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);
// Storage key for fallback
const LOCALE_STORAGE_KEY = "app-locale";
// API base URL
const API_BASE = process.env.NEXT_PUBLIC_API_URL!;

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const isSaving = useRef(false);

  // Handle hydration
  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    const fetchLanguage = async () => {
      try {
        const response = await fetch(`${API_BASE}/users/language`, {
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          if (data.language && locales.some((l) => l.code === data.language)) {
            setLocaleState(data.language as Locale);
            localStorage.setItem(LOCALE_STORAGE_KEY, data.language);
          }
          setIsAuthenticated(true);
        } else if (response.status === 401) {
          setIsAuthenticated(false);
          const saved = localStorage.getItem(LOCALE_STORAGE_KEY) as Locale | null;
          if (saved && locales.some((l) => l.code === saved)) {
            setLocaleState(saved);
          }
        } else {
          const saved = localStorage.getItem(LOCALE_STORAGE_KEY) as Locale | null;
          if (saved && locales.some((l) => l.code === saved)) {
            setLocaleState(saved);
          }
        }
      } catch (error) {
        const saved = localStorage.getItem(LOCALE_STORAGE_KEY) as Locale | null;
        if (saved && locales.some((l) => l.code === saved)) {
          setLocaleState(saved);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchLanguage();
  }, [hydrated]);

  // Update language in backend
  const setLocale = useCallback(async (newLocale: Locale) => {
    if (isSaving.current) return;

    if (!locales.some((l) => l.code === newLocale)) {
      return;
    }
    setLocaleState(newLocale);
    // Always save to localStorage as cache/fallback
    localStorage.setItem(LOCALE_STORAGE_KEY, newLocale);
    // If authenticated, save to backend
    if (isAuthenticated) {
      isSaving.current = true;
      try {
        const response = await fetch(`${API_BASE}/users/language`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ language: newLocale }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
        }
      } catch (error) {
      } finally {
        isSaving.current = false;
      }
    }
  }, [isAuthenticated]);

  const t = useCallback((key: string, params?: Record<string, string | number>): string => {
    const keys = key.split(".");
    let value: unknown = translations[locale];

    for (const k of keys) {
      if (value && typeof value === "object" && k in value) {
        value = (value as Record<string, unknown>)[k];
      } else {
        // Fallback to English if key not found
        let fallback: unknown = translations.en;
        for (const fk of keys) {
          if (fallback && typeof fallback === "object" && fk in fallback) {
            fallback = (fallback as Record<string, unknown>)[fk];
          } else {
            return key; 
          }
        }
        value = typeof fallback === "string" ? fallback : key;
        break;
      }
    }
    let result = typeof value === "string" ? value : key;
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        result = result.replace(new RegExp(`{${k}}`, "g"), String(v));
      });
    }
    return result;
  }, [locale]);
  // Prevent hydration mismatch
  if (!hydrated) {
    return null;
  }
  return (
    <I18nContext.Provider value={{ locale, setLocale, t, isLoading }}>
      {children}
    </I18nContext.Provider>
  );
}

// Hook to use translations
export function useTranslation() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useTranslation must be used within an I18nProvider");
  }
  return context;
}
