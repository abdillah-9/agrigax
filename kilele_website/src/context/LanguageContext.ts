import { createContext, useContext } from 'react';
import type { Translations } from '../i18n/translations';

export type Lang = 'en' | 'sw';

export interface LanguageValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: Translations;
}

export const LanguageContext = createContext<LanguageValue | null>(null);

export function useLanguage(): LanguageValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
