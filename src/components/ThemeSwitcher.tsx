'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useTheme, Theme } from './ThemeProvider';
import { Palette } from 'lucide-react';

const themes: { id: Theme; name: string; color: string }[] = [
  { id: 'midnight-purple', name: 'Midnight Purple', color: '#7C6CFF' },
  { id: 'light-academic', name: 'Light Academic', color: '#6D5AE6' },
  { id: 'ocean-blue', name: 'Ocean Blue', color: '#38BDF8' },
  { id: 'forest-green', name: 'Forest Green', color: '#4ADE80' },
  { id: 'rose-pink', name: 'Rose Pink', color: '#F472B6' },
  { id: 'warm-sand', name: 'Warm Sand', color: '#B7791F' },
];

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeTheme = themes.find((t) => t.id === theme) || themes[0];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm text-card-foreground shadow-sm hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        aria-label="Select Theme"
        aria-expanded={isOpen}
      >
        <Palette className="h-4 w-4" />
        <span className="hidden sm:inline">{activeTheme.name}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-48 rounded-md border border-border bg-card p-1 shadow-card z-50">
          {themes.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                setTheme(t.id);
                setIsOpen(false);
              }}
              className={`flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-sm transition-colors hover:bg-accent hover:text-accent-foreground ${
                theme === t.id ? 'bg-primary/10 text-primary font-medium' : 'text-card-foreground'
              }`}
            >
              <span>{t.name}</span>
              <span
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: t.color }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
