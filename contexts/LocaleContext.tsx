'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { type Locale, defaultLocale, locales } from '@/i18n/config';

// Import all messages statically for SSG
import enMessages from '@/messages/en.json';
import trMessages from '@/messages/tr.json';

type Messages = typeof enMessages;

const allMessages: Record<Locale, Messages> = {
  en: enMessages,
  tr: trMessages,
};

const LOCALE_STORAGE_KEY = 'locale';

interface LocaleContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
  messages: Messages;
}

const LocaleContext = createContext<LocaleContextType | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);
  const [isHydrated, setIsHydrated] = useState(false);

  // Hydration: read from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY) as Locale | null;
    if (stored && locales.includes(stored)) {
      setLocaleState(stored);
    }
    setIsHydrated(true);
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem(LOCALE_STORAGE_KEY, newLocale);
    // Update html lang attribute
    document.documentElement.lang = newLocale;
  }, []);

  // Translation function: supports nested keys like "common.appName"
  const t = useCallback(
    (key: string): string => {
      const keys = key.split('.');
      let value: unknown = allMessages[locale];

      for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
          value = (value as Record<string, unknown>)[k];
        } else {
          // Key not found, return the key itself
          return key;
        }
      }

      return typeof value === 'string' ? value : key;
    },
    [locale]
  );

  const messages = allMessages[locale];

  // During SSR/SSG, render with default locale to avoid hydration mismatch
  // The actual locale will be applied after hydration
  const contextValue: LocaleContextType = {
    locale: isHydrated ? locale : defaultLocale,
    setLocale,
    t,
    messages: isHydrated ? messages : allMessages[defaultLocale],
  };

  return (
    <LocaleContext.Provider value={contextValue}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  return context.locale;
}

export function useSetLocale() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error('useSetLocale must be used within a LocaleProvider');
  }
  return context.setLocale;
}

export function useTranslations() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error('useTranslations must be used within a LocaleProvider');
  }
  return context.t;
}

export function useMessages() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error('useMessages must be used within a LocaleProvider');
  }
  return context.messages;
}
