'use client';

import React, { createContext, useContext, useEffect, useSyncExternalStore } from 'react';

export type Theme = 'midnight-purple' | 'light-academic' | 'ocean-blue' | 'forest-green' | 'rose-pink' | 'warm-sand';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
const defaultTheme: Theme = 'midnight-purple';

function getThemeSnapshot(): Theme {
  const savedTheme = localStorage.getItem('studymate-theme');
  const validThemes: Theme[] = ['midnight-purple', 'light-academic', 'ocean-blue', 'forest-green', 'rose-pink', 'warm-sand'];
  return validThemes.find((theme) => theme === savedTheme) ?? defaultTheme;
}

function subscribeToTheme(onChange: () => void) {
  window.addEventListener('storage', onChange);
  window.addEventListener('studymate-theme-change', onChange);
  return () => {
    window.removeEventListener('storage', onChange);
    window.removeEventListener('studymate-theme-change', onChange);
  };
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useSyncExternalStore(subscribeToTheme, getThemeSnapshot, () => defaultTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    localStorage.setItem('studymate-theme', newTheme);
    window.dispatchEvent(new Event('studymate-theme-change'));
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
