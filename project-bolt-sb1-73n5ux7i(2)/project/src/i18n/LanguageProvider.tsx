import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { readStoredChoice, writeStoredChoice } from '@/lib/storage';
import { ar, en, type TranslationKey } from '@/i18n/translations';

export type Language = 'en' | 'ar';

const LANGUAGE_KEY = '8squared-language';
const LANGUAGES: readonly Language[] = ['en', 'ar'];

type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: TranslationKey, values?: Record<string, string | number>) => string;
  pick: (english: string | null | undefined, arabic: string | null | undefined) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

const dictionaries = { en, ar } as const;

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => readStoredChoice(LANGUAGE_KEY, LANGUAGES, 'en'));

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);

  const setLanguage = useCallback((next: Language) => {
    writeStoredChoice(LANGUAGE_KEY, next);
    setLanguageState(next);
  }, []);

  const value = useMemo<LanguageContextValue>(() => {
    const dictionary = dictionaries[language];
    return {
      language,
      setLanguage,
      t: (key, values) => {
        let text: string = dictionary[key];
        if (values) {
          for (const [name, replacement] of Object.entries(values)) {
            text = text.replace(`{${name}}`, String(replacement));
          }
        }
        return text;
      },
      pick: (english, arabic) => {
        if (language === 'ar' && arabic) return arabic;
        return english ?? '';
      },
    };
  }, [language, setLanguage]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used inside LanguageProvider');
  return context;
}
