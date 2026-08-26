'use client';

import {
  createContext,
  useContext,
  useEffect,
  useSyncExternalStore,
  type ReactNode,
} from 'react';

export type ThemePreference = 'light' | 'dark' | 'system';

type ThemeContextValue = {
  theme: ThemePreference;
  setTheme: (theme: ThemePreference) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

const THEME_KEY = 'theme';
const THEME_EVENT = 'theme-change';

function getTheme(): ThemePreference {
  const savedTheme = localStorage.getItem(THEME_KEY);

  if (
    savedTheme === 'light' ||
    savedTheme === 'dark' ||
    savedTheme === 'system'
  ) {
    return savedTheme;
  }

  return 'system';
}

function getServerTheme(): ThemePreference {
  return 'system';
}

function subscribe(callback: () => void) {
  window.addEventListener('storage', callback);
  window.addEventListener(THEME_EVENT, callback);

  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener(THEME_EVENT, callback);
  };
}

function applyTheme(theme: ThemePreference) {
  const isDark =
    theme === 'dark' ||
    (theme === 'system' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches);

  document.documentElement.classList.toggle('dark', isDark);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useSyncExternalStore(subscribe, getTheme, getServerTheme);

  useEffect(() => {
    applyTheme(theme);

    if (theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = () => {
      applyTheme('system');
    };

    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [theme]);

  const setTheme = (newTheme: ThemePreference) => {
    localStorage.setItem(THEME_KEY, newTheme);
    window.dispatchEvent(new Event(THEME_EVENT));
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme must be used inside ThemeProvider');
  }

  return context;
}
