import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { LanguageContext, type Lang } from './LanguageContext';
import { TRANSLATIONS } from '../i18n/translations';

const STORAGE_KEY = 'kilele_lang';

function initialLang(): Lang {
  // Allow forcing a language via URL, e.g. /?lang=sw — handy for shared links.
  const fromQuery = new URLSearchParams(window.location.search).get('lang');
  if (fromQuery === 'sw' || fromQuery === 'en') return fromQuery;
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved === 'sw' || saved === 'en' ? saved : 'en';
}

function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(initialLang);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, lang);
    document.documentElement.lang = lang;
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: TRANSLATIONS[lang] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export default LanguageProvider;
