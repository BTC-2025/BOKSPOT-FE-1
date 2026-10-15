'use client';

import { useEffect } from 'react';
import { useUIStore } from '../lib/store';

export function ThemeManager() {
  const { theme } = useUIStore();

  useEffect(() => {
    const root = document.documentElement;

    const applyTheme = (currentTheme: 'system' | 'light' | 'dark') => {
      const isLight =
        currentTheme === 'light' ||
        (currentTheme === 'system' && window.matchMedia('(prefers-color-scheme: light)').matches);

      if (isLight) {
        root.classList.add('light');
        root.classList.remove('dark');
        root.setAttribute('data-theme', 'light');
        if (document.body) {
          document.body.classList.add('light');
          document.body.classList.remove('dark');
          document.body.setAttribute('data-theme', 'light');
        }
      } else {
        root.classList.remove('light');
        root.classList.add('dark');
        root.setAttribute('data-theme', 'dark');
        if (document.body) {
          document.body.classList.remove('light');
          document.body.classList.add('dark');
          document.body.setAttribute('data-theme', 'dark');
        }
      }
    };

    applyTheme(theme);

    // Listen to changes in system preferences if theme is system
    const mediaQuery = window.matchMedia('(prefers-color-scheme: light)');
    const handleSystemChange = (e: MediaQueryListEvent) => {
      if (theme === 'system') {
        if (e.matches) {
          root.classList.add('light');
          root.classList.remove('dark');
          root.setAttribute('data-theme', 'light');
        } else {
          root.classList.remove('light');
          root.classList.add('dark');
          root.setAttribute('data-theme', 'dark');
        }
      }
    };

    // Use standard modern EventTarget API listener
    mediaQuery.addEventListener('change', handleSystemChange);
    return () => mediaQuery.removeEventListener('change', handleSystemChange);
  }, [theme]);

  return null;
}
