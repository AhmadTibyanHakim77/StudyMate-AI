'use client';

import React, { createContext, useContext, useSyncExternalStore } from 'react';
import { translations, type Language, type TranslationType } from './translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TranslationType;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

function getLanguageSnapshot(): Language {
  const savedLanguage = localStorage.getItem('studymate-language');
  if (savedLanguage && savedLanguage in translations) {
    return savedLanguage as Language;
  }
  return navigator.language.split('-')[0] === 'id' ? 'id' : 'en';
}

function subscribeToLanguage(onChange: () => void) {
  window.addEventListener('storage', onChange);
  window.addEventListener('studymate-language-change', onChange);
  return () => {
    window.removeEventListener('storage', onChange);
    window.removeEventListener('studymate-language-change', onChange);
  };
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const language = useSyncExternalStore<Language>(subscribeToLanguage, getLanguageSnapshot, () => 'en');

  const setLanguage = (lang: Language) => {
    localStorage.setItem('studymate-language', lang);
    window.dispatchEvent(new Event('studymate-language-change'));
  };

  const t = translations[language];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
