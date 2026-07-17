"use client";

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import enMessages from "@/public/locales/en.json";
import amMessages from "@/public/locales/am.json";

type Locale = "en" | "am";
type Messages = typeof enMessages;

const messages: Record<Locale, Messages> = { en: enMessages, am: amMessages };

function getNestedValue(obj: any, path: string): string {
  return path.split(".").reduce((acc, key) => acc?.[key], obj) ?? path;
}

type I18nContextType = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string) => string;
};

const I18nContext = createContext<I18nContextType>({
  locale: "en",
  setLocale: () => {},
  t: (key) => key,
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    const saved = localStorage.getItem("addisbet-locale") as Locale | null;
    if (saved === "am" || saved === "en") setLocaleState(saved);
  }, []);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    localStorage.setItem("addisbet-locale", l);
  }, []);

  const t = useCallback(
    (key: string) => getNestedValue(messages[locale], key),
    [locale],
  );

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
