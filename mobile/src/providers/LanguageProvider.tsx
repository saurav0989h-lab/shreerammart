import { createContext, useCallback, useContext, useMemo, useState, ReactNode } from 'react';
import translations from '../translations';

interface LanguageContextValue {
  language: 'en' | 'np';
  t: (key: keyof typeof translations['en']) => string;
  toggle: () => void;
  setLanguage: (lang: 'en' | 'np') => void;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<'en' | 'np'>('en');

  const t = useCallback(
    (key: keyof typeof translations['en']) => {
      return translations[language][key] || translations.en[key] || (key as string);
    },
    [language]
  );

  const value = useMemo(
    () => ({ language, t, toggle: () => setLanguage(prev => (prev === 'en' ? 'np' : 'en')), setLanguage }),
    [language, t]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
